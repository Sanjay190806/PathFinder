from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill
from backend.app.core.career_catalog import resolve_target_skills_for_role, CAREER_ROLES_CATALOG
from backend.app.engine.skill_graph import SkillDAG
from backend.app.intelligence.mastery_engine import SkillMasteryEngine, COMPETENCY_TIERS

TIER_RANKS = {
    "Unknown": 0,
    "Beginner": 1,
    "Developing": 2,
    "Competent": 3,
    "Strong": 4,
    "Mastery": 5
}

class CareerSkillGapEngine:
    def __init__(self, db: Session):
        self.db = db
        self.mastery_engine = SkillMasteryEngine(db)
        self.skill_dag = SkillDAG(db)

    def calculate_skill_gaps(self, profile_id: str) -> Dict[str, Any]:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Career Path"

        # 1. Resolve Target Skills from Catalog
        target_skill_slugs = resolve_target_skills_for_role(target_role)
        if not target_skill_slugs:
            # Fallback to goal target_skills or default catalog
            target_skill_slugs = primary_goal.target_skills if primary_goal and primary_goal.target_skills else ["python", "dsa"]

        gaps = []
        critical_blockers = []
        total_required_levels = len(target_skill_slugs) * 4  # Target "Strong" (rank 4) as baseline
        achieved_levels = 0

        for slug in target_skill_slugs:
            mastery_out = self.mastery_engine.calculate_skill_mastery(profile_id=profile_id, skill_slug=slug)
            curr_tier = mastery_out.competency_tier
            curr_rank = TIER_RANKS.get(curr_tier, 0)
            target_tier = "Strong"
            target_rank = 4

            gap_magnitude = max(0, target_rank - curr_rank)
            achieved_levels += min(target_rank, curr_rank)

            # Check Prerequisite Distance in DAG
            prereqs = self.skill_dag.get_prerequisites(slug)
            prereq_distance = len(prereqs)
            
            # Critical blocker check: if this skill is a mandatory prerequisite for other target skills and is weak
            has_blocked_dependents = any(
                slug in [p[0] for p in self.skill_dag.get_prerequisites(other_slug)]
                for other_slug in target_skill_slugs if other_slug != slug
            )
            is_critical = curr_rank < 3 and (has_blocked_dependents or prereq_distance == 0)

            # Gap categorization
            if prereq_distance == 0:
                category = "foundational"
            elif is_critical:
                category = "prerequisite"
            elif gap_magnitude == 0:
                category = "mastered"
            elif curr_rank >= 3:
                category = "advanced"
            else:
                category = "core"

            priority_score = round((gap_magnitude * 0.40) + (1.0 if is_critical else 0.0) * 0.40 + (0.20 if category == "foundational" else 0.10), 2)

            gap_item = {
                "skill_slug": slug,
                "current_level": curr_tier,
                "current_rank": curr_rank,
                "target_level": target_tier,
                "target_rank": target_rank,
                "gap_size": gap_magnitude,
                "mastery_score": mastery_out.mastery_score,
                "priority_score": priority_score,
                "category": category,
                "is_critical": is_critical,
                "prerequisite_distance": prereq_distance,
                "explanation": (
                    f"Current level is {curr_tier} ({int(mastery_out.mastery_score * 100)}%). "
                    f"Target for {target_role} is {target_tier}. "
                    + ("Critical prerequisite blocker." if is_critical else "Core competency gap.")
                )
            }
            gaps.append(gap_item)
            if is_critical:
                critical_blockers.append(slug)

        # Sort gaps by priority descending
        gaps.sort(key=lambda g: g["priority_score"], reverse=True)

        overall_gap_score = round(sum(g["gap_size"] for g in gaps) / max(1, len(gaps) * 4), 4)
        readiness_pct = round((achieved_levels / max(1, total_required_levels)) * 100, 1)

        return {
            "profile_id": profile_id,
            "target_role": target_role,
            "readiness_percentage": readiness_pct,
            "overall_gap_score": overall_gap_score,
            "total_target_skills": len(target_skill_slugs),
            "critical_blockers": critical_blockers,
            "gaps": gaps
        }
