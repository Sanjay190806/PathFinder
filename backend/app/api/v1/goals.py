from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.goal import Goal
from backend.app.schemas.goal import GoalOut
from backend.app.core.career_catalog import get_career_catalog, CareerRoleDefinition

router = APIRouter(prefix="/goals", tags=["Goals & Career Domain Catalog"])

@router.get("", response_model=List[GoalOut])
def get_user_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.profile:
        return []
    goals = db.query(Goal).filter(Goal.profile_id == current_user.profile.id).all()
    return [GoalOut.model_validate(g) for g in goals]

@router.get("/catalog", response_model=List[CareerRoleDefinition])
def get_career_roles_catalog():
    """Returns the authoritative dynamic career domain catalog."""
    return get_career_catalog()

@router.get("/templates", response_model=List[CareerRoleDefinition])
def get_goal_templates():
    """Backward-compatible alias for goal templates."""
    return get_career_catalog()
