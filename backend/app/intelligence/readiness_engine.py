from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.intelligence.mastery_engine import SkillMasteryEngine
from backend.app.intelligence.decay_engine import SkillDecayEngine
from backend.app.intelligence.velocity_model import LearningVelocityEngine
from backend.app.core.career_catalog import resolve_target_skills_for_role

READINESS_LEVELS = [
    (85.0, "Career Ready"),
    (70.0, "Near Ready"),
    (50.0, "Developing Readiness"),
    (25.0, "Early Preparation"),
    (0.0, "Not Ready"),
]

def score_to_readiness_level(score: float) -> str:
    for threshold, level in READINESS_LEVELS:
        if score >= threshold:
            return level
    return "Not Ready"

class OpportunityReadinessEngine:
    def __init__(self, db: Session):
        self.db = db
        self.gap_engine = CareerSkillGapEngine(db)
        self.mastery_engine = SkillMasteryEngine(db)
        self.decay_engine = SkillDecayEngine(db)
        self.velocity_engine = LearningVelocityEngine(db)

    def calculate_readiness(self, profile_id: str) -> Dict[str, Any]:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Career Path"

        # 1. Gather Authoritative Upstream Intelligence
        gap_data = self.gap_engine.calculate_skill_gaps(profile_id=profile_id)
        decay_summary = self.decay_engine.get_mastery_and_decay_summary(profile_id=profile_id)
        velocity_data = self.velocity_engine.calculate_velocity(profile_id=profile_id)

        target_skills = resolve_target_skills_for_role(target_role) or ["python", "dsa"]
        critical_blockers = gap_data.get("critical_blockers", [])
        gaps = gap_data.get("gaps", [])

        # 2. Component A: Role Competency Score (45%)
        # Based on demonstrated mastery across target career skills
        mastery_scores = []
        for slug in target_skills:
            m = self.mastery_engine.calculate_skill_mastery(profile_id=profile_id, skill_slug=slug)
            mastery_scores.append(m.mastery_score)
        competency_score = round(sum(mastery_scores) / max(1, len(mastery_scores)), 4) if mastery_scores else 0.20

        # 3. Component B: Prerequisite Completion Score (25%)
        # Unblocked skills ratio
        unblocked_count = sum(1 for g in gaps if not g["is_critical"])
        prerequisite_score = round(unblocked_count / max(1, len(gaps)), 4) if gaps else 1.0

        # 4. Component C: Skill Freshness Score (20%)
        # Freshness of active competencies (preserving historical mastery, penalizing decayed practice)
        freshness_scores = [d.freshness_score for d in decay_summary.decay if d.skill_slug in target_skills]
        freshness_score = round(sum(freshness_scores) / max(1, len(freshness_scores)), 4) if freshness_scores else 0.80

        # 5. Component D: Critical Gap Penalty (10% max)
        critical_gap_penalty = min(0.25, len(critical_blockers) * 0.08)

        # 6. Composite Deterministic Readiness Formula
        # Weighted sum: 0.45 * comp + 0.25 * prereq + 0.20 * fresh - penalty
        raw_readiness = (
            (0.45 * competency_score) +
            (0.25 * prerequisite_score) +
            (0.20 * freshness_score) -
            critical_gap_penalty
        )
        readiness_score = round(max(0.0, min(100.0, raw_readiness * 100.0)), 1)
        readiness_level = score_to_readiness_level(readiness_score)

        # 7. Generate High-Impact Next Actions (Deterministic)
        high_impact_actions = []
        if critical_blockers:
            high_impact_actions.append({
                "action_type": "resolve_blocker",
                "title": f"Resolve Critical Blocker: {critical_blockers[0].replace('-', ' ').title()}",
                "description": f"Mastering {critical_blockers[0]} unlocks essential downstream prerequisites for {target_role}.",
                "priority": "highest"
            })

        decayed = [d for d in decay_summary.decay if d.decay_state in ("Review Recommended", "Decay Risk") and d.skill_slug in target_skills]
        if decayed:
            high_impact_actions.append({
                "action_type": "refresh_skill",
                "title": f"Refresh Competency: {decayed[0].skill_slug.replace('-', ' ').title()}",
                "description": f"Skill freshness dropped to {int(decayed[0].freshness_score * 100)}%. Quick review recommended.",
                "priority": "high"
            })

        if not high_impact_actions and gaps:
            top_gap = gaps[0]
            high_impact_actions.append({
                "action_type": "advance_curriculum",
                "title": f"Advance Core Competency: {top_gap['skill_slug'].replace('-', ' ').title()}",
                "description": f"Advance from {top_gap['current_level']} toward {top_gap['target_level']}.",
                "priority": "medium"
            })

        return {
            "profile_id": profile_id,
            "target_role": target_role,
            "readiness_score": readiness_score,
            "readiness_level": readiness_level,
            "readiness_label": f"PathFinder Readiness Estimate: {readiness_level} ({readiness_score}%)",
            "competency_score": competency_score,
            "prerequisite_score": prerequisite_score,
            "freshness_score": freshness_score,
            "critical_gap_penalty": round(critical_gap_penalty, 4),
            "critical_blockers": critical_blockers,
            "top_gaps": gaps[:4],
            "high_impact_actions": high_impact_actions,
            "model_version": "phase7.readiness.v1"
        }
