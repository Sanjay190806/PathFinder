from pydantic import ConfigDict, BaseModel
from typing import List, Optional, Any

class ResourceOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    provider: str
    url: str
    resource_type: str
    difficulty: str
    estimated_hours: float
    quality_score: float
    career_relevance: List[str] = []
    format: str
    skills: List[str] = []

    model_config = ConfigDict(from_attributes=True)

class ResourceDetailOut(ResourceOut):
    prerequisites: List[str] = []
    learner_status: Optional[str] = None
    time_spent_minutes: int = 0
    feedback_history: List[Any] = []
