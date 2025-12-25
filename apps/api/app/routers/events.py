from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/events", tags=["events"])

EventType = Literal["GOLD_EARNED", "GOLD_SPENT", "PERK_PURCHASED", "REWARD_CLAIMED"]


class EventLogRequest(BaseModel):
    eventType: EventType
    metadata: Optional[Dict[str, Any]] = None


class EventLogResponse(BaseModel):
    ok: bool


_EVENT_LOG: List[Dict[str, Any]] = []


@router.post("/log", response_model=EventLogResponse)
def log_event(payload: EventLogRequest) -> EventLogResponse:
    entry = {"eventType": payload.eventType, "metadata": payload.metadata or {}, "ts": datetime.utcnow().isoformat()}
    _EVENT_LOG.append(entry)
    print(f"[event-log] {entry}")
    return EventLogResponse(ok=True)
