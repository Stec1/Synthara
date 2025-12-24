from __future__ import annotations

from datetime import datetime
from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session

from . import models
from .config import get_app_env
from .database import create_db_and_tables
from .dependencies import get_current_user, get_db_session
from .routers import economy as economy_router
from .routers import models as models_router
from .routers import rewards as rewards_router
from .schemas import AuthStartRequest, AuthStartResponse, AuthVerifyRequest, AuthVerifyResponse, UserRead

app = FastAPI(title="Synthara 3.0 API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    create_db_and_tables()


@app.post("/auth/email/start", response_model=AuthStartResponse)
def start_email_auth(_: AuthStartRequest) -> AuthStartResponse:
    return AuthStartResponse(status="sent")


@app.post("/auth/email/verify", response_model=AuthVerifyResponse)
def verify_email_code(_: AuthVerifyRequest) -> AuthVerifyResponse:
    return AuthVerifyResponse(token="dev-token")


@app.get("/me", response_model=UserRead)
def read_current_user(user: Annotated[models.User, Depends(get_current_user)]) -> UserRead:
    return UserRead(
        id=user.id or 0, email=user.email, role=user.role, created_at=datetime.utcnow()
    )


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "env": get_app_env()}


@app.get("/games", response_model=list[models.GameEvent])
def list_games(session: Session = Depends(get_db_session)) -> list[models.GameEvent]:
    return _get_or_seed_games(session)


@app.get("/games/rooms", response_model=list[models.GameEvent])
def list_game_rooms(session: Session = Depends(get_db_session)) -> list[models.GameEvent]:
    return _get_or_seed_games(session)


app.include_router(models_router.router)
app.include_router(economy_router.router)
app.include_router(economy_router.read_router)
app.include_router(rewards_router.router)


def _get_or_seed_games(session: Session) -> list[models.GameEvent]:
    events = session.query(models.GameEvent).all()
    if not events:
        fallback = models.GameEvent(name="Durak Arena", required_gold=1)
        session.add(fallback)
        session.commit()
        session.refresh(fallback)
        events = [fallback]
    return events
