from typing import Dict, Any, List
from backend.app.engine.scorer import ScoredCandidate
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal

class RecommendationExplainer:
    @staticmethod
    def explain(
        candidate: ScoredCandidate,
        profile: LearnerProfile,
        goal: Goal
    ) -> Dict[str, Any]:
        """
        Generates granular structured explainability payload from actual algorithmic scoring signals.
        """
        reasons = list(candidate.reasons)
        
        # Build comprehensive deterministic human-readable explanation
        components = []
        if candidate.goal_relevance_score >= 0.80:
            components.append(f"directly targets your career goal to become a {goal.target_role}")
        if candidate.skill_gap_score >= 0.60:
            components.append("closes critical skill gaps")
        if candidate.pref_score >= 0.80:
            components.append(f"matches your preferred {candidate.resource.format} format")
        if candidate.time_score >= 0.70:
            components.append(f"fits your {profile.weekly_hours or 10}h weekly pace")

        if components:
            explanation_str = f"Recommended because it {', '.join(components)}."
        else:
            explanation_str = f"Recommended to build prerequisite foundation for {goal.target_role}."

        return {
            "goal_relevance_score": candidate.goal_relevance_score,
            "skill_gap_score": candidate.skill_gap_score,
            "prereq_score": candidate.prereq_score,
            "difficulty_score": candidate.difficulty_score,
            "pref_score": candidate.pref_score,
            "time_score": candidate.time_score,
            "engagement_score": candidate.engagement_score,
            "diversity_score": candidate.diversity_score,
            "composite_score": candidate.composite_score,
            "structured_reasons": reasons,
            "human_readable_explanation": explanation_str
        }

# Backward-compatible function wrapper
def build_structured_explanation(
    candidate: ScoredCandidate,
    profile: LearnerProfile,
    goal: Goal
) -> Dict[str, Any]:
    return RecommendationExplainer.explain(candidate, profile, goal)
