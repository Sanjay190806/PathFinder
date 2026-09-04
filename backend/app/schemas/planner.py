from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Any, Optional
from datetime import datetime

class PlanItemOut(BaseModel):
    title: str
    skill_slug: str
    estimated_minutes: int
    priority: str  # Critical, High, Medium, Low
    category: str  # Learning, Practice, Review, Project
    resource_id: Optional[str] = None
    resource_url: Optional[str] = None
    resource_title: Optional[str] = None
    price_type: Optional[str] = "GENUINELY_FREE"
    language: Optional[str] = "English"
    reason: str

    model_config = ConfigDict(from_attributes=True)

class DailyPlanOut(BaseModel):
    date: str
    day_of_week: str
    total_planned_minutes: int
    items: List[PlanItemOut]
    decay_reviews_count: int = 0
    summary: str

class WeeklyDayPlanOut(BaseModel):
    day_name: str
    focus_skill: str
    planned_minutes: int
    items: List[PlanItemOut]

class WeeklyPlanOut(BaseModel):
    week_number: int = 1
    weekly_hours_budget: float
    total_allocated_hours: float
    overflow_hours: float = 0.0
    overflow_explanation: Optional[str] = None
    days: List[WeeklyDayPlanOut]

class MilestoneOut(BaseModel):
    milestone_id: str
    title: str
    target_career: str
    progress_percent: int
    key_deliverable: str
    target_eta_days: int
    prerequisites_completed: bool

class MonthlyPlanOut(BaseModel):
    month_name: str
    projected_skills: List[str]
    milestones: List[MilestoneOut]
    total_study_hours: float

class PlanHistoryOut(BaseModel):
    plan_version: int
    created_at: datetime
    reason: str
    overflow_hours: float

class FullPlannerResponse(BaseModel):
    plan_version: int
    today: DailyPlanOut
    weekly: WeeklyPlanOut
    next_milestone: MilestoneOut
    monthly: MonthlyPlanOut
    why_this_order: List[str]
