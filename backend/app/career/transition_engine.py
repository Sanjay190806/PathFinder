"""
Career Transition & Comparison Engine (Phase 11 Stage 3)
Calculates transferable skills, bridge skills, feasibility, estimated ramp time,
and side-by-side career comparison across multi-dimensional criteria.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload

from backend.app.models.career import Career, CareerRelationship, CareerSkillRequirement
from backend.app.schemas.career import (
    CareerTransitionResponse,
    CareerComparisonResponse,
    CareerComparisonItem
)


class CareerTransitionEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_career_transition(
        self,
        source_slug: str,
        target_slug: str
    ) -> Optional[CareerTransitionResponse]:
        """
        Evaluates career transition feasibility, computing transferable skills,
        bridge skills, and recommended project milestones.
        """
        source = self.db.query(Career).filter(Career.slug == source_slug, Career.is_active == True).options(
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill)
        ).first()

        target = self.db.query(Career).filter(Career.slug == target_slug, Career.is_active == True).options(
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill)
        ).first()

        if not source or not target:
            return None

        # Check for explicit relationship in db
        rel = self.db.query(CareerRelationship).filter(
            CareerRelationship.source_career_id == source.id,
            CareerRelationship.target_career_id == target.id
        ).first()

        source_skills = {sr.skill.slug: sr.skill.name for sr in (source.skill_requirements or []) if sr.skill}
        target_skills = {sr.skill.slug: sr.skill.name for sr in (target.skill_requirements or []) if sr.skill}

        # Calculate overlap
        common_slugs = set(source_skills.keys()).intersection(set(target_skills.keys()))
        missing_slugs = set(target_skills.keys()) - set(source_skills.keys())

        transferable_skills = [source_skills[s] for s in common_slugs]
        bridge_skills = [target_skills[s] for s in missing_slugs]

        # Use seeded relationship metadata if available
        if rel and rel.transferable_skills:
            transferable_skills = list(set(transferable_skills + rel.transferable_skills))
        if rel and rel.bridge_skills:
            bridge_skills = list(set(bridge_skills + rel.bridge_skills))

        # Feasibility determination
        overlap_ratio = len(common_slugs) / max(1, len(target_skills))
        if target.is_regulated and not source.is_regulated:
            feasibility = "CHALLENGING"
            estimated_weeks = 52
            transition_notes = f"Transition into {target.canonical_name} requires statutory professional licensing."
        elif overlap_ratio >= 0.5 or (rel and rel.relationship_type in ["ADJACENT", "TRANSITION"]):
            feasibility = "HIGH"
            estimated_weeks = 8
            transition_notes = f"Strong skill synergy between {source.canonical_name} and {target.canonical_name}."
        elif overlap_ratio >= 0.2:
            feasibility = "MODERATE"
            estimated_weeks = 16
            transition_notes = f"Moderate bridge required focusing on core domain competencies."
        else:
            feasibility = "CHALLENGING"
            estimated_weeks = 24
            transition_notes = f"Substantial pivot requiring comprehensive foundational mastery."

        # Recommended portfolio projects
        recommended_projects = [
            f"End-to-End {target.canonical_name} Capstone Case Study",
            f"Portfolio Project demonstrating {', '.join(bridge_skills[:2]) if bridge_skills else 'Domain Competency'}"
        ]

        return CareerTransitionResponse(
            source_career_slug=source.slug,
            source_career_name=source.canonical_name,
            target_career_slug=target.slug,
            target_career_name=target.canonical_name,
            feasibility=feasibility,
            transferable_skills=transferable_skills,
            bridge_skills=bridge_skills,
            estimated_ramp_weeks=estimated_weeks,
            recommended_portfolio_projects=recommended_projects,
            transition_notes=rel.notes if rel and rel.notes else transition_notes
        )

    def compare_careers(
        self,
        career_slugs: List[str]
    ) -> CareerComparisonResponse:
        """
        Compares 2 to 4 careers side-by-side across educational barriers,
        skills, tools, work environment, and portfolio requirements.
        """
        careers = self.db.query(Career).filter(
            Career.slug.in_(career_slugs),
            Career.is_active == True
        ).options(
            joinedload(Career.domain),
            joinedload(Career.family),
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill)
        ).all()

        items: List[CareerComparisonItem] = []
        all_skills_by_career: Dict[str, set] = {}

        for c in careers:
            mand_skills = [
                sr.skill.name for sr in (c.skill_requirements or [])
                if sr.skill and sr.importance == "MANDATORY"
            ]
            all_skills_by_career[c.slug] = set(
                sr.skill.slug for sr in (c.skill_requirements or []) if sr.skill
            )

            # Determine barrier
            if c.is_regulated:
                barrier = "REGULATED"
            elif any("HARD" in (er.requirement_type or "") for er in (c.education_requirements or [])):
                barrier = "HIGH"
            elif c.domain and "technology" in c.domain.slug:
                barrier = "MODERATE"
            else:
                barrier = "LOW"

            portfolio_imp = "CRITICAL" if c.domain and c.domain.slug in ["design-creative", "media-film-entertainment"] else "RECOMMENDED"

            items.append(CareerComparisonItem(
                career_slug=c.slug,
                career_name=c.canonical_name,
                domain=c.domain.name if c.domain else "General",
                family=c.family.name if c.family else "General",
                education_entry_barrier=barrier,
                mandatory_skills=mand_skills,
                tools=c.tools or [],
                remote_compatibility=c.remote_compatibility or "MEDIUM",
                portfolio_importance=portfolio_imp,
                work_environment=c.work_environment or "Office"
            ))

        # Find common skills
        common_set = None
        for s_set in all_skills_by_career.values():
            if common_set is None:
                common_set = set(s_set)
            else:
                common_set = common_set.intersection(s_set)
        common_skills = list(common_set) if common_set else []

        unique_skills: Dict[str, List[str]] = {}
        for slug, s_set in all_skills_by_career.items():
            unique_skills[slug] = list(s_set - (common_set or set()))

        summary = (
            f"Comparing {len(items)} careers across "
            f"{', '.join(set(item.domain for item in items))}. "
            f"Entry barriers range from {', '.join(set(item.education_entry_barrier for item in items))}."
        )

        return CareerComparisonResponse(
            careers=items,
            common_skills=common_skills,
            unique_skills=unique_skills,
            comparison_summary=summary
        )
