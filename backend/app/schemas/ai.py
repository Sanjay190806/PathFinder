from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ActionSuggestion(BaseModel):
    action_type: str = Field(..., description="RECOMMEND_RESOURCE, EXPLAIN_ROADMAP_STEP, SUGGEST_PRACTICE, SUGGEST_REVIEW, ADD_TO_PLAN, VIEW_OPPORTUNITY")
    label: Optional[str] = None
    resource_id: Optional[str] = None
    reason: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class GroundedSourceOut(BaseModel):
    type: str
    id: Optional[str] = None
    title: str
    url: Optional[str] = None
    source_provider: Optional[str] = None
    retrieval_date: Optional[str] = None
    verification_status: Optional[str] = None

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="Learner message or technical inquiry")
    conversation_id: Optional[str] = None
    current_resource_id: Optional[str] = None
    preferred_language: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    message: Optional[str] = None
    provider: str = "deterministic"
    confidence: float = 1.0
    grounded: bool = True
    sources: List[GroundedSourceOut] = []
    suggested_actions: Optional[List[ActionSuggestion]] = []
    suggested_focus: Optional[List[str]] = None
    grounding_references: List[str] = []
    is_fallback: bool = False
    correlation_id: Optional[str] = None
    latency_ms: Optional[float] = None

class CoachContextOut(BaseModel):
    target_role: str
    active_phase: str
    weekly_hours: int
    skills_count: int
    skill_gaps: List[str]
    strengths: List[str]
    completed_count: int
    next_step_title: Optional[str] = None
    next_step_id: Optional[str] = None
    preferred_language: Optional[str] = "English"

class LanguageOut(BaseModel):
    code: str
    name: str
    native_name: str

class CapabilitiesOut(BaseModel):
    provider: str
    configured_model: str
    web_search_available: bool
    freshness_routing_enabled: bool
    supported_languages: List[LanguageOut]
