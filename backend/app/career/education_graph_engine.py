"""
Education-to-Career Intelligence Graph Engine (Phase 11 Stage 3)
Evaluates structured academic backgrounds (Phase 9 Indian education taxonomy,
PCM/PCB/Commerce/Humanities/Diploma/ITI), subject exposure, and regulatory gates
against career requirements to generate transparent, auditable pathways and DecisionTraces.
"""

from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session, joinedload

from backend.app.models.profile import LearnerProfile
from backend.app.models.career import Career, CareerEducationRequirement, CareerSkillRequirement
from backend.app.models.skill import LearnerSkill
from backend.app.schemas.career import EducationFitResponse


class EducationGraphEngine:
    def __init__(self, db: Session):
        self.db = db

    def evaluate_education_fit(
        self,
        profile: LearnerProfile,
        career_slug: str
    ) -> Optional[EducationFitResponse]:
        """
        Authoritative evaluation of learner academic profile against career entry requirements.
        Produces structured fit rating, clear rationale, bridge requirements, and DecisionTrace.
        """
        career = self.db.query(Career).filter(
            Career.slug == career_slug,
            Career.is_active == True
        ).options(
            joinedload(Career.education_requirements),
            joinedload(Career.skill_requirements).joinedload(CareerSkillRequirement.skill),
            joinedload(Career.regional_metadata)
        ).first()

        if not career:
            return None

        # Extract learner signals
        stage = (profile.education_stage or profile.education_level or "unspecified").lower()
        stream = (profile.education_stream or profile.field_of_study or "").lower()
        specialization = (profile.specialization or "").lower()
        subject_combo = (profile.subject_combination or "").lower()
        subjects = [s.lower() for s in (profile.subjects or [])]

        # Extract learner acquired skills
        learner_skill_slugs = set()
        if profile.skill_confidence_map:
            learner_skill_slugs.update(k.lower() for k in profile.skill_confidence_map.keys())
        if profile.id:
            db_skills = self.db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
            for ls in db_skills:
                if ls.skill:
                    learner_skill_slugs.add(ls.skill.slug.lower())

        # Analyze Career Mandatory & Recommended Skills
        mandatory_skills = []
        recommended_skills = []
        for sr in (career.skill_requirements or []):
            if sr.skill:
                if sr.importance == "MANDATORY":
                    mandatory_skills.append(sr.skill.slug.lower())
                else:
                    recommended_skills.append(sr.skill.slug.lower())

        missing_mandatory = [s for s in mandatory_skills if s not in learner_skill_slugs]
        recommended_bridge = [s for s in recommended_skills if s not in learner_skill_slugs]

        # Evaluate Hard Regulatory Gates
        decision_trace: List[Dict[str, Any]] = []
        is_regulated_blocked = False
        regulatory_notice = None

        if career.is_regulated:
            decision_trace.append({
                "step": "REGULATORY_VERIFICATION",
                "signal": f"Career is statutory/regulated ({career.regulation_country or 'Global'})",
                "evidence": career.qualification_requirement,
                "weight": 1.0,
                "verdict": "VERIFYING_PREREQUISITES"
            })

            # Check specific regulated career prerequisites
            if career.slug in ["doctor", "nurse"]:
                has_bio = any("bio" in s or "pcb" in s for s in subjects + [stream, subject_combo])
                has_medical_stream = any("med" in s or "nursing" in s or "mbbs" in s for s in [stream, specialization])
                if not (has_bio or has_medical_stream):
                    is_regulated_blocked = True
                    regulatory_notice = (
                        f"{career.canonical_name} is a strictly regulated medical profession requiring statutory "
                        f"PCB (Physics, Chemistry, Biology) background and accredited medical university licensing. "
                        f"Non-medical backgrounds require statutory pre-medical bridge coursework before licensure."
                    )
                    decision_trace.append({
                        "step": "STATUTORY_MEDICAL_GATE",
                        "signal": "Secondary/Undergraduate subjects",
                        "evidence": f"Found: {subjects or [stream]} | Required: Physics, Chemistry, Biology",
                        "weight": 1.0,
                        "verdict": "BLOCKED_REGULATORY"
                    })

            elif career.slug == "commercial-airline-pilot":
                has_pcm = any("pcm" in s or ("math" in s and "phy" in s) for s in subjects + [stream, subject_combo])
                if not has_pcm:
                    is_regulated_blocked = True
                    regulatory_notice = (
                        f"Commercial Airline Pilot licensing under DGCA / FAA mandates Class 12 completion "
                        f"with Physics and Mathematics. Open School (NIOS) bridge examinations are available "
                        f"to fulfill statutory prerequisites."
                    )
                    decision_trace.append({
                        "step": "STATUTORY_AVIATION_GATE",
                        "signal": "10+2 Subject Prerequisites",
                        "evidence": f"Found: {subjects or [stream]} | Required: Physics & Mathematics",
                        "weight": 1.0,
                        "verdict": "BLOCKED_REGULATORY"
                    })

            elif career.slug == "corporate-lawyer":
                has_law = any("law" in s or "llb" in s for s in [stream, specialization, stage])
                if not has_law and "undergraduate" in stage:
                    # Not permanently blocked if they pursue 3-year LL.B. post-grad
                    regulatory_notice = (
                        f"Practicing as a Corporate Lawyer requires an LL.B. degree recognized by the Bar Council. "
                        f"Graduates of any discipline can enroll in a 3-year LL.B. program."
                    )
                    decision_trace.append({
                        "step": "STATUTORY_LEGAL_PATHWAY",
                        "signal": "Law Degree Enrollment",
                        "evidence": "Degree entry available via 3-year LL.B. post-graduation",
                        "weight": 0.8,
                        "verdict": "BRIDGE_QUALIFICATION_REQUIRED"
                    })

        # Evaluate Academic Alignment & Pathways
        education_fit = "BRIDGE_REQUIRED"
        education_reason = ""
        suggested_pathways: List[str] = []

        if is_regulated_blocked:
            education_fit = "REGULATED_PREREQUISITE_MISSING"
            education_reason = regulatory_notice or "Statutory qualification requirements are not met."
            suggested_pathways = ["Statutory Prerequisite Bridge Pathway", "Alternative Quantitative Pathway"]

        else:
            # Check for Direct or Strong Fit
            is_direct_degree = False
            has_relevant_subjects = False

            for req in (career.education_requirements or []):
                pref_streams = [ps.lower() for ps in (req.preferred_streams or [])]
                subj_prereqs = [sp.lower() for sp in (req.subject_prerequisites or [])]

                # Match stream
                if any(ps in stream or ps in specialization for ps in pref_streams):
                    is_direct_degree = True

                # Match subjects
                if subj_prereqs:
                    matched_subj_count = sum(
                        1 for sp in subj_prereqs
                        if any(sp in s for s in subjects + [subject_combo, stream])
                    )
                    if matched_subj_count >= len(subj_prereqs):
                        has_relevant_subjects = True

            decision_trace.append({
                "step": "ACADEMIC_STREAM_ALIGNMENT",
                "signal": f"Stream: {stream} | Specialization: {specialization}",
                "evidence": f"Direct Degree: {is_direct_degree} | Relevant Subjects: {has_relevant_subjects}",
                "weight": 0.9,
                "verdict": "EVALUATED"
            })

            # Check special cross-stream bridges:
            is_commerce_data_fit = (
                career.slug in ["data-scientist", "financial-analyst", "chartered-accountant"]
                and any("commerce" in s or "math" in s for s in [stream, subject_combo] + subjects)
            )
            is_humanities_design_fit = (
                career.slug in ["graphic-designer", "ui-ux-designer", "video-editor"]
            )

            if is_direct_degree and len(missing_mandatory) == 0:
                education_fit = "DIRECT_FIT"
                education_reason = (
                    f"Your academic background in {profile.specialization or profile.field_of_study or 'this field'} "
                    f"and established skill set provide direct entry into {career.canonical_name}."
                )
                suggested_pathways = ["Direct Professional Career Pathway"]

            elif is_humanities_design_fit and len(missing_mandatory) > 0:
                education_fit = "BRIDGE_REQUIRED"
                education_reason = (
                    f"Careers in {career.canonical_name} prioritize portfolio depth and creative tool proficiency "
                    f"over specific degree disciplines. Developing core design software and project assets is recommended."
                )
                suggested_pathways = ["Portfolio-First Creative Bridge Pathway"]

            elif is_direct_degree or has_relevant_subjects:
                education_fit = "STRONG_FIT"
                education_reason = (
                    f"Your coursework in {profile.specialization or profile.education_stream or 'relevant discipline'} "
                    f"provides strong foundational alignment for {career.canonical_name}."
                )
                suggested_pathways = ["Accelerated Technical Specialization Pathway"]

            elif is_commerce_data_fit:
                education_fit = "STRONG_FIT"
                education_reason = (
                    f"Your background in Commerce and Mathematics gives you an analytical advantage. "
                    f"Ramping up programming and data modeling will complete your transition."
                )
                suggested_pathways = ["Quantitative Analytics Bridge Pathway"]

            else:
                education_fit = "BRIDGE_REQUIRED"
                education_reason = (
                    f"Learners from {profile.field_of_study or profile.education_stage or 'diverse backgrounds'} "
                    f"can successfully enter {career.canonical_name} through hands-on competency bridge pathways."
                )
                suggested_pathways = ["Foundational Competency Bridge Pathway"]

        decision_trace.append({
            "step": "FINAL_FIT_SYNTHESIS",
            "signal": f"Resulting Fit: {education_fit}",
            "evidence": education_reason,
            "weight": 1.0,
            "verdict": education_fit
        })

        return EducationFitResponse(
            career_slug=career.slug,
            career_name=career.canonical_name,
            education_fit=education_fit,
            education_reason=education_reason,
            is_regulated_blocked=is_regulated_blocked,
            regulatory_notice=regulatory_notice,
            matched_background={
                "stage": profile.education_stage or profile.education_level,
                "stream": profile.education_stream or profile.field_of_study,
                "specialization": profile.specialization,
                "subjects": profile.subjects or []
            },
            mandatory_skills_met=(len(missing_mandatory) == 0),
            missing_mandatory_skills=missing_mandatory,
            recommended_bridge_skills=recommended_bridge,
            suggested_pathways=suggested_pathways,
            decision_trace=decision_trace
        )
