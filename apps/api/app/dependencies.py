from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlmodel import Session

from .config import get_admin_api_key, is_canonical_env, is_dev_env
from .database import get_session
from .models import User


async def get_current_user(
    authorization: Annotated[str | None, Header(alias="Authorization")],
) -> User:
    token = _parse_token(authorization)
    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    return _build_user_from_token(token)


async def get_optional_user(
    authorization: Annotated[str | None, Header(alias="Authorization")],
) -> User | None:
    token = _parse_token(authorization)
    if token is None:
        return None

    return _build_user_from_token(token)


async def require_authenticated_write(
    user: Annotated[User | None, Depends(get_optional_user)]
) -> User:
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


async def require_write_access(
    user: Annotated[User | None, Depends(get_optional_user)]
) -> User | None:
    if is_canonical_env() and user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return user


def get_db_session() -> Session:
    with get_session() as session:
        yield session


def _parse_token(header_value: str | None) -> str | None:
    if header_value is None:
        return None
    token = header_value.replace("Bearer", "").strip()
    return token or None


def _build_user_from_token(token: str) -> User:
    if token != "dev-token":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return User(id=1, email="demo@synthara.ai", role="creator")


async def require_dev_admin(
    admin_key: Annotated[str | None, Header(alias="X-Admin-Key")]
) -> None:
    if not is_dev_env():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seeding is only available in dev",
        )

    expected = get_admin_api_key()
    if not expected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin key not configured",
        )

    if admin_key != expected:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin key")
