from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.planner.planner_engine import PlannerEngine
from backend.app.schemas.planner import (
    FullPlannerResponse, DailyPlanOut, WeeklyPlanOut, MonthlyPlanOut, MilestoneOut, PlanHistoryOut
)

router = APIRouter(prefix="/planner", tags=["Phase 9 Personalized Learning Planner"])

class RecalculateRequest(BaseModel):
    reason: Optional[str] = "Learner requested tactical schedule recalculation"

@router.get("", response_model=FullPlannerResponse)
def get_full_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    return engine.generate_plan(profile_id=current_user.profile.id, force_recalculate=False)

@router.get("/today", response_model=DailyPlanOut)
def get_today_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    plan = engine.generate_plan(profile_id=current_user.profile.id, force_recalculate=False)
    return plan.today

@router.get("/week", response_model=WeeklyPlanOut)
def get_week_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    plan = engine.generate_plan(profile_id=current_user.profile.id, force_recalculate=False)
    return plan.weekly

@router.get("/month", response_model=MonthlyPlanOut)
def get_month_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    plan = engine.generate_plan(profile_id=current_user.profile.id, force_recalculate=False)
    return plan.monthly

@router.get("/next-milestone", response_model=MilestoneOut)
def get_next_milestone(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    plan = engine.generate_plan(profile_id=current_user.profile.id, force_recalculate=False)
    return plan.next_milestone

@router.post("/recalculate", response_model=FullPlannerResponse)
def recalculate_plan(
    body: RecalculateRequest = RecalculateRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    return engine.generate_plan(
        profile_id=current_user.profile.id,
        reason=body.reason or "Learner initiated schedule recalculation",
        force_recalculate=True
    )

@router.get("/history", response_model=List[PlanHistoryOut])
def get_plan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Learner profile not found.")
    engine = PlannerEngine(db)
    return engine.get_plan_history(profile_id=current_user.profile.id)
