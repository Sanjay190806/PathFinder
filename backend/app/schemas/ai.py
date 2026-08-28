from pydantic import ConfigDict, BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    current_resource_id: Optional[str] = None

class ActionSuggestion(BaseModel):
    action_type: str # adjust_weekly_hours, swap_resource, add_prerequisite_practice
    label: str
    payload: Dict[str, Any]

class ChatResponse(BaseModel):
    reply: str
    suggested_focus: Optional[List[str]] = None
    suggested_actions: Optional[List[ActionSuggestion]] = None
    grounding_references: List[str] = []
    is_fallback: bool = False
