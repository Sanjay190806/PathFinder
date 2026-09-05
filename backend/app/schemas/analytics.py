from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

# -------------------------------------------------------------
# Legacy Models (Preserved for 100% backward compatibility)
# -------------------------------------------------------------

class SkillMasteryPoint(BaseModel):
    skill: str
    category: str
    confidence: float
    target_confidence: float

class PhaseProgressOut(BaseModel):
    phase_number: int
    phase_name: str
    total_modules: int
    completed_modules: int
    completion_percentage: float
    total_hours: float
    completed_hours: float

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
    phase_progress: List[PhaseProgressOut] = []


# -------------------------------------------------------------
# Phase 10 Stage 10 Advanced Authoritative Analytics Schemas
# -------------------------------------------------------------

class MetricDefinitionOut(BaseModel):
    metric_key: str
    metric_name: str
    description: str
    source: str
    formula: str
    time_window: str
    aggregation: str
    freshness: str
    version: str = "v1.0"


class AnalyticsOverviewOut(BaseModel):
    profile_id: str
    # Course metrics
    courses_started: int
    courses_in_progress: int
    courses_completed: int
    courses_failed: int
    course_completion_rate: Optional[float] = None  # None if courses_started == 0

    # Assessment metrics
    assessments_taken: int
    assessments_valid: int
    assessments_passed: int
    assessments_failed: int
    assessments_review_required: int
    assessments_invalidated: int
    assessment_pass_rate: Optional[float] = None  # None if valid attempts == 0
    average_assessment_score: Optional[float] = None  # None if valid attempts == 0

    # Learning hours & sessions (strictly separated from exam duration)
    learning_hours: float
    learning_sessions: int
    assessment_duration_hours: float

    # Consistency
    current_streak: int
    longest_streak: int

    # Metadata & Freshness
    last_updated: datetime
    data_freshness: str = "LIVE"  # LIVE | RECENT | CACHED | NOT_AVAILABLE
    calculation_version: str = "v10.10"


class CourseAnalyticsItemOut(BaseModel):
    course_id: str
    course_name: str
    slug: str
    status: str  # not_started | in_progress | completed
    progress_percentage: float
    modules_total: int
    modules_completed: int
    assessment_attempts: int
    latest_score: Optional[float] = None
    best_score: Optional[float] = None
    completion_date: Optional[datetime] = None
    completion_status: str  # NOT_STARTED | IN_PROGRESS | COMPLETED


class CourseAnalyticsOut(BaseModel):
    total_courses: int
    completed_courses: int
    in_progress_courses: int
    overall_completion_rate: Optional[float] = None
    courses: List[CourseAnalyticsItemOut]


class AssessmentAnalyticsOut(BaseModel):
    total_attempts: int
    valid_attempts: int
    passed_attempts: int
    failed_attempts: int
    review_required_attempts: int
    invalidated_attempts: int
    average_score: Optional[float] = None  # Excluding invalidated
    highest_score: Optional[float] = None  # Excluding invalidated
    lowest_score: Optional[float] = None  # Excluding invalidated
    pass_rate: Optional[float] = None      # Passed / Valid * 100
    average_duration_minutes: Optional[float] = None
    question_accuracy: Optional[float] = None  # Correct / Attempted * 100
    status_note: str = ""


class ModulePerformanceOut(BaseModel):
    module_id: str
    module_title: str
    questions_attempted: int
    questions_correct: int
    earned_score: float
    max_score: float
    percentage: Optional[float] = None
    mastery_signal: str  # HIGH_MASTERY | PROFICIENT | DEVELOPING | NEEDS_REVISION | NOT_EVALUATED


class TopicPerformanceOut(BaseModel):
    topic_id: str
    topic_title: str
    module_id: Optional[str] = None
    questions_attempted: int
    questions_correct: int
    earned_score: float
    max_score: float
    percentage: Optional[float] = None
    mastery_signal: str


class ObjectivePerformanceOut(BaseModel):
    objective_id: str
    objective_title: str
    earned_score: float
    max_score: float
    percentage: Optional[float] = None
    evidence_count: int
    mastery_signal: str


class SyllabusAnalyticsOut(BaseModel):
    profile_id: str
    modules: List[ModulePerformanceOut]
    topics: List[TopicPerformanceOut]
    learning_objectives: List[ObjectivePerformanceOut]
    has_data: bool


class SkillAnalyticsItemOut(BaseModel):
    skill_id: str
    skill_name: str
    skill_slug: str
    category: str
    current_mastery: float
    previous_mastery: Optional[float] = None
    change: float = 0.0
    confidence: float
    last_assessed: Optional[datetime] = None
    decay_risk: str  # LOW | MODERATE | HIGH
    assessment_evidence_count: int


class MasteryHistoryPointOut(BaseModel):
    date: str
    skill_slug: str
    skill_name: str
    mastery_score: float


class SkillAnalyticsOut(BaseModel):
    profile_id: str
    skills: List[SkillAnalyticsItemOut]
    history: List[MasteryHistoryPointOut]
    strengths: List[str]
    weaknesses: List[str]
    has_data: bool


class DailyActivityPointOut(BaseModel):
    date: str
    qualifying_hours: float
    sessions_count: int
    has_activity: bool


class LearningConsistencyOut(BaseModel):
    profile_id: str
    current_streak: int
    longest_streak: int
    qualifying_learning_days_count: int
    weekly_hours: float
    monthly_hours: float
    daily_history_last_14_days: List[DailyActivityPointOut]
    consistency_trend: str  # INCREASING | STABLE | SLOWING | INACTIVE


class PlannerAnalyticsOut(BaseModel):
    profile_id: str
    has_active_plan: bool
    plan_version: int
    planned_tasks_count: int
    completed_tasks_count: int
    overdue_tasks_count: int
    completion_rate: Optional[float] = None
    weekly_planned_hours: float
    weekly_completed_hours: float
    milestones_total: int
    milestones_completed: int
    milestone_progress_percentage: float


class CareerReadinessAnalyticsOut(BaseModel):
    profile_id: str
    target_role: str
    readiness_level: str  # Career Ready | Near Ready | Developing Readiness | Early Preparation | Not Ready
    overall_readiness_score: float
    technical_readiness: float
    practical_readiness: float
    project_readiness: float
    employability_readiness: float
    application_readiness: float
    interview_readiness: float
    unblocked_skills_count: int
    critical_blockers_count: int


class IntegrityAnalyticsOut(BaseModel):
    profile_id: str
    monitored_assessments_taken: int
    total_integrity_events: int
    warnings_issued: int
    camera_interruptions_count: int
    review_required_sessions: int
    invalidated_sessions: int
    audit_note: str = "Integrity monitoring records probabilistic events for proctoring review. It is never a definitive cheating score."
