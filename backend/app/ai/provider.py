from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
import uuid

class ActionProposal(BaseModel):
    action_type: str = Field(..., description="Allowed action types: RECOMMEND_RESOURCE, EXPLAIN_RECOMMENDATION, EXPLAIN_ROADMAP_STEP, SUGGEST_PRACTICE, SUGGEST_REVIEW")
    resource_id: Optional[str] = None
    resource_title: Optional[str] = None
    reason: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class GroundedSource(BaseModel):
    type: str = Field(..., description="resource, skill, roadmap, prerequisite, or web")
    id: Optional[str] = None
    title: str
    url: Optional[str] = None
    source_provider: Optional[str] = None
    retrieval_date: Optional[str] = None
    verification_status: Optional[str] = None

class GroundedContext(BaseModel):
    learner_id: str
    learner_name: str
    target_role: str
    weekly_hours: int
    difficulty_tolerance: float
    skills: List[Dict[str, Any]]  # [{"slug": "python", "name": "Python", "confidence": 0.80, "status": "mastered"}]
    skill_gaps: List[str]
    active_phase: str
    current_roadmap_items: List[Dict[str, Any]]
    completed_items: List[str]
    recommendation_explanations: List[Dict[str, Any]]
    catalog_sample: List[Dict[str, Any]]
    user_query: str
    intent: str
    conversation_history: List[Dict[str, str]] = []
    # Phase 7 Stage 8 Extended Intelligence Context
    velocity_score: Optional[float] = 1.0
    pacing_state: Optional[str] = "on_track"
    readiness_score: Optional[float] = None
    readiness_level: Optional[str] = None
    critical_blockers: List[str] = []
    decay_alerts: List[str] = []
    market_signals: List[Dict[str, Any]] = []
    # Phase 9 Stage 8 Multilingual & Grounding Fields
    preferred_language: str = "English"
    education_level: Optional[str] = None
    education_stage: Optional[str] = None
    stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    today_plan: Optional[List[Dict[str, Any]]] = None
    weekly_plan: Optional[Dict[str, Any]] = None
    web_citations: List[GroundedSource] = []
    current_data_verified: bool = True
    price_preference: Optional[str] = None

class AIResponse(BaseModel):
    message: str
    provider: str  # "gemini" or "deterministic"
    confidence: float = 1.0
    grounded: bool = True
    sources: List[GroundedSource] = []
    suggested_actions: List[ActionProposal] = []
    correlation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    latency_ms: float = 0.0
    is_fallback: bool = False

# Backward-compatible schemas for prior imports
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
    education_level: Optional[str] = None
    education_stage: Optional[str] = None
    education_stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    current_role: Optional[str] = None
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
    def generate_coach_response(self, context: GroundedContext) -> AIResponse:
        """Generates a structured, grounded response from context."""
        pass

    @abstractmethod
    def explain_recommendation(self, context: RecommendationContext) -> str:
        """Provides explanation for a recommendation."""
        pass

    @abstractmethod
    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        """Backward-compatible assistant response."""
        pass
