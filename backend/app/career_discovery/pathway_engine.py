"""
Pathway Engine (Phase 9 Stage 3)
Resolves career eligibility, active learning routes, alternative pathways,
and integrates existing Phase 7 SkillGapEngine to identify missing skills and next actions.
"""

from typing import Dict, List, Optional, Any
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from backend.app.core.pathway_catalog import (
    CAREER_REQUIREMENTS_REGISTRY,
    CareerRequirements,
    CareerPathway,
    get_career_requirements
)
from backend.app.core.career_catalog import CAREER_ROLES_CATALOG
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.engine.skill_gap import SkillGapEngine, SkillGapReport

class NextLearningStep(BaseModel):
    step_type: str  # skill_foundation, academic_bridge, core_competency, capstone_project
    skill_slug: str
    skill_name: str
    reason: str
    priority: int  # 1 is highest priority
    estimated_hours: int

class CareerPathwayEvaluation(BaseModel):
    career_slug: str
    career_role: str
    domain_category: str
    eligibility_status: str  # DIRECT_ELIGIBLE, BRIDGE_RECOMMENDED, ALTERNATIVE_ROUTE, FOUNDATIONAL_PREPARATION
    academic_summary: str
    active_pathway: CareerPathway
    alternative_pathways: List[CareerPathway]
    satisfied_skills: List[str]
    missing_skills: List[str]
    mandatory_skills_met: bool
    readiness_percentage: int
    next_step: Optional[NextLearningStep]

class PathwayEngine:
    def __init__(self, db: Session):
        self.db = db
        self.gap_engine = SkillGapEngine(db=db)

    def evaluate_pathway(
        self,
        profile: LearnerProfile,
        career_slug: str
    ) -> Optional[CareerPathwayEvaluation]:
        """
        Evaluates learner background and existing skills against authoritative career requirements.
        Reuses Phase 7 SkillGapEngine for gap calculation.
        """
        reqs = get_career_requirements(career_slug)
        if not reqs:
            return None

        # 1. Academic Eligibility Assessment
        learner_stage = (profile.education_stage or profile.education_level or "").lower()
        learner_spec = (profile.specialization or profile.education_stream or "").lower().replace(" ", "-")

        is_level_accepted = any(lvl in learner_stage for lvl in reqs.accepted_education_levels)
        is_stream_preferred = any(st in learner_spec for st in reqs.preferred_streams)

        if is_level_accepted and is_stream_preferred:
            eligibility_status = "DIRECT_ELIGIBLE"
            academic_summary = (
                f"Your background in {profile.specialization or profile.education_stage} "
                f"provides direct academic entry into {reqs.career_role}."
            )
        elif is_level_accepted:
            eligibility_status = "BRIDGE_RECOMMENDED"
            academic_summary = (
                f"Your education level is accepted for {reqs.career_role}. "
                f"A foundational bridge module is recommended to ramp up technical prerequisites."
            )
        else:
            eligibility_status = "ALTERNATIVE_ROUTE"
            academic_summary = (
                f"An alternative or skill-supported route into {reqs.career_role} is recommended, "
                f"focusing on verified project evidence and foundational credentials."
            )

        # 2. Select Active vs Alternative Pathways
        active_path = reqs.pathways[0]
        alt_paths = reqs.pathways[1:] if len(reqs.pathways) > 1 else []

        matched_path = None
        # Exact background match has priority
        for p in reqs.pathways:
            if any(bg == learner_spec or bg == learner_stage for bg in p.applicable_backgrounds):
                matched_path = p
                break

        # Fallback to substring matching if no exact match found
        if not matched_path:
            for p in reqs.pathways:
                if any(bg in learner_spec or bg in learner_stage for bg in p.applicable_backgrounds):
                    matched_path = p
                    break

        if matched_path:
            active_path = matched_path
            alt_paths = [path for path in reqs.pathways if path.pathway_id != matched_path.pathway_id]

        # 3. Integrate SkillGapEngine (Phase 7 Reuse)
        # Create virtual Goal for gap analysis
        target_skills = reqs.mandatory_skills + reqs.recommended_skills
        virtual_goal = Goal(
            profile_id=profile.id,
            target_role=reqs.career_role,
            target_skills=target_skills,
            is_primary=True
        )

        gap_report: SkillGapReport = self.gap_engine.calculate(profile, virtual_goal)

        satisfied_skills = []
        missing_skills = []

        for item in gap_report.items:
            if item.current_confidence >= 0.50:
                satisfied_skills.append(item.skill_slug)
            else:
                missing_skills.append(item.skill_slug)

        mandatory_satisfied = all(s in satisfied_skills for s in reqs.mandatory_skills)
        readiness_pct = int((len(satisfied_skills) / len(target_skills) * 100)) if target_skills else 50

        # 4. Determine Single Next Learning Step
        next_step: Optional[NextLearningStep] = None
        if gap_report.priority_skills:
            top_gap_slug = gap_report.priority_skills[0]
            # Find item
            top_item = next((it for it in gap_report.items if it.skill_slug == top_gap_slug), None)
            skill_name = top_item.skill_name if top_item else top_gap_slug.replace("-", " ").title()

            is_mandatory = top_gap_slug in reqs.mandatory_skills
            step_type = "core_competency" if is_mandatory else "recommended_expansion"
            reason = (
                f"Core prerequisite for {reqs.career_role}. "
                f"Current confidence is {int((top_item.current_confidence if top_item else 0.0) * 100)}%."
            )
            next_step = NextLearningStep(
                step_type=step_type,
                skill_slug=top_gap_slug,
                skill_name=skill_name,
                reason=reason,
                priority=1,
                estimated_hours=15
            )
        elif not mandatory_satisfied:
            # First missing mandatory skill
            first_missing = next((s for s in reqs.mandatory_skills if s not in satisfied_skills), reqs.mandatory_skills[0])
            next_step = NextLearningStep(
                step_type="skill_foundation",
                skill_slug=first_missing,
                skill_name=first_missing.replace("-", " ").title(),
                reason=f"Foundational requirement for {reqs.career_role}.",
                priority=1,
                estimated_hours=12
            )
        else:
            # Ready for capstone evidence!
            next_step = NextLearningStep(
                step_type="capstone_project",
                skill_slug=target_skills[-1] if target_skills else "project",
                skill_name=f"{reqs.career_role} Capstone System",
                reason="All prerequisite skills satisfied. Demonstrate your skills with a production project.",
                priority=1,
                estimated_hours=25
            )

        return CareerPathwayEvaluation(
            career_slug=reqs.career_slug,
            career_role=reqs.career_role,
            domain_category=reqs.domain_category,
            eligibility_status=eligibility_status,
            academic_summary=academic_summary,
            active_pathway=active_path,
            alternative_pathways=alt_paths,
            satisfied_skills=satisfied_skills,
            missing_skills=missing_skills,
            mandatory_skills_met=mandatory_satisfied,
            readiness_percentage=readiness_pct,
            next_step=next_step
        )
