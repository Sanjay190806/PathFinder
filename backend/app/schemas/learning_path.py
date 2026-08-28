from pydantic import ConfigDict, BaseModel
from typing import List, Optional, Dict, Any

class ExplanationOut(BaseModel):
    goal_relevance_score: float
    skill_gap_score: float
    prereq_score: float
    difficulty_score: float
    pref_score: float
    time_score: float
    engagement_score: float
    diversity_score: float
    composite_score: float
    structured_reasons: List[str]
    human_readable_explanation: str

    model_config = ConfigDict(from_attributes=True)

class LearningPathItemOut(BaseModel):
    id: str
    version_id: str
    resource_id: str
    resource_title: str
    resource_description: str
    resource_provider: str
    resource_url: str
    resource_type: str
    difficulty: str
    estimated_hours: float
    format: str
    skills: List[str]
    prerequisites: List[str]
    phase_number: int
    phase_name: str
    sequence_order: int
    is_completed: bool
    is_skipped: bool
    is_locked: bool
    explanation: Optional[ExplanationOut] = None

    model_config = ConfigDict(from_attributes=True)

class RoadmapChangeOut(BaseModel):
    id: str
    previous_item_id: Optional[str] = None
    new_item_id: Optional[str] = None
    change_type: str # inserted, removed, reordered, phase_shifted
    reason: str
    trigger: str
    timestamp: Any

    model_config = ConfigDict(from_attributes=True)

class LearningPathVersionOut(BaseModel):
    id: str
    learning_path_id: str
    version_number: int
    version_hash: Optional[str] = None
    trigger: str
    change_summary: Optional[str] = None
    is_active: bool
    created_at: Any
    items: List[LearningPathItemOut] = []
    roadmap_changes: List[RoadmapChangeOut] = []

    model_config = ConfigDict(from_attributes=True)

class LearningPathOut(BaseModel):
    id: str
    profile_id: str
    goal_id: str
    goal_title: str
    title: str
    is_active: bool
    algorithm_version: str
    current_version: Optional[LearningPathVersionOut] = None
    all_versions_count: int = 1

    model_config = ConfigDict(from_attributes=True)
