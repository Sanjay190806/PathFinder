from typing import Dict, List, Any, Optional

class PriorityEngine:
    """
    Deterministic priority scoring engine for learning tasks.
    Prioritizes:
    1. Mandatory prerequisites (blocks downstream progress) -> Critical
    2. Severe decay risk on core skills -> Critical
    3. Active primary career skill gaps -> High
    4. Complementary & practice items -> Medium
    5. Elective & exploratory skills -> Low
    """

    @staticmethod
    def calculate_task_priority(
        skill_slug: str,
        is_prerequisite_blocker: bool = False,
        is_decaying: bool = False,
        is_critical_gap: bool = False,
        career_relevance_score: float = 1.0
    ) -> str:
        if is_prerequisite_blocker or (is_decaying and career_relevance_score >= 0.8):
            return "Critical"
        if is_critical_gap or career_relevance_score >= 0.85:
            return "High"
        if career_relevance_score >= 0.50 or is_decaying:
            return "Medium"
        return "Low"

    @staticmethod
    def generate_priority_reason(
        skill_slug: str,
        priority: str,
        is_prereq: bool,
        is_decay: bool,
        is_gap: bool,
        career_title: str
    ) -> str:
        if is_prereq:
            return f"Mandatory foundational prerequisite required before unlocking advanced modules in {career_title}."
        if is_decay:
            return f"Retention alert: Confidence in {skill_slug} is decaying; review scheduled to preserve mastery."
        if is_gap:
            return f"Core competency gap directly required for entry-level {career_title} qualification."
        return f"Complementary topic supporting overall {career_title} technical readiness."
