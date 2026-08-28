from pydantic import ConfigDict, BaseModel
from typing import List, Dict

class SkillMasteryPoint(BaseModel):
    skill: str
    category: str
    confidence: float
    target_confidence: float

class AnalyticsSummaryOut(BaseModel):
    total_resources: int
    completed_resources: int
    in_progress_resources: int
    total_learning_hours: float
    hours_completed: float
    current_streak_days: int
    active_phase: str
    overall_progress_percentage: float
    skill_mastery: List[SkillMasteryPoint]
    strengths: List[str]
    weaknesses: List[str]
    acceptance_rate: float
    weekly_velocity: float
