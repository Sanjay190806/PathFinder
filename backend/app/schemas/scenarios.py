from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class ScenarioOut(BaseModel):
    id: str
    slug: str
    title: str
    description: str
    scenario_type: str
    career_roles: List[str] = []
    skills: List[str] = []
    difficulty: str
    context_data: Dict[str, Any] = {}
    available_actions: List[Dict[str, Any]] = []
    constraints: List[str] = []
    time_limit_minutes: int

class ScenarioAttemptSubmit(BaseModel):
    selected_actions: List[str]
    learner_reasoning: str = Field(..., min_length=5, max_length=1000)

class ScenarioAttemptOut(BaseModel):
    id: str
    profile_id: str
    scenario_id: str
    title: str
    selected_actions: List[str] = []
    learner_reasoning: str
    score: float
    component_scores: Dict[str, float] = {}
    feedback: str
    completed_at: datetime
