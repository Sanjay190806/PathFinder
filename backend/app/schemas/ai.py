from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ActionSuggestion(BaseModel):
    action_type: str = Field(..., description="RECOMMEND_RESOURCE, EXPLAIN_ROADMAP_STEP, SUGGEST_PRACTICE, SUGGEST_REVIEW")
    label: Optional[str] = None
    resource_id: Optional[str] = None
    reason: Optional[str] = None
    payload: Optional[Dict[str, Any]] = None

class GroundedSourceOut(BaseModel):
    type: str
    id: Optional[str] = None
    title: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="Learner message or technical inquiry")
    conversation_id: Optional[str] = None
    current_resource_id: Optional[str] = None

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
