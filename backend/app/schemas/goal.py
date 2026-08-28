from pydantic import ConfigDict, BaseModel
from typing import List, Optional

class GoalCreate(BaseModel):
    title: str
    target_role: str
    description: Optional[str] = None
    target_skills: List[str] = []

class GoalOut(BaseModel):
    id: str
    profile_id: str
    title: str
    description: Optional[str] = None
    target_role: str
    target_skills: List[str] = []
    is_primary: bool
    status: str

    model_config = ConfigDict(from_attributes=True)
