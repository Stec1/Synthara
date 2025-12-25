from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/events", tags=["events"])

EventType = Literal[
    "GOLD_EARNED",
    "GOLD_SPENT",
    "PERK_PURCHASED",
    "REWARD_CLAIMED",
    "GAME_MATCH_STARTED",
    "GAME_MATCH_FINISHED",
    "REWARD_TICKET_CREATED",
]


class EventLogRequest(BaseModel):
    eventType: EventType
    metadata: Optional[Dict[str, Any]] = None


class EventLogResponse(BaseModel):
    ok: bool


_EVENT_LOG: List[Dict[str, Any]] = []


def append_event(event_type: EventType, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    entry = {"eventType": event_type, "metadata": metadata or {}, "ts": datetime.utcnow().isoformat()}
    _EVENT_LOG.append(entry)
    print(f"[event-log] {entry}")
    return entry


@router.post("/log", response_model=EventLogResponse)
def log_event(payload: EventLogRequest) -> EventLogResponse:
    append_event(payload.eventType, payload.metadata)
    return EventLogResponse(ok=True)
