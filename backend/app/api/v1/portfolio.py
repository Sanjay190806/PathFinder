from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.portfolio import ArtifactCreate, ArtifactOut, PortfolioOut
from backend.app.portfolio.portfolio_engine import PortfolioEngine

router = APIRouter(prefix="/portfolio", tags=["Phase 8 Portfolio & Evidence"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=PortfolioOut)
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PortfolioEngine(db)
    return engine.get_or_create_portfolio(profile_id=profile.id)

@router.post("/artifacts", response_model=PortfolioOut)
def add_portfolio_artifact(
    payload: ArtifactCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = PortfolioEngine(db)
    return engine.add_artifact(profile_id=profile.id, artifact_in=payload)
