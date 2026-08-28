from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel, Field

from backend.app.engine.scorer import ScoredCandidate
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal

class DecisionFactor(BaseModel):
    name: str
    weight: float
    raw_score: float
    contribution: float
    reason: str

class DecisionEvidence(BaseModel):
    evidence_type: str
    description: str
    source: str = "authoritative_backend"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class UniversalDecisionTrace(BaseModel):
    decision_id: str = Field(default_factory=lambda: f"dec_{uuid.uuid4().hex[:12]}")
    decision_type: str  # recommendation, roadmap_adaptation, skill_mastery, skill_decay, readiness, market_signal, ai_action
    profile_id: str
    target_role: str
    resource_id: Optional[str] = None
    final_score: Optional[float] = None
    decision: str
    rationale: str
    factors: List[DecisionFactor] = []
    evidence: List[DecisionEvidence] = []
    affected_skills: List[str] = []
    recommended_action: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    model_version: str = "phase7.explainability.v1"

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

        factors = [
            DecisionFactor(name="Goal Relevance", weight=0.30, raw_score=candidate.goal_relevance_score, contribution=round(0.30 * candidate.goal_relevance_score, 4), reason=f"Matches {goal.target_role}"),
            DecisionFactor(name="Skill Gap", weight=0.25, raw_score=candidate.skill_gap_score, contribution=round(0.25 * candidate.skill_gap_score, 4), reason="Addresses identified competency gap"),
            DecisionFactor(name="Prerequisites", weight=0.15, raw_score=candidate.prereq_score, contribution=round(0.15 * candidate.prereq_score, 4), reason="Prerequisites verified in Skill DAG"),
            DecisionFactor(name="Difficulty Fit", weight=0.10, raw_score=candidate.difficulty_score, contribution=round(0.10 * candidate.difficulty_score, 4), reason="Aligned with learner difficulty tolerance"),
            DecisionFactor(name="Format Preference", weight=0.08, raw_score=candidate.pref_score, contribution=round(0.08 * candidate.pref_score, 4), reason=f"Preferred {candidate.resource.format}"),
            DecisionFactor(name="Time/Pacing Fit", weight=0.05, raw_score=candidate.time_score, contribution=round(0.05 * candidate.time_score, 4), reason="Fits weekly study capacity"),
            DecisionFactor(name="Engagement/Feedback", weight=0.04, raw_score=candidate.engagement_score, contribution=round(0.04 * candidate.engagement_score, 4), reason="Reinforced by past positive feedback"),
            DecisionFactor(name="Diversity Baseline", weight=0.03, raw_score=candidate.diversity_score, contribution=round(0.03 * candidate.diversity_score, 4), reason="Maintains variety across providers")
        ]

        trace = UniversalDecisionTrace(
            decision_type="recommendation",
            profile_id=profile.id,
            target_role=goal.target_role,
            resource_id=candidate.resource.id,
            final_score=candidate.composite_score,
            decision=f"Recommended: {candidate.resource.title}",
            rationale=explanation_str,
            factors=factors,
            evidence=[
                DecisionEvidence(evidence_type="curriculum_evaluation", description=f"Resource {candidate.resource.slug} scored {candidate.composite_score:.2f}")
            ],
            affected_skills=[rs.skill.slug for rs in (candidate.resource.resource_skills or [])] if hasattr(candidate.resource, "resource_skills") else [],
            recommended_action=f"Enroll in {candidate.resource.title}"
        )

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
            "human_readable_explanation": explanation_str,
            "decision_trace": trace.model_dump()
        }

def build_structured_explanation(
    candidate: ScoredCandidate,
    profile: LearnerProfile,
    goal: Goal
) -> Dict[str, Any]:
    return RecommendationExplainer.explain(candidate, profile, goal)
