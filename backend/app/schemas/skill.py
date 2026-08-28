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


class SkillGraphNode(BaseModel):
    id: str
    slug: str
    name: str
    category: str
    difficulty_tier: str
    confidence: float = 0.0
    target_confidence: float = 1.0
    status: str = "eligible" # "completed", "in_progress", "eligible", "locked"
    topological_depth: int = 0
    prerequisites_count: int = 0
    dependents_count: int = 0
    prerequisites: List[str] = []
    dependents: List[str] = []

class SkillGraphEdge(BaseModel):
    source: str
    target: str
    is_mandatory: bool

class SkillGraphOut(BaseModel):
    nodes: List[SkillGraphNode]
    edges: List[SkillGraphEdge]
