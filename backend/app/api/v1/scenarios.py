from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.scenarios import ScenarioOut, ScenarioAttemptOut, ScenarioAttemptSubmit
from backend.app.scenarios.scenario_engine import ScenarioEngine

router = APIRouter(prefix="/scenarios", tags=["Phase 8 Engineering Scenarios"])

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("", response_model=List[ScenarioOut])
def list_scenarios(
    role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    engine = ScenarioEngine(db)
    return engine.list_scenarios(role=role)

@router.post("/{scenario_id}/submit", response_model=ScenarioAttemptOut)
def submit_scenario_attempt(
    scenario_id: str,
    payload: ScenarioAttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ScenarioEngine(db)
    try:
        return engine.evaluate_attempt(
            profile_id=profile.id,
            scenario_id=scenario_id,
            submission=payload
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@router.get("/attempts", response_model=List[ScenarioAttemptOut])
def list_scenario_attempts(
    scenario_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = ScenarioEngine(db)
    return engine.get_attempts(profile_id=profile.id, scenario_id=scenario_id)
