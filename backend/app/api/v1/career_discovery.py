"""
Career Discovery API (Phase 9 Stage 2)
Authenticated endpoint for discovering careers matched to Indian education profile and skills.
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.career_discovery.career_discovery_engine import CareerDiscoveryEngine
from backend.app.career_discovery.career_fit_scorer import CareerFitScore

router = APIRouter(prefix="/careers", tags=["Career Discovery"])

@router.get("/discover", response_model=List[CareerFitScore])
def discover_careers(
    q: Optional[str] = Query(None, description="Optional interest or domain query keyword"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Discovers and scores available career trajectories for the authenticated learner.
    Scoped strictly through current_user.profile to ensure complete user isolation.
    """
    profile = current_user.profile
    if not profile:
        profile = LearnerProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    engine = CareerDiscoveryEngine(db=db)
    return engine.discover_careers(profile, interest_query=q)

@router.get("/{career_slug}/discovery-fit", response_model=CareerFitScore)
def get_single_career_fit(
    career_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns fit scoring for a specific career slug for the authenticated learner."""
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    engine = CareerDiscoveryEngine(db=db)
    fit = engine.get_discovery_by_slug(profile, career_slug)
    if not fit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career '{career_slug}' not found in catalog."
        )
    return fit
