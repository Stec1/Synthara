from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from .models import Auction, GoldNFTDrop, LoRAAsset, ModelProfile, User


class AuthStartResponse(BaseModel):
    status: str


class AuthVerifyResponse(BaseModel):
    token: str


class AuthStartRequest(BaseModel):
    email: str


class AuthVerifyRequest(BaseModel):
    code: str | None = None


class UserRead(BaseModel):
    id: int
    email: str
    role: str
    created_at: datetime

    class Config:
        orm_mode = True


class ModelProfileBase(BaseModel):
    name: str
    tagline: str
    tags: List[str] = []
    bio: Optional[str] = None


class ModelProfileCreate(ModelProfileBase):
    pass


class ModelProfileUpdate(BaseModel):
    name: Optional[str] = None
    tagline: Optional[str] = None
    tags: Optional[List[str]] = None
    bio: Optional[str] = None


class ModelProfileRead(ModelProfileBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class LoRABase(BaseModel):
    version: str
    passport_metadata: str


class LoRACreate(LoRABase):
    pass


class LoRARead(LoRABase):
    id: int
    model_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class GoldDropBase(BaseModel):
    price: float
    supply: int
    remaining: int
    status: str = "upcoming"


class GoldDropCreate(GoldDropBase):
    pass


class GoldDropRead(GoldDropBase):
    id: int
    model_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class AuctionBase(BaseModel):
    current_bid: float
    ends_at: datetime


class AuctionCreate(AuctionBase):
    pass


class AuctionRead(AuctionBase):
    id: int
    model_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ModelGoldStatus(BaseModel):
    drop: Optional[GoldDropRead]
    auction: Optional[AuctionRead]


class GameEventRead(BaseModel):
    id: int
    name: str
    required_gold: int
    created_at: datetime

    class Config:
        orm_mode = True


class ModelProfileDetail(ModelProfileRead):
    loras: List[LoRARead] = []
    gold: ModelGoldStatus
