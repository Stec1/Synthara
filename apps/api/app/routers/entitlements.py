from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

from . import economy, rewards

router = APIRouter(prefix="/entitlements", tags=["entitlements"])

EntitlementKey = Literal[
    "CAN_CLAIM_DAILY_GOLD",
    "CAN_USE_EARNING_ACTIONS",
    "HAS_ACTIVE_GOLD_PASS",
    "CAN_ACCESS_GAME_ROOM",
    "CAN_CLAIM_REWARD_TICKET",
    "CAN_VIEW_LORA_PASSPORT",
]


class UserEntitlementDTO(BaseModel):
    key: EntitlementKey
    value: bool
    source: Optional[Literal["PERK", "NFT", "SYSTEM"]] = None
    expiresAt: Optional[str] = None


class UserEntitlementsDTO(BaseModel):
    updatedAt: str
    entitlements: List[UserEntitlementDTO]


def _is_active_perk_item(item: Dict[str, Any]) -> bool:
    expires_at = item.get("expiresAt")
    if isinstance(expires_at, str):
        try:
            if datetime.fromisoformat(expires_at) < datetime.utcnow():
                return False
        except ValueError:
            pass
    remaining_uses = item.get("remainingUses")
    if isinstance(remaining_uses, (int, float)) and remaining_uses <= 0:
        return False
    return True


def _compute_entitlements() -> UserEntitlementsDTO:
    snapshot = economy.get_snapshot()
    gold_pass = snapshot.get("goldPass") if isinstance(snapshot, dict) else {}
    owned_perks: Dict[str, bool] = snapshot.get("ownedPerks", {}) if isinstance(snapshot, dict) else {}
    perk_inventory = snapshot.get("perkInventory") if isinstance(snapshot, dict) else []

    active_perk_ids = {
        item.get("perkId")
        for item in perk_inventory
        if isinstance(item, dict) and item.get("perkId") and _is_active_perk_item(item)
    }
    active_perk_ids.update({perk_id for perk_id, owned in owned_perks.items() if owned})

    gold_pass_active = False
    gold_pass_expires_at: Optional[str] = None
    if isinstance(gold_pass, dict):
        gold_pass_expires_at = gold_pass.get("expiresAt") if isinstance(gold_pass.get("expiresAt"), str) else None
        gold_pass_active = bool(gold_pass.get("active"))
        if gold_pass_expires_at:
            try:
                if datetime.fromisoformat(gold_pass_expires_at) < datetime.utcnow():
                    gold_pass_active = False
            except ValueError:
                pass
    if "perk_gold_pass" in active_perk_ids:
        gold_pass_active = True

    pending_tickets = any(ticket.status == "PENDING" for ticket in rewards.get_tickets())

    entitlements = [
        UserEntitlementDTO(key="CAN_CLAIM_DAILY_GOLD", value=True, source="SYSTEM"),
        UserEntitlementDTO(key="CAN_USE_EARNING_ACTIONS", value=True, source="SYSTEM"),
        UserEntitlementDTO(
            key="HAS_ACTIVE_GOLD_PASS",
            value=gold_pass_active,
            source="SYSTEM",
            expiresAt=gold_pass_expires_at,
        ),
        UserEntitlementDTO(
            key="CAN_CLAIM_REWARD_TICKET",
            value=pending_tickets,
            source="SYSTEM",
        ),
    ]

    entitlements.append(
        UserEntitlementDTO(
            key="CAN_ACCESS_GAME_ROOM",
            value=gold_pass_active or "perk_priority_matchmaking" in active_perk_ids,
            source="PERK" if "perk_priority_matchmaking" in active_perk_ids else "SYSTEM",
        )
    )
    entitlements.append(
        UserEntitlementDTO(
            key="CAN_VIEW_LORA_PASSPORT",
            value=gold_pass_active or "perk_creator_drop_access" in active_perk_ids,
            source="PERK" if "perk_creator_drop_access" in active_perk_ids else "SYSTEM",
        )
    )

    return UserEntitlementsDTO(updatedAt=datetime.utcnow().isoformat(), entitlements=entitlements)


@router.get("/me", response_model=UserEntitlementsDTO)
def get_my_entitlements() -> UserEntitlementsDTO:
    return _compute_entitlements()
