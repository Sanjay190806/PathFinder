"""
Authoritative Career Requirement & Pathway Evaluation Engine (Phase 11 Stage 4)
Evaluates canonical career requirements, checks statutory/regulatory prerequisites,
and analyzes multi-pathway options for learners without fabricating data.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.career import (
    Career,
    CareerRequirement,
    CareerPathwayDefinition,
    PathwayStepDefinition,
    CareerSkillRequirement,
    CareerEducationRequirement,
    CareerRegionalMetadata
)
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import LearnerSkill, Skill
from backend.app.schemas.career_requirements import (
    CareerRequirementItem,
    LearnerRequirementEvaluationItem,
    PathwayStepResponse,
    CareerPathwayResponse,
    CareerEligibilityResponse,
)


class CareerRequirementEngine:
    """
    Authoritative requirement evaluation and pathway intelligence service.
    """

    def __init__(self, db: Session):
        self.db = db

    def get_career_requirements(self, career_id: str) -> List[CareerRequirement]:
        """Fetch all canonical requirements for a career ordered by importance."""
        return self.db.query(CareerRequirement).filter(
            CareerRequirement.career_id == career_id
        ).order_by(CareerRequirement.mandatory.desc()).all()

    def get_career_pathways(self, career_id: str) -> List[CareerPathwayDefinition]:
        """Fetch all defined pathways for a career with steps."""
        return self.db.query(CareerPathwayDefinition).filter(
            CareerPathwayDefinition.career_id == career_id
        ).order_by(CareerPathwayDefinition.is_primary.desc()).all()

    def evaluate_career_eligibility(
        self,
        career_slug: str,
        profile_id: Optional[str] = None
    ) -> CareerEligibilityResponse:
        """
        Authoritatively evaluate whether a learner satisfies requirements for a target career.
        If profile_id is None, returns base requirement and pathway metadata with UNKNOWN statuses.
        """
        trace: Dict[str, Any] = {
            "career_slug": career_slug,
            "profile_id": profile_id,
            "rules_applied": [],
            "evidence_evaluated": []
        }

        career = self.db.query(Career).filter(Career.slug == career_slug).first()
        if not career:
            raise ValueError(f"Career with slug '{career_slug}' not found.")

        # Load regional / statutory metadata
        reg_meta = self.db.query(CareerRegionalMetadata).filter(
            CareerRegionalMetadata.career_id == career.id
        ).first()

        regulatory_body = reg_meta.regulatory_body if reg_meta else (career.regulatory_requirement if career.is_regulated else None)
        statutory_exam = reg_meta.statutory_exam if reg_meta else None

        # Load learner profile if provided
        profile: Optional[LearnerProfile] = None
        learner_skills_map: Dict[str, LearnerSkill] = {}
        learner_subjects: List[str] = []
        learner_stream: Optional[str] = None

        if profile_id:
            profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
            if profile:
                trace["rules_applied"].append("Loaded learner profile with academic and skill records.")
                # Map learner skills
                for ls in profile.learner_skills:
                    if ls.skill:
                        learner_skills_map[ls.skill.slug] = ls
                        learner_skills_map[ls.skill_id] = ls

                # Extract subjects and stream
                if profile.subjects:
                    if isinstance(profile.subjects, list):
                        learner_subjects = [str(s).lower().strip() for s in profile.subjects]
                    elif isinstance(profile.subjects, str):
                        learner_subjects = [s.strip().lower() for s in profile.subjects.split(",")]

                learner_stream = (profile.education_stream or profile.field_of_study or "").lower().strip()
                trace["evidence_evaluated"].append(f"Learner stream: {learner_stream}, subjects: {learner_subjects}")
            else:
                trace["rules_applied"].append("Profile ID provided was not found in DB; treating as unauthenticated/insufficient.")

        # Load requirements
        db_requirements = self.get_career_requirements(career.id)
        evaluation_items: List[LearnerRequirementEvaluationItem] = []
        satisfied_count = 0
        missing_count = 0
        unknown_count = 0
        bridge_requirements: List[str] = []

        has_profile = profile is not None

        for req in db_requirements:
            status = "UNKNOWN"
            evidence = None
            gap_notes = None

            if not has_profile:
                status = "UNKNOWN"
                gap_notes = "Learner profile not provided for evaluation."
                unknown_count += 1
            else:
                # 1. Evaluate SKILL requirements
                if req.category == "SKILL":
                    skill = req.skill
                    skill_slug = skill.slug if skill else None
                    matching_ls = learner_skills_map.get(skill_slug) if skill_slug else None
                    if not matching_ls and req.skill_id:
                        matching_ls = learner_skills_map.get(req.skill_id)

                    if matching_ls:
                        score = matching_ls.assessed_confidence or 0.0
                        if score >= 0.65 or matching_ls.self_rating in ["Advanced", "Expert"]:
                            status = "SATISFIED"
                            evidence = f"Assessed confidence: {score:.2f}, self-rating: {matching_ls.self_rating}"
                            satisfied_count += 1
                        elif score >= 0.35 or matching_ls.self_rating == "Intermediate":
                            status = "PARTIALLY_SATISFIED"
                            evidence = f"Intermediate competency detected ({score:.2f})"
                            gap_notes = f"Target proficiency is {req.minimum_level}; current is intermediate."
                            bridge_requirements.append(f"Upskill in {req.requirement_name}")
                        else:
                            status = "MISSING"
                            gap_notes = f"Skill level below minimum required ({score:.2f})"
                            missing_count += 1
                            if req.mandatory:
                                bridge_requirements.append(f"Master {req.requirement_name}")
                    else:
                        status = "MISSING"
                        gap_notes = "No verified skill evidence or self-rating found."
                        missing_count += 1
                        if req.mandatory:
                            bridge_requirements.append(f"Acquire {req.requirement_name}")

                # 2. Evaluate EDUCATION / DEGREE requirements
                elif req.category in ["EDUCATION", "DEGREE", "SUBJECT"]:
                    req_name_lower = req.requirement_name.lower()
                    desc_lower = (req.description or "").lower()

                    # Check for PCB (Physics, Chemistry, Biology)
                    if "pcb" in req_name_lower or "biology" in req_name_lower or "biology" in desc_lower:
                        has_bio = any("bio" in s for s in learner_subjects) or "pcb" in learner_stream or "medicine" in learner_stream
                        has_chem = any("chem" in s for s in learner_subjects) or "pcb" in learner_stream
                        has_phy = any("phys" in s for s in learner_subjects) or "pcb" in learner_stream or "pcm" in learner_stream

                        if has_bio and has_chem and has_phy:
                            status = "SATISFIED"
                            evidence = "Verified Physics, Chemistry, Biology coursework in learner background."
                            satisfied_count += 1
                        elif not learner_subjects and not learner_stream:
                            status = "UNKNOWN"
                            unknown_count += 1
                            gap_notes = "Subject combination not specified in learner profile."
                        else:
                            status = "MISSING"
                            missing_count += 1
                            gap_notes = "Mandatory Biology/PCB combination not found in learner profile."
                            bridge_requirements.append("NIOS / Pre-Med PCB Bridge Course")

                    # Check for PCM (Physics, Chemistry, Mathematics)
                    elif "pcm" in req_name_lower or "mathematics" in req_name_lower or "math" in desc_lower:
                        has_math = any("math" in s for s in learner_subjects) or "pcm" in learner_stream or "engineering" in learner_stream or "computer" in learner_stream
                        has_phy = any("phys" in s for s in learner_subjects) or "pcm" in learner_stream or "engineering" in learner_stream

                        if has_math and has_phy:
                            status = "SATISFIED"
                            evidence = "Verified Mathematics and Physics coursework in background."
                            satisfied_count += 1
                        elif not learner_subjects and not learner_stream:
                            status = "UNKNOWN"
                            unknown_count += 1
                            gap_notes = "Subject combination not specified."
                        else:
                            status = "MISSING"
                            missing_count += 1
                            gap_notes = "Mathematics / Physics coursework missing."
                            bridge_requirements.append("10+2 Mathematics Foundation")

                    # Check degree requirements
                    elif req.education_level:
                        learner_stage = (profile.education_stage or profile.education_level or "").lower()
                        if req.education_level == "secondary" and learner_stage:
                            status = "SATISFIED"
                            evidence = f"Learner has attained at least {learner_stage} education."
                            satisfied_count += 1
                        elif req.education_level in ["undergraduate", "bachelor"]:
                            if any(k in learner_stage for k in ["undergraduate", "bachelor", "graduate", "postgraduate", "master"]):
                                status = "SATISFIED"
                                evidence = f"Current education stage: {learner_stage}"
                                satisfied_count += 1
                            elif "higher-secondary" in learner_stage or "12th" in learner_stage:
                                status = "PARTIALLY_SATISFIED"
                                evidence = "Eligible for undergraduate degree enrollment."
                                gap_notes = f"Undergraduate degree in progress or pending."
                            else:
                                status = "MISSING"
                                gap_notes = f"Requires {req.education_level} degree."
                                missing_count += 1
                        else:
                            # General match
                            status = "PARTIALLY_SATISFIED"
                            gap_notes = f"Education level requires verification ({req.education_level})."
                    else:
                        status = "PARTIALLY_SATISFIED"

                # 3. Evaluate REGULATORY / LICENSE requirements
                elif req.category in ["REGULATORY", "LICENSE", "CERTIFICATION"]:
                    # Regulated statutory licenses require explicit verification
                    status = "MISSING"
                    gap_notes = f"Official {req.requirement_name} certification/clearance required."
                    missing_count += 1
                    if req.mandatory:
                        bridge_requirements.append(f"Clear {req.requirement_name}")

                # 4. Evaluate PORTFOLIO / PROJECT
                elif req.category in ["PORTFOLIO", "PROJECT"]:
                    # Check if learner has portfolio artifacts
                    has_portfolio = False
                    if hasattr(profile, "practical_competencies") and profile.practical_competencies:
                        has_portfolio = True
                    if hasattr(profile, "learning_objective") and "Portfolio" in (profile.learning_objective or ""):
                        has_portfolio = True

                    if has_portfolio:
                        status = "PARTIALLY_SATISFIED"
                        evidence = "Practical competencies and project artifacts recorded."
                        satisfied_count += 1
                    else:
                        status = "MISSING"
                        gap_notes = f"{req.requirement_name} required."
                        missing_count += 1
                        bridge_requirements.append(f"Build {req.requirement_name}")

                else:
                    status = "UNKNOWN"
                    unknown_count += 1

            evaluation_items.append(LearnerRequirementEvaluationItem(
                requirement_id=req.id,
                requirement_name=req.requirement_name,
                category=req.category,
                requirement_type=req.requirement_type,
                mandatory=req.mandatory,
                status=status,
                learner_evidence=evidence,
                gap_notes=gap_notes
            ))

        # Evaluate Pathways
        db_pathways = self.get_career_pathways(career.id)
        pathway_responses: List[CareerPathwayResponse] = []

        for p in db_pathways:
            p_status = "UNKNOWN"
            if has_profile:
                # Check background match
                bg_list = [b.lower() for b in (p.applicable_backgrounds or [])]
                stream_match = any(b in learner_stream for b in bg_list) if learner_stream else False
                subject_match = any(any(b in s for s in learner_subjects) for b in bg_list)
                general_match = "any" in bg_list or "general" in bg_list or "any-12th" in bg_list or "any-10th" in bg_list

                if stream_match or subject_match or general_match:
                    if p.pathway_type in ["BRIDGE", "CAREER_TRANSITION"]:
                        p_status = "BRIDGE_REQUIRED"
                    else:
                        p_status = "ELIGIBLE"
                else:
                    if p.pathway_type in ["BRIDGE", "CAREER_TRANSITION"]:
                        p_status = "BRIDGE_REQUIRED"
                    else:
                        p_status = "INELIGIBLE"

            step_responses = [
                PathwayStepResponse(
                    step_number=s.step_number,
                    title=s.title,
                    description=s.description,
                    step_type=s.step_type,
                    skills_to_acquire=s.skills_to_acquire or [],
                    estimated_weeks=s.estimated_weeks or 4,
                    prerequisites=s.prerequisites or [],
                    status="NOT_STARTED"
                )
                for s in p.steps
            ]

            pathway_responses.append(CareerPathwayResponse(
                pathway_id=p.pathway_id,
                pathway_type=p.pathway_type,
                title=p.title,
                description=p.description,
                applicable_backgrounds=p.applicable_backgrounds or [],
                duration_estimate=p.duration_estimate,
                difficulty_level=p.difficulty_level,
                is_primary=p.is_primary,
                steps=step_responses,
                milestones=step_responses,
                learner_eligibility_status=p_status
            ))

        # Determine overall eligibility verdict
        total_reqs = len(evaluation_items)
        mandatory_missing = sum(1 for item in evaluation_items if item.mandatory and item.status == "MISSING")
        mandatory_satisfied = sum(1 for item in evaluation_items if item.mandatory and item.status in ["SATISFIED", "PARTIALLY_SATISFIED"])

        if not has_profile or (total_reqs > 0 and unknown_count == total_reqs):
            overall_eligibility = "INSUFFICIENT_DATA"
            satisfaction_score = None
        elif career.is_regulated and mandatory_missing > 0:
            # For heavily regulated careers (Doctor, Pilot), missing hard academic prerequisite (e.g. PCB/PCM) makes direct entry ineligible without bridge
            if any("pcb" in item.gap_notes.lower() or "mathematics" in item.gap_notes.lower() for item in evaluation_items if item.gap_notes):
                overall_eligibility = "BRIDGE_REQUIRED"
            else:
                overall_eligibility = "BRIDGE_REQUIRED"
            satisfaction_score = round(satisfied_count / total_reqs, 2) if total_reqs > 0 else 0.0
        elif mandatory_missing == 0:
            overall_eligibility = "ELIGIBLE"
            satisfaction_score = round(satisfied_count / total_reqs, 2) if total_reqs > 0 else 1.0
        elif len(bridge_requirements) > 0:
            overall_eligibility = "BRIDGE_REQUIRED"
            satisfaction_score = round(satisfied_count / total_reqs, 2) if total_reqs > 0 else 0.0
        else:
            overall_eligibility = "INELIGIBLE"
            satisfaction_score = round(satisfied_count / total_reqs, 2) if total_reqs > 0 else 0.0

        trace["verdict"] = overall_eligibility
        trace["mandatory_missing"] = mandatory_missing
        trace["mandatory_satisfied"] = mandatory_satisfied
        trace["bridge_requirements_count"] = len(bridge_requirements)

        mandatory_skills_list = [
            csr.skill.slug for csr in career.skill_requirements
            if csr.importance in ["MANDATORY", "CRITICAL"] and csr.skill
        ]

        return CareerEligibilityResponse(
            career_slug=career.slug,
            career_title=career.display_name,
            is_regulated=career.is_regulated or False,
            regulatory_body=regulatory_body,
            statutory_exam=statutory_exam,
            overall_eligibility=overall_eligibility,
            satisfaction_score=satisfaction_score,
            satisfied_count=satisfied_count,
            missing_count=missing_count,
            unknown_count=unknown_count,
            total_requirements=total_reqs,
            mandatory_skills=mandatory_skills_list,
            requirements=evaluation_items,
            pathways=pathway_responses,
            bridge_requirements=list(set(bridge_requirements)),
            decision_trace=trace
        )
