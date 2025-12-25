from __future__ import annotations

import hashlib
import uuid
from datetime import datetime
from typing import Dict, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from . import events, rewards

router = APIRouter(prefix="/game/preview", tags=["game-preview"])


class GamePreviewStartResponse(BaseModel):
    matchId: str
    status: Literal["STARTED"]


class GamePreviewFinishRequest(BaseModel):
    matchId: str
    outcome: Literal["WIN", "LOSS", "DRAW"]
    modelId: str


class GameMatchResultDTO(BaseModel):
    matchId: str
    modelId: str
    outcome: Literal["WIN", "LOSS", "DRAW"]
    rewardTicket: Optional[rewards.RewardTicketDTO] = None


_MATCHES: Dict[str, Dict[str, str]] = {}


def _deterministic_pick(match_id: str) -> int:
    seed = hashlib.sha256(match_id.encode()).hexdigest()
    return int(seed[:8], 16)


def _build_reward_ticket(match_id: str, outcome: str) -> rewards.RewardTicketDTO:
    now = datetime.utcnow().isoformat()
    if outcome == "WIN":
        roll = _deterministic_pick(match_id) % 2
        reward = (
            rewards.RewardTicketReward(kind="GOLD_POINTS", amount=50)
            if roll == 0
            else rewards.RewardTicketReward(kind="PERK_ITEM", perkId="perk_earn_boost_10")
        )
    elif outcome == "DRAW":
        reward = rewards.RewardTicketReward(kind="GOLD_POINTS", amount=20)
    else:
        reward = rewards.RewardTicketReward(kind="GOLD_POINTS", amount=10)

    ticket = rewards.RewardTicketDTO(
        id=f"ticket-{match_id}",
        createdAt=now,
        source="GAME_MATCH",
        status="PENDING",
        reward=reward,
    )
    return rewards.add_ticket(ticket)


@router.post("/start", response_model=GamePreviewStartResponse)
def start_match() -> GamePreviewStartResponse:
    match_id = f"match-{uuid.uuid4()}"
    _MATCHES[match_id] = {"status": "STARTED"}
    events.append_event("GAME_MATCH_STARTED", {"matchId": match_id})
    return GamePreviewStartResponse(matchId=match_id, status="STARTED")


@router.post("/finish", response_model=GameMatchResultDTO)
def finish_match(payload: GamePreviewFinishRequest) -> GameMatchResultDTO:
    if payload.matchId not in _MATCHES:
        raise HTTPException(status_code=404, detail="Match not found")

    _MATCHES[payload.matchId] = {"status": "FINISHED", "outcome": payload.outcome}
    ticket = _build_reward_ticket(payload.matchId, payload.outcome)
    events.append_event(
        "GAME_MATCH_FINISHED",
        {"matchId": payload.matchId, "outcome": payload.outcome, "modelId": payload.modelId},
    )
    events.append_event(
        "REWARD_TICKET_CREATED",
        {"matchId": payload.matchId, "ticketId": ticket.id, "rewardKind": ticket.reward.kind},
    )
    return GameMatchResultDTO(
        matchId=payload.matchId,
        modelId=payload.modelId,
        outcome=payload.outcome,
        rewardTicket=ticket,
    )
