from pydantic import ConfigDict, BaseModel
from typing import List, Dict, Optional, Any
from backend.app.schemas.skill import LearnerSkillIn, LearnerSkillOut
from backend.app.schemas.goal import GoalOut

class ProfileCreate(BaseModel):
    education_level: Optional[str] = "Undergraduate"
    field_of_study: Optional[str] = "Computer Science"
    experience_level: str = "Beginner"
    weekly_hours: int = 10
    preferred_formats: List[str] = ["video", "hands-on", "projects"]
    learning_objective: str = "Placement"
    target_role: str = "AI/ML Engineer"
    skills: List[LearnerSkillIn] = []

class ProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    experience_level: Optional[str] = None
    weekly_hours: Optional[int] = None
    preferred_formats: Optional[List[str]] = None
    learning_objective: Optional[str] = None
    difficulty_tolerance: Optional[float] = None

class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    experience_level: str
    weekly_hours: int
    preferred_formats: List[str]
    learning_objective: str
    skill_confidence_map: Dict[str, float]
    velocity_score: float
    difficulty_tolerance: float
    skills: List[LearnerSkillOut] = []
    primary_goal: Optional[GoalOut] = None

    model_config = ConfigDict(from_attributes=True)
