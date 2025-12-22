from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from .database import get_session
from .models import User


async def get_current_user(
    authorization: Annotated[str | None, Header(alias="Authorization")],
) -> User:
    if authorization is None or not authorization.replace("Bearer", "").strip():
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    token = authorization.replace("Bearer", "").strip()
    if token != "dev-token":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return User(id=1, email="demo@synthara.ai", role="creator")


def get_db_session() -> Session:
    with get_session() as session:
        yield session
