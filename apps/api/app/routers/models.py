from __future__ import annotations

from datetime import datetime, timedelta
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..dependencies import get_db_session, require_dev_admin, require_write_access
from ..models import Auction, GoldNFTDrop, LoRAAsset, ModelProfile
from ..schemas import (
  AuctionCreate,
  AuctionRead,
  GoldDropCreate,
  GoldDropRead,
  LoRACreate,
  LoRARead,
  ModelGoldStatus,
  ModelProfileCreate,
  ModelProfileDetail,
  ModelProfileRead,
  ModelProfileUpdate,
)

router = APIRouter(prefix="/models", tags=["models"])


@router.get("", response_model=List[ModelProfileRead])
def list_models(session: Session = Depends(get_db_session)) -> List[ModelProfileRead]:
    results = session.exec(select(ModelProfile)).all()
    return [
        ModelProfileRead(**model.dict(), tags=model.tags.split(",") if model.tags else [])
        for model in results
    ]


@router.post("", response_model=ModelProfileRead, status_code=status.HTTP_201_CREATED)
def create_model(
    payload: ModelProfileCreate,
    session: Session = Depends(get_db_session),
    _user=Depends(require_write_access),
) -> ModelProfileRead:
    model = ModelProfile(
        name=payload.name,
        tagline=payload.tagline,
        tags=",".join(payload.tags),
        bio=payload.bio,
    )
    session.add(model)
    session.commit()
    session.refresh(model)
    return ModelProfileRead(**model.dict(), tags=payload.tags)


@router.get("/{model_id}", response_model=ModelProfileDetail)
def get_model_detail(model_id: int, session: Session = Depends(get_db_session)) -> ModelProfileDetail:
    model = session.get(ModelProfile, model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    loras = session.exec(select(LoRAAsset).where(LoRAAsset.model_id == model_id)).all()
    drop = session.exec(select(GoldNFTDrop).where(GoldNFTDrop.model_id == model_id)).first()
    auction = session.exec(select(Auction).where(Auction.model_id == model_id)).first()

    return ModelProfileDetail(
        id=model.id,
        name=model.name,
        tagline=model.tagline,
        tags=model.tags.split(",") if model.tags else [],
        bio=model.bio,
        created_at=model.created_at,
        loras=[LoRARead(**lora.dict()) for lora in loras],
        gold=ModelGoldStatus(
            drop=GoldDropRead(**drop.dict()) if drop else None,
            auction=AuctionRead(**auction.dict()) if auction else None,
        ),
    )


@router.put("/{model_id}", response_model=ModelProfileRead)
def update_model(
    model_id: int,
    payload: ModelProfileUpdate,
    session: Session = Depends(get_db_session),
    _user=Depends(require_write_access),
) -> ModelProfileRead:
    model = session.get(ModelProfile, model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    if payload.name is not None:
        model.name = payload.name
    if payload.tagline is not None:
        model.tagline = payload.tagline
    if payload.tags is not None:
        model.tags = ",".join(payload.tags)
    if payload.bio is not None:
        model.bio = payload.bio

    session.add(model)
    session.commit()
    session.refresh(model)

    return ModelProfileRead(**model.dict(), tags=model.tags.split(",") if model.tags else [])


@router.get("/{model_id}/lora", response_model=List[LoRARead])
def list_loras(model_id: int, session: Session = Depends(get_db_session)) -> List[LoRARead]:
    return session.exec(select(LoRAAsset).where(LoRAAsset.model_id == model_id)).all()


@router.post("/{model_id}/lora", response_model=LoRARead, status_code=status.HTTP_201_CREATED)
def create_lora(
    model_id: int,
    payload: LoRACreate,
    session: Session = Depends(get_db_session),
    _user=Depends(require_write_access),
) -> LoRARead:
    model = session.get(ModelProfile, model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    lora = LoRAAsset(
        model_id=model_id, version=payload.version, passport_metadata=payload.passport_metadata
    )
    session.add(lora)
    session.commit()
    session.refresh(lora)
    return lora


@router.get("/{model_id}/gold", response_model=ModelGoldStatus)
def get_gold_status(model_id: int, session: Session = Depends(get_db_session)) -> ModelGoldStatus:
    drop = session.exec(select(GoldNFTDrop).where(GoldNFTDrop.model_id == model_id)).first()
    auction = session.exec(select(Auction).where(Auction.model_id == model_id)).first()
    return ModelGoldStatus(
        drop=GoldDropRead(**drop.dict()) if drop else None,
        auction=AuctionRead(**auction.dict()) if auction else None,
    )


@router.post("/{model_id}/gold/drop", response_model=GoldDropRead, status_code=status.HTTP_201_CREATED)
def create_gold_drop(
    model_id: int,
    payload: GoldDropCreate,
    session: Session = Depends(get_db_session),
    _user=Depends(require_write_access),
) -> GoldDropRead:
    model = session.get(ModelProfile, model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    drop = GoldNFTDrop(
        model_id=model_id,
        price=payload.price,
        supply=payload.supply,
        remaining=payload.remaining,
        status=payload.status,
    )
    session.add(drop)
    session.commit()
    session.refresh(drop)
    return drop


@router.post("/{model_id}/gold/auction", response_model=AuctionRead, status_code=status.HTTP_201_CREATED)
def create_gold_auction(
    model_id: int,
    payload: AuctionCreate,
    session: Session = Depends(get_db_session),
    _user=Depends(require_write_access),
) -> AuctionRead:
    model = session.get(ModelProfile, model_id)
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    auction = Auction(
        model_id=model_id,
        current_bid=payload.current_bid,
        ends_at=payload.ends_at,
    )
    session.add(auction)
    session.commit()
    session.refresh(auction)
    return auction


@router.post("/seed", response_model=List[ModelProfileRead], status_code=status.HTTP_201_CREATED)
def seed_demo_content(
    session: Session = Depends(get_db_session),
    _admin=Depends(require_dev_admin),
) -> List[ModelProfileRead]:
    if session.exec(select(ModelProfile)).first():
        return list_models(session)

    base_models = [
        ModelProfile(
            name="Aurora",
            tagline="Neon muse for Gen-Z",
            tags="ai,creator,fashion",
            bio="Synth pop aesthetic with loyal fanbase.",
        ),
        ModelProfile(
            name="Nyx",
            tagline="Cyber witch with lore drops",
            tags="ai,gaming,lora",
            bio="Dark academia meets future spells.",
        ),
    ]
    for model in base_models:
        session.add(model)
    session.commit()

    for model in session.exec(select(ModelProfile)).all():
        lora = LoRAAsset(model_id=model.id, version="v1.0", passport_metadata="Initial release")
        session.add(lora)
        drop = GoldNFTDrop(model_id=model.id, price=99.0, supply=100, remaining=80, status="live")
        auction = Auction(
            model_id=model.id,
            current_bid=250.0,
            ends_at=datetime.utcnow() + timedelta(days=1),
        )
        session.add(drop)
        session.add(auction)
    session.commit()
    return list_models(session)
