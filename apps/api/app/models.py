from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str
    role: str = Field(default="fan")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ModelProfile(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    tagline: str
    tags: str = Field(default="")
    bio: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LoRAAsset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="modelprofile.id")
    version: str
    passport_metadata: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GoldNFTDrop(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="modelprofile.id")
    price: float
    supply: int
    remaining: int
    status: str = Field(default="upcoming")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Auction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    model_id: int = Field(foreign_key="modelprofile.id")
    current_bid: float
    ends_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GameEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    required_gold: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
