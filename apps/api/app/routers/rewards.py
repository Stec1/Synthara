from __future__ import annotations

from datetime import datetime, timedelta
from typing import Dict, List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/rewards", tags=["rewards"])


class PerkInventoryItemDTO(BaseModel):
    id: str
    perkId: str
    acquiredAt: str
    source: Literal["SHOP_PURCHASE", "REWARD_TICKET", "ADMIN_GRANT"]
    expiresAt: Optional[str] = None
    remainingUses: Optional[int] = None


class NftInventoryItemDTO(BaseModel):
    id: str
    name: str
    tier: Literal["silver", "gold", "diamond"] = "gold"
    createdAt: str
    sourcePerkId: Optional[str] = None
    chain: Optional[str] = None
    isPlaceholder: Optional[bool] = None


class InventoryDTO(BaseModel):
    perks: List[PerkInventoryItemDTO]
    nfts: List[NftInventoryItemDTO]


class RewardTicketReward(BaseModel):
    kind: Literal["GOLD_POINTS", "PERK_ITEM", "NFT_PLACEHOLDER"]
    amount: Optional[int] = None
    perkId: Optional[str] = None
    name: Optional[str] = None
    tier: Optional[Literal["silver", "gold", "diamond"]] = None


class RewardTicketDTO(BaseModel):
    id: str
    createdAt: str
    source: Literal["GAME_MATCH", "EVENT", "ADMIN"]
    status: Literal["PENDING", "CLAIMED", "EXPIRED"]
    expiresAt: Optional[str] = None
    reward: RewardTicketReward


class ClaimRewardTicketRequestDTO(BaseModel):
    ticketId: str


class ClaimRewardTicketResponseDTO(BaseModel):
    ok: bool
    ticket: Optional[RewardTicketDTO] = None
    inventoryDelta: Optional[InventoryDTO] = None
    goldDelta: Optional[int] = None
    error: Optional[str] = None


FAKE_USER_ID = "dev"
_TICKETS: Dict[str, List[RewardTicketDTO]] = {}


def _seed_tickets() -> List[RewardTicketDTO]:
    now = datetime.utcnow()
    tickets = [
        RewardTicketDTO(
            id="ticket-gold-1",
            createdAt=(now - timedelta(days=1)).isoformat(),
            source="GAME_MATCH",
            status="PENDING",
            expiresAt=(now + timedelta(days=7)).isoformat(),
            reward=RewardTicketReward(kind="GOLD_POINTS", amount=150),
        ),
        RewardTicketDTO(
            id="ticket-perk-1",
            createdAt=(now - timedelta(days=2)).isoformat(),
            source="EVENT",
            status="PENDING",
            expiresAt=(now + timedelta(days=5)).isoformat(),
            reward=RewardTicketReward(kind="PERK_ITEM", perkId="perk_earn_boost_10"),
        ),
        RewardTicketDTO(
            id="ticket-nft-1",
            createdAt=(now - timedelta(days=3)).isoformat(),
            source="ADMIN",
            status="CLAIMED",
            reward=RewardTicketReward(kind="NFT_PLACEHOLDER", name="Mystery Drop", tier="gold"),
        ),
    ]
    _TICKETS[FAKE_USER_ID] = tickets
    return tickets


def get_tickets(user_id: str = FAKE_USER_ID) -> List[RewardTicketDTO]:
    if user_id not in _TICKETS:
        return _seed_tickets()
    return _TICKETS[user_id]


def add_ticket(ticket: RewardTicketDTO, user_id: str = FAKE_USER_ID) -> RewardTicketDTO:
    tickets = get_tickets(user_id)
    existing = next((item for item in tickets if item.id == ticket.id), None)
    if existing:
        return existing
    tickets.insert(0, ticket)
    _TICKETS[user_id] = tickets
    return ticket


@router.get("/tickets/me", response_model=List[RewardTicketDTO])
def list_my_tickets() -> List[RewardTicketDTO]:
    return get_tickets()


@router.post("/tickets/claim", response_model=ClaimRewardTicketResponseDTO)
def claim_ticket(payload: ClaimRewardTicketRequestDTO) -> ClaimRewardTicketResponseDTO:
    tickets = get_tickets()
    ticket = next((item for item in tickets if item.id == payload.ticketId), None)
    if ticket is None:
        return ClaimRewardTicketResponseDTO(ok=False, error="Ticket not found")
    if ticket.status != "PENDING":
        return ClaimRewardTicketResponseDTO(ok=False, ticket=ticket, error="Ticket already processed")
    if ticket.expiresAt and datetime.fromisoformat(ticket.expiresAt) < datetime.utcnow():
        ticket.status = "EXPIRED"
        return ClaimRewardTicketResponseDTO(ok=False, ticket=ticket, error="Ticket expired")

    inventory_delta = InventoryDTO(perks=[], nfts=[])
    gold_delta: Optional[int] = None

    if ticket.reward.kind == "GOLD_POINTS":
        gold_delta = ticket.reward.amount or 0
    elif ticket.reward.kind == "PERK_ITEM":
        inventory_delta.perks.append(
            PerkInventoryItemDTO(
                id=f"perk-{int(datetime.utcnow().timestamp())}",
                perkId=ticket.reward.perkId or "perk_unknown",
                acquiredAt=datetime.utcnow().isoformat(),
                source="REWARD_TICKET",
            )
        )
    elif ticket.reward.kind == "NFT_PLACEHOLDER":
        inventory_delta.nfts.append(
            NftInventoryItemDTO(
                id=f"nft-{int(datetime.utcnow().timestamp())}",
                name=ticket.reward.name or "Placeholder NFT",
                tier=ticket.reward.tier or "gold",
                createdAt=datetime.utcnow().isoformat(),
                sourcePerkId=None,
                isPlaceholder=True,
            )
        )

    ticket.status = "CLAIMED"
    return ClaimRewardTicketResponseDTO(
        ok=True, ticket=ticket, inventoryDelta=inventory_delta, goldDelta=gold_delta
    )
