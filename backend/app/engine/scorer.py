from typing import Dict, List, Any, Optional, Set
from backend.app.core.weights import RECOMMENDATION_WEIGHTS
from backend.app.models.resource import LearningResource
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.skill_gap import SkillGapReport
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.semantic import SemanticMatcher

class ScoredCandidate:
    def __init__(
        self,
        resource: LearningResource,
        goal_relevance_score: float,
        skill_gap_score: float,
        prereq_score: float,
        difficulty_score: float,
        pref_score: float,
        time_score: float,
        engagement_score: float,
        diversity_score: float,
        composite_score: float,
        reasons: List[str]
    ):
        self.resource = resource
        self.goal_relevance_score = round(goal_relevance_score, 4)
        self.skill_gap_score = round(skill_gap_score, 4)
        self.prereq_score = round(prereq_score, 4)
        self.difficulty_score = round(difficulty_score, 4)
        self.pref_score = round(pref_score, 4)
        self.time_score = round(time_score, 4)
        self.engagement_score = round(engagement_score, 4)
        self.diversity_score = round(diversity_score, 4)
        self.composite_score = round(composite_score, 4)
        self.reasons = reasons

class RecommendationScorer:
    def __init__(self, skill_dag: SkillDAG, semantic_matcher: Optional[SemanticMatcher] = None):
        self.skill_dag = skill_dag
        self.semantic_matcher = semantic_matcher or SemanticMatcher()
        self.weights = RECOMMENDATION_WEIGHTS

    def score(
        self,
        resource: LearningResource,
        profile: LearnerProfile,
        goal: Goal,
        gap_report: SkillGapReport,
        learner_vector: Optional[List[float]] = None,
        historical_engagement: float = 0.50,
        feedback_history: Optional[Dict[str, str]] = None  # resource_id -> latest feedback_type
    ) -> ScoredCandidate:
        """
        Calculates normalized hybrid multi-signal score for an eligible resource.
        All 8 signals are guaranteed to be in [0.0, 1.0].
        Weights sum to exactly 1.0.
        """
        reasons = []
        feedback_map = feedback_history or {}
        res_fb = feedback_map.get(resource.id)

        # 1. Goal Relevance (0.30)
        role_slug = goal.target_role.lower().replace(' ', '-').replace('/', '-')
        career_rels = [str(cr).lower() for cr in (resource.career_relevance or [])]
        is_role_match = any(role_slug in cr for cr in career_rels)
        
        sem_sim = self.semantic_matcher.match(
            learner_vector=learner_vector,
            resource=resource,
            query_text=f"{goal.title} {goal.target_role}"
        )
        
        goal_relevance = max(0.40, 0.90 if is_role_match else sem_sim)
        if res_fb == "not_relevant":
            goal_relevance = max(0.20, goal_relevance * 0.60)
        elif is_role_match:
            reasons.append(f"Directly targets your career goal: {goal.target_role}")

        # 2. Skill Gap Coverage (0.25)
        res_skills = [rs.skill.slug for rs in resource.resource_skills] if hasattr(resource, 'resource_skills') else []
        taught_priority_skills = [s for s in res_skills if s in gap_report.priority_skills]
        
        if taught_priority_skills:
            skill_gap_score = min(1.0, 0.50 + len(taught_priority_skills) * 0.25)
            reasons.append(f"Addresses key skill gap in {', '.join(taught_priority_skills[:2])}")
        else:
            skill_gap_score = 0.30

        # 3. Prerequisite Readiness (0.15)
        prereq_scores = []
        for rs in (resource.resource_skills or []):
            _, avg_conf, _ = self.skill_dag.evaluate_prerequisite_readiness(
                rs.skill.slug, gap_report.skill_confidence_map
            )
            prereq_scores.append(avg_conf)
        
        prereq_score = (sum(prereq_scores) / len(prereq_scores)) if prereq_scores else 1.0
        prereq_score = max(0.0, min(1.0, prereq_score))
        if prereq_score >= 0.70:
            reasons.append("Your prerequisite knowledge is solid for this topic")
        else:
            reasons.append("Prepares you step-by-step from your current competency level")

        # 4. Difficulty Fit (0.10)
        diff_val_map = {"Beginner": 0.25, "Intermediate": 0.60, "Advanced": 0.90, "beginner": 0.25, "intermediate": 0.60, "advanced": 0.90}
        res_diff = diff_val_map.get(resource.difficulty, 0.50)
        tolerance = profile.difficulty_tolerance if profile.difficulty_tolerance is not None else 0.50
        diff_fit = max(0.20, min(1.0, 1.0 - abs(res_diff - tolerance)))
        
        if res_fb == "too_difficult":
            diff_fit = max(0.10, diff_fit * 0.40)
            reasons.append("Paced more gently following your difficulty feedback")
        elif res_fb == "too_easy":
            diff_fit = max(0.10, diff_fit * 0.60)

        # 5. Preference Match (0.08)
        preferred_formats = [f.lower() for f in (profile.preferred_formats or [])]
        res_fmt = (resource.format or "").lower()
        res_type = (resource.resource_type or "").lower()
        if res_fmt in preferred_formats or res_type in preferred_formats:
            pref_score = 0.95
            reasons.append(f"Matches your preferred {resource.format} format")
        else:
            pref_score = 0.40

        # 6. Time/Pacing Fit (0.05)
        weekly_hours = max(2, profile.weekly_hours or 10)
        target_item_hours = max(2.0, weekly_hours * 0.6)
        hours_diff = abs(resource.estimated_hours - target_item_hours)
        time_score = max(0.30, min(1.0, 1.0 - (hours_diff / (weekly_hours * 2.0))))
        reasons.append(f"Estimated workload of {resource.estimated_hours:g} hours fits your weekly pace")

        # 7. Historical Engagement (0.04)
        eng_score = max(0.0, min(1.0, historical_engagement))
        if res_fb == "helpful":
            eng_score = min(1.0, eng_score + 0.30)
            reasons.append("Reinforced based on your positive feedback")

        # 8. Diversity Baseline (0.03)
        diversity_score = 1.0

        # Composite score
        w = self.weights
        composite = (
            w["goal_relevance"] * goal_relevance +
            w["skill_gap"] * skill_gap_score +
            w["prerequisite"] * prereq_score +
            w["difficulty"] * diff_fit +
            w["preference"] * pref_score +
            w["time"] * time_score +
            w["engagement"] * eng_score +
            w["diversity"] * diversity_score
        )

        return ScoredCandidate(
            resource=resource,
            goal_relevance_score=goal_relevance,
            skill_gap_score=skill_gap_score,
            prereq_score=prereq_score,
            difficulty_score=diff_fit,
            pref_score=pref_score,
            time_score=time_score,
            engagement_score=eng_score,
            diversity_score=diversity_score,
            composite_score=composite,
            reasons=reasons
        )


def score_resource_candidate(
    resource: LearningResource,
    profile: LearnerProfile,
    goal: Goal,
    gap_report: SkillGapReport,
    skill_dag: SkillDAG,
    historical_engagement: float = 0.50
) -> ScoredCandidate:
    scorer = RecommendationScorer(skill_dag)
    return scorer.score(
        resource=resource,
        profile=profile,
        goal=goal,
        gap_report=gap_report,
        historical_engagement=historical_engagement
    )
