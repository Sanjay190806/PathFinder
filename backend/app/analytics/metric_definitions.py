"""
Metric Definitions Registry for PathFinder Advanced Learning Analytics
Phase 10 Stage 10: Canonical definitions, formulas, sources, and versions.
"""

from typing import Dict, Any, List
from pydantic import BaseModel

class MetricDefinition(BaseModel):
    metric_key: str
    metric_name: str
    description: str
    source: str
    formula: str
    time_window: str
    aggregation: str
    freshness: str
    version: str = "v1.0"


METRIC_DEFINITIONS: Dict[str, MetricDefinition] = {
    "courses_started": MetricDefinition(
        metric_key="courses_started",
        metric_name="Courses Started",
        description="Total number of learning courses that the learner has officially initiated.",
        source="Progress (status in ['in_progress', 'completed'])",
        formula="count(distinct resource_id where status in ['in_progress', 'completed'])",
        time_window="all_time",
        aggregation="COUNT",
        freshness="LIVE"
    ),
    "courses_completed": MetricDefinition(
        metric_key="courses_completed",
        metric_name="Courses Completed",
        description="Total number of learning courses authoritatively completed through verified assessment passing.",
        source="Progress (status == 'completed')",
        formula="count(distinct resource_id where status == 'completed')",
        time_window="all_time",
        aggregation="COUNT",
        freshness="LIVE"
    ),
    "course_completion_rate": MetricDefinition(
        metric_key="course_completion_rate",
        metric_name="Course Completion Rate",
        description="Percentage of started courses that have reached full completion.",
        source="Progress",
        formula="(courses_completed / courses_started) * 100.0",
        time_window="all_time",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "assessments_taken": MetricDefinition(
        metric_key="assessments_taken",
        metric_name="Total Assessments Taken",
        description="Total number of assessment sessions initiated and finalized by the learner.",
        source="AssessmentSession (status in ['SUBMITTED', 'PASSED', 'FAILED', 'EXPIRED'])",
        formula="count(AssessmentSession)",
        time_window="all_time",
        aggregation="COUNT",
        freshness="LIVE"
    ),
    "assessment_pass_rate": MetricDefinition(
        metric_key="assessment_pass_rate",
        metric_name="Assessment Pass Rate",
        description="Percentage of valid (non-invalidated) assessment attempts that achieved academic passing score.",
        source="AssessmentSession (integrity_state != 'INVALIDATED')",
        formula="(passed_valid_attempts / total_valid_attempts) * 100.0",
        time_window="all_time",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "average_assessment_score": MetricDefinition(
        metric_key="average_assessment_score",
        metric_name="Average Assessment Score",
        description="Mean academic percentage earned across all valid finalized assessment sessions.",
        source="AssessmentSession (integrity_state != 'INVALIDATED')",
        formula="mean(session.result_summary.percentage)",
        time_window="all_time",
        aggregation="AVERAGE",
        freshness="LIVE"
    ),
    "learning_hours": MetricDefinition(
        metric_key="learning_hours",
        metric_name="Qualifying Learning Hours",
        description="Authoritative hours spent in course study and learning resources (excludes assessment duration).",
        source="Progress (time_spent_minutes) + BehaviorEvent qualifying study sessions",
        formula="sum(time_spent_minutes) / 60.0",
        time_window="all_time",
        aggregation="SUM",
        freshness="LIVE"
    ),
    "learning_streak": MetricDefinition(
        metric_key="learning_streak",
        metric_name="Current Learning Streak",
        description="Consecutive calendar days with at least one verified qualifying learning activity.",
        source="BehaviorEvent (COURSE_STARTED, COURSE_COMPLETED, RESOURCE_ACCESSED) & Progress updates",
        formula="consecutive active days ending today or yesterday",
        time_window="daily_continuity",
        aggregation="STREAK_COUNT",
        freshness="LIVE"
    ),
    "module_accuracy": MetricDefinition(
        metric_key="module_accuracy",
        metric_name="Module Syllabus Accuracy",
        description="Percentage of possible marks earned on questions tied to a specific syllabus module.",
        source="AssessmentAttemptEvidence grouped by module_id",
        formula="(sum(earned_marks) / sum(max_marks)) * 100.0",
        time_window="all_time",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "topic_accuracy": MetricDefinition(
        metric_key="topic_accuracy",
        metric_name="Topic Syllabus Accuracy",
        description="Percentage of possible marks earned on questions tied to a specific syllabus topic.",
        source="AssessmentAttemptEvidence grouped by topic_id",
        formula="(sum(earned_marks) / sum(max_marks)) * 100.0",
        time_window="all_time",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "objective_accuracy": MetricDefinition(
        metric_key="objective_accuracy",
        metric_name="Learning Objective Accuracy",
        description="Percentage of possible marks earned on questions tied to a specific learning objective.",
        source="AssessmentAttemptEvidence grouped by objective_id",
        formula="(sum(earned_marks) / sum(max_marks)) * 100.0",
        time_window="all_time",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "skill_mastery": MetricDefinition(
        metric_key="skill_mastery",
        metric_name="Skill Mastery Score",
        description="Bayesian-calibrated mastery level (0.0 - 1.0) synthesized from coursework, assessments, and velocity.",
        source="SkillMasteryEngine (Phase 7 & Phase 10)",
        formula="0.40 * Coursework + 0.35 * AssessmentEvidence + 0.15 * Prior + 0.10 * Velocity - Decay",
        time_window="decay_weighted",
        aggregation="SYNTHESIS",
        freshness="LIVE"
    ),
    "planner_completion_rate": MetricDefinition(
        metric_key="planner_completion_rate",
        metric_name="Study Plan Execution Rate",
        description="Percentage of assigned planner milestones and tasks completed on or before scheduled dates.",
        source="LearnerPlan (milestone_plan & daily_plan)",
        formula="(completed_tasks / total_scheduled_tasks) * 100.0",
        time_window="active_plan",
        aggregation="RATIO",
        freshness="LIVE"
    ),
    "career_readiness": MetricDefinition(
        metric_key="career_readiness",
        metric_name="Career Readiness Index",
        description="Synthesized readiness across target role competencies, prerequisites, and portfolio evidence.",
        source="OpportunityReadinessEngine",
        formula="Weighted composite across technical, practical, and project readiness",
        time_window="current_profile",
        aggregation="COMPOSITE",
        freshness="LIVE"
    ),
    "integrity_event_summary": MetricDefinition(
        metric_key="integrity_event_summary",
        metric_name="Assessment Integrity Audit",
        description="Privacy-conscious audit of monitored sessions, warnings issued, and review flags. Never converted into a cheating verdict.",
        source="AssessmentIntegrityEvent & AssessmentSession.integrity_state",
        formula="count(warnings), count(review_required), count(invalidated)",
        time_window="all_time",
        aggregation="AUDIT_COUNT",
        freshness="LIVE"
    )
}

def get_all_metric_definitions() -> List[MetricDefinition]:
    return list(METRIC_DEFINITIONS.values())

def get_metric_definition(metric_key: str) -> MetricDefinition:
    return METRIC_DEFINITIONS.get(metric_key)
