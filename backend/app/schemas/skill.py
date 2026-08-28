from pydantic import ConfigDict, BaseModel
from typing import List, Optional

class SkillOut(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    difficulty_tier: str

    model_config = ConfigDict(from_attributes=True)

class SkillPrerequisiteOut(BaseModel):
    skill_id: str
    prerequisite_skill_id: str
    prerequisite_name: str
    is_mandatory: bool

class LearnerSkillIn(BaseModel):
    skill_id: str
    self_rating: str # Beginner, Intermediate, Advanced

class LearnerSkillOut(BaseModel):
    skill_id: str
    skill_name: str
    skill_slug: str
    category: str
    self_rating: str
    assessed_confidence: float
    verified: bool

    model_config = ConfigDict(from_attributes=True)
