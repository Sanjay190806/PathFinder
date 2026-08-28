from pydantic import BaseModel, Field, field_validator
from typing import Dict, List, Optional, Any
from datetime import datetime, timezone

VALID_EVENT_TYPES = {
    "resource_viewed",
    "resource_started",
    "resource_completed",
    "resource_abandoned",
    "assessment_started",
    "assessment_completed",
    "quiz_attempted",
    "quiz_completed",
    "roadmap_viewed",
    "roadmap_item_started",
    "roadmap_item_completed",
    "ai_coach_interaction",
    "recommendation_clicked",
    "recommendation_dismissed",
    "session_started",
    "session_ended"
}

class BehaviorEventCreate(BaseModel):
    event_id: str = Field(..., min_length=1, max_length=64, description="Unique idempotent event identifier")
    event_type: str = Field(..., description="Standardized behavior event type")
    resource_id: Optional[str] = None
    skill_slug: Optional[str] = None
    session_id: Optional[str] = None
    source: str = Field(default="frontend", max_length=32)
    payload: Optional[Dict[str, Any]] = Field(default_factory=dict)
    timestamp: Optional[datetime] = None

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        if v not in VALID_EVENT_TYPES:
            raise ValueError(f"Invalid event_type '{v}'. Must be one of {sorted(VALID_EVENT_TYPES)}")
        return v

class BehaviorEventOut(BaseModel):
    id: str
    event_id: str
    profile_id: str
    event_type: str
    resource_id: Optional[str] = None
    skill_slug: Optional[str] = None
    session_id: Optional[str] = None
    source: str
    payload: Dict[str, Any] = {}
    timestamp: datetime

class BehaviorSummaryOut(BaseModel):
    profile_id: str
    total_events: int
    active_sessions: int
    resources_viewed: int
    resources_started: int
    resources_completed: int
    resources_abandoned: int
    assessments_completed: int
    quiz_attempts: int
    coach_interactions: int
    recommendations_clicked: int
    events_last_7_days: int
    events_last_30_days: int
    per_skill_counts: Dict[str, int] = {}

class LearningVelocityOut(BaseModel):
    profile_id: str
    completion_rate: float
    study_hours_per_week: float
    assessment_accuracy: float
    consistency_score: float
    abandonment_rate: float
    pacing_state: str  # "accelerated", "on_track", "behind_schedule", "inactive"
    velocity_score: float
    engagement_state: str  # "highly_engaged", "engaged", "inconsistent", "low_engagement", "inactive", "insufficient_data"
    confidence: str  # "high", "medium", "low", "insufficient_data"
    explanation: str
    factors: Dict[str, float] = {}
    model_version: str = "phase7.velocity.v1"

class SkillMasteryOut(BaseModel):
    skill_slug: str
    mastery_score: float
    competency_tier: str  # "Unknown", "Beginner", "Developing", "Competent", "Strong", "Mastery"
    evidence_count: int
    contributing_factors: Dict[str, float] = {}
    explanation: str
    last_demonstrated: Optional[datetime] = None
    confidence: str = "medium"
    model_version: str = "phase7.mastery.v1"

class SkillDecayOut(BaseModel):
    skill_slug: str
    demonstrated_mastery_score: float
    freshness_score: float
    decay_state: str  # "Fresh", "Aging", "Review Recommended", "Decay Risk"
    days_since_last_demonstration: float
    half_life_days: float
    explanation: str
    model_version: str = "phase7.decay.v1"

class MasteryDecaySummaryOut(BaseModel):
    profile_id: str
    mastery: List[SkillMasteryOut]
    decay: List[SkillDecayOut]
    overall_mastery_score: float
    fresh_count: int
    aging_count: int
    review_recommended_count: int
    decay_risk_count: int
