from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database import get_db
from backend.app.models.skill import Skill
from backend.app.schemas.skill import SkillOut

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("", response_model=List[SkillOut])
def list_skills(db: Session = Depends(get_db)):
    skills = db.query(Skill).order_by(Skill.category, Skill.name).all()
    return [SkillOut.model_validate(s) for s in skills]
