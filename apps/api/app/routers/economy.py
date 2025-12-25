from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from ..dependencies import require_write_access

router = APIRouter(prefix="/economy", tags=["economy"])
read_router = APIRouter(tags=["economy"])


class GoldShopPerkDTO(BaseModel):
    id: str
    title: str
    description: str
    priceGold: int
    roleGate: Optional[str] = None


class NftInventoryItemDTO(BaseModel):
    id: str
    name: str
    tier: str = "gold"
    createdAt: str
    sourcePerkId: Optional[str] = None
    chain: Optional[str] = None


class UserEconomySnapshotDTO(BaseModel):
    balance: int
    ownedPerks: Dict[str, bool]
    inventory: List[NftInventoryItemDTO]


class PurchasePerkRequestDTO(BaseModel):
    perkId: str


class PurchasePerkResponseDTO(BaseModel):
    ok: bool
    balance: int
    ownedPerks: Dict[str, bool]
    error: Optional[str] = None


class MintNftRequestDTO(BaseModel):
    tier: Optional[str] = None
    sourcePerkId: Optional[str] = None
    chain: Optional[str] = None


class MintNftResponseDTO(BaseModel):
    nft: NftInventoryItemDTO
    balance: int


PERK_CATALOG: List[GoldShopPerkDTO] = [
    GoldShopPerkDTO(
        id="perk_boost_daily",
        title="Daily Booster",
        description="Earn +20 extra Gold on every daily claim.",
        priceGold=25,
    ),
    GoldShopPerkDTO(
        id="perk_profile_badge",
        title="Profile Badge",
        description="Unlock an exclusive golden badge on your profile.",
        priceGold=50,
    ),
    GoldShopPerkDTO(
        id="perk_creator_drop_access",
        title="Creator Drop Access",
        description="Early access to featured creator drops and raffles.",
        priceGold=120,
    ),
    GoldShopPerkDTO(
        id="perk_priority_matchmaking",
        title="Priority Matchmaking",
        description="Skip queues and get matched faster in events.",
        priceGold=250,
        roleGate="creator",
    ),
]


FAKE_USER_ID = "dev"
_ECONOMY_STATE: Dict[str, Dict[str, object]] = {}


def get_snapshot(user_id: str = FAKE_USER_ID) -> Dict[str, object]:
    snapshot = _ECONOMY_STATE.setdefault(
        user_id,
        {
            "balance": 500,
            "ownedPerks": {},
            "inventory": [],
            "perkInventory": [],
            "goldPass": {"active": True, "expiresAt": None},
        },
    )
    snapshot.setdefault("ownedPerks", {})
    snapshot.setdefault("inventory", [])
    snapshot.setdefault("perkInventory", [])
    snapshot.setdefault("goldPass", {"active": False, "expiresAt": None})
    return snapshot


@router.get("/me", response_model=UserEconomySnapshotDTO)
def get_my_economy() -> UserEconomySnapshotDTO:
    snapshot = get_snapshot()
    return UserEconomySnapshotDTO(**snapshot)  # type: ignore[arg-type]


@router.get("/shop/perks", response_model=List[GoldShopPerkDTO])
def list_perks() -> List[GoldShopPerkDTO]:
    return PERK_CATALOG


@router.post("/perks/purchase", response_model=PurchasePerkResponseDTO)
def purchase_perk(
    payload: PurchasePerkRequestDTO,
    _user=Depends(require_write_access),
) -> PurchasePerkResponseDTO:
    snapshot = get_snapshot()
    perk = next((item for item in PERK_CATALOG if item.id == payload.perkId), None)
    if not perk:
        raise HTTPException(status_code=404, detail="Perk not found")

    owned_perks: Dict[str, bool] = snapshot["ownedPerks"]  # type: ignore[assignment]
    balance: int = snapshot["balance"]  # type: ignore[assignment]

    if owned_perks.get(payload.perkId):
        return PurchasePerkResponseDTO(
            ok=False, balance=balance, ownedPerks=owned_perks, error="Already owned"
        )

    if balance < perk.priceGold:
        return PurchasePerkResponseDTO(
            ok=False, balance=balance, ownedPerks=owned_perks, error="Insufficient balance"
        )

    owned_perks[payload.perkId] = True
    snapshot["balance"] = balance - perk.priceGold

    return PurchasePerkResponseDTO(ok=True, balance=snapshot["balance"], ownedPerks=owned_perks)


@router.post("/nfts/mint", response_model=MintNftResponseDTO)
def mint_nft(
    payload: MintNftRequestDTO,
    _user=Depends(require_write_access),
) -> MintNftResponseDTO:
    snapshot = get_snapshot()
    inventory: List[Dict[str, object]] = snapshot["inventory"]  # type: ignore[assignment]
    minted = {
        "id": f"nft-{int(datetime.utcnow().timestamp())}",
        "name": f"Demo NFT #{len(inventory) + 1}",
        "tier": payload.tier or "gold",
        "createdAt": datetime.utcnow().isoformat(),
        "sourcePerkId": payload.sourcePerkId,
        "chain": payload.chain,
    }
    minted_item = NftInventoryItemDTO(**minted)
    inventory.insert(0, minted_item.dict())
    return MintNftResponseDTO(nft=minted_item, balance=snapshot["balance"])


@read_router.get("/inventory/me", response_model=List[NftInventoryItemDTO])
def get_my_inventory() -> List[NftInventoryItemDTO]:
    snapshot = get_snapshot()
    inventory: List[Dict[str, object]] = snapshot["inventory"]  # type: ignore[assignment]
    return [NftInventoryItemDTO(**item) for item in inventory]
