from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class RoadmapItemResponse(BaseModel):
    id: str
    stage: str
    item_type: str  # DSA_TOPIC, SKILL, TECHNOLOGY, PROJECT, MOCK_INTERVIEW
    title: str
    topic_slug: Optional[str] = None
    skill_slug: Optional[str] = None
    description: str
    priority: str   # CRITICAL, HIGH, MEDIUM, LOW
    difficulty: str # EASY, MEDIUM, HARD
    estimated_hours: float
    status: str     # LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
    prerequisites: List[str] = []
    sequence_order: int
    learning_objectives: List[str] = []
    practice_recommendation: Optional[str] = None


class RoadmapStageResponse(BaseModel):
    stage_name: str
    stage_title: str
    stage_order: int
    estimated_hours: float
    items: List[RoadmapItemResponse] = []


class CompanyRoadmapResponse(BaseModel):
    roadmap_id: str
    version: int
    change_reason: str
    company_slug: str
    company_name: str
    role_slug: str
    role_name: str
    canonical_role_name: str
    learner_id: str
    total_stages: int
    total_items: int
    total_estimated_hours: float
    dsa_priority: str
    stages: List[RoadmapStageResponse] = []
    items: List[RoadmapItemResponse] = []
    decision_trace: Dict[str, Any]


class SwitchCompanyRequest(BaseModel):
    new_company_slug: str
    new_role_slug: Optional[str] = None


class PlannerHandoffItem(BaseModel):
    id: str
    title: str
    stage: str
    item_type: str
    priority: str
    planned_hours: float
    difficulty: str
    status: str
    prerequisites: List[str] = []
    recommended_order: int


class PlannerHandoffResponse(BaseModel):
    roadmap_id: str
    version: int
    company_name: str
    role_name: str
    total_planned_hours: float
    items: List[PlannerHandoffItem] = []
