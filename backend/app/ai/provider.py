from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class RecommendationContext(BaseModel):
    learner_name: str
    target_role: str
    resource_title: str
    resource_provider: str
    skills_taught: List[str]
    missing_skills: List[str]
    weekly_hours: int
    scores: Dict[str, float]
    structured_reasons: List[str]

class AssistantContext(BaseModel):
    learner_name: str
    target_role: str
    education_level: Optional[str]
    weekly_hours: int
    skills_known: List[str]
    skill_gaps: List[str]
    active_phase: str
    current_roadmap_items: List[str]
    completed_items: List[str]
    user_query: str
    current_resource_id: Optional[str] = None

class AssistantResponsePayload(BaseModel):
    reply: str
    suggested_focus: Optional[List[str]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None
    grounding_references: List[str] = []
    is_fallback: bool = False

class AIProvider(ABC):
    @abstractmethod
    def explain_recommendation(self, context: RecommendationContext) -> str:
        pass

    @abstractmethod
    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        pass
