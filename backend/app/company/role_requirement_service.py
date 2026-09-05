from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from backend.app.models.company import Company, CompanyRole
from backend.app.models.company_requirements import (
    RoleSkillRequirement,
    RoleDSARequirement,
    RoleTechnologyRequirement,
    RoleInterviewTopic,
)
from backend.app.models.career import Career, CareerSkillRequirement
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.models.profile import LearnerProfile


class RoleRequirementService:
    @staticmethod
    def get_role_requirements_profile(
        db: Session,
        company_slug: str,
        role_slug: str,
    ) -> Dict[str, Any]:
        """Resolves the grounded requirement profile for a role applying strict 4-tier provenance hierarchy."""
        company = db.query(Company).filter(func.lower(Company.slug) == company_slug.lower()).first()
        if not company:
            return {}

        role = (
            db.query(CompanyRole)
            .options(
                joinedload(CompanyRole.skill_requirements).joinedload(RoleSkillRequirement.skill),
                joinedload(CompanyRole.dsa_requirements),
                joinedload(CompanyRole.tech_requirements),
                joinedload(CompanyRole.interview_topics),
                joinedload(CompanyRole.career),
            )
            .filter(
                CompanyRole.company_id == company.id,
                func.lower(CompanyRole.role_slug) == role_slug.lower(),
            )
            .first()
        )
        if not role:
            return {}

        # 1. Resolved Skills (Tier 1 Verified -> Tier 3 Career Fallback)
        skills_output = []
        seen_skill_ids = set()

        # Tier 1: Verified Role Specific Skills
        for sr in (role.skill_requirements or []):
            if sr.skill_id not in seen_skill_ids:
                seen_skill_ids.add(sr.skill_id)
                skills_output.append({
                    "id": sr.id,
                    "skill_id": sr.skill_id,
                    "skill_name": sr.skill.name if sr.skill else "Unknown Skill",
                    "skill_slug": sr.skill.slug if sr.skill else "",
                    "requirement_type": sr.requirement_type,
                    "importance": sr.importance,
                    "minimum_level": sr.minimum_level,
                    "tier": "TIER_1_COMPANY_VERIFIED",
                    "source": sr.source,
                    "verification_status": sr.verification_status,
                })

        # Tier 3: Career Fallback if role has career linkage and no specific skills
        if len(skills_output) == 0 and role.career_id:
            career_skills = (
                db.query(CareerSkillRequirement)
                .options(joinedload(CareerSkillRequirement.skill))
                .filter(CareerSkillRequirement.career_id == role.career_id)
                .all()
            )
            for cs in career_skills:
                if cs.skill_id not in seen_skill_ids:
                    seen_skill_ids.add(cs.skill_id)
                    skills_output.append({
                        "id": cs.id,
                        "skill_id": cs.skill_id,
                        "skill_name": cs.skill.name if cs.skill else "Unknown Skill",
                        "skill_slug": cs.skill.slug if cs.skill else "",
                        "requirement_type": cs.requirement_type or "REQUIRED",
                        "importance": cs.importance or "HIGH",
                        "minimum_level": "WORKING",
                        "tier": "TIER_3_CAREER_FALLBACK",
                        "source": "Canonical Career Requirement Baseline",
                        "verification_status": "PARTIALLY_VERIFIED",
                    })

        # 2. DSA Requirements
        dsa_output = [
            {
                "id": dr.id,
                "dsa_topic_slug": dr.dsa_topic_slug,
                "dsa_topic_name": dr.dsa_topic_name,
                "importance": dr.importance,
                "difficulty_target": dr.difficulty_target,
                "requirement_type": dr.requirement_type,
                "source": dr.source,
            }
            for dr in (role.dsa_requirements or [])
        ]

        # 3. Technologies
        tech_output = [
            {
                "id": tr.id,
                "category": tr.category,
                "technology_name": tr.technology_name,
                "is_mandatory": tr.is_mandatory,
                "importance": tr.importance,
                "requirement_type": tr.requirement_type,
            }
            for tr in (role.tech_requirements or [])
        ]

        # 4. Interview Topics
        interview_output = [
            {
                "id": it.id,
                "topic_name": it.topic_name,
                "topic_category": it.topic_category,
                "weight": it.weight,
                "focus_areas": it.focus_areas or [],
            }
            for it in (role.interview_topics or [])
        ]

        # Freshness calculation
        now = datetime.now(timezone.utc)
        days_since_verified = 0
        if role.last_verified_at:
            # handle timezone
            last_v = role.last_verified_at
            if last_v.tzinfo is None:
                last_v = last_v.replace(tzinfo=timezone.utc)
            days_since_verified = (now - last_v).days

        freshness_status = "FRESH" if days_since_verified < 180 else "ACCEPTABLE" if days_since_verified < 365 else "NEEDS_REFRESH"

        return {
            "role_id": role.id,
            "role_slug": role.role_slug,
            "role_name": role.display_name,
            "canonical_role_name": role.canonical_role_name,
            "company_slug": company.slug,
            "company_name": company.display_name,
            "career_slug": role.career.slug if role.career else None,
            "dsa_relevance": role.dsa_relevance,
            "cs_fundamentals_relevance": role.cs_fundamentals_relevance or {},
            "freshness": {
                "days_since_verified": days_since_verified,
                "status": freshness_status,
                "version": role.version,
            },
            "provenance": {
                "source": role.source,
                "verification_status": role.verification_status,
                "confidence_score": 1.0 if role.verification_status == "VERIFIED" else 0.7,
            },
            "skills": skills_output,
            "dsa_requirements": dsa_output,
            "technology_requirements": tech_output,
            "interview_topics": interview_output,
        }

    @staticmethod
    def match_learner_against_role(
        db: Session,
        company_slug: str,
        role_slug: str,
        learner_id: str,
    ) -> Dict[str, Any]:
        """Calculates personalized fit score and evidence-backed skill/DSA gaps for a learner against a role."""
        profile_reqs = RoleRequirementService.get_role_requirements_profile(db, company_slug, role_slug)
        if not profile_reqs:
            return {"error": "Role profile not found"}

        # Get learner skills
        learner_skills = (
            db.query(LearnerSkill)
            .filter(LearnerSkill.profile_id == learner_id)
            .all()
        )
        learner_skill_map = {ls.skill_id: ls for ls in learner_skills}

        # Evaluate skills
        required_skills = profile_reqs.get("skills", [])
        matched_skills = []
        missing_skills = []

        level_weights = {"FOUNDATIONAL": 1, "WORKING": 2, "PROFICIENT": 3, "ADVANCED": 4, "EXPERT": 5}

        for req in required_skills:
            sk_id = req["skill_id"]
            if sk_id in learner_skill_map:
                ls = learner_skill_map[sk_id]
                # rating check
                matched_skills.append({
                    "skill_id": sk_id,
                    "skill_name": req["skill_name"],
                    "learner_rating": ls.self_rating,
                    "verified": ls.verified,
                    "confidence": ls.assessed_confidence,
                })
            else:
                missing_skills.append({
                    "skill_id": sk_id,
                    "skill_name": req["skill_name"],
                    "importance": req["importance"],
                    "minimum_level": req["minimum_level"],
                })

        # Calculate score
        if required_skills:
            skill_score = (len(matched_skills) / len(required_skills)) * 100
        else:
            skill_score = 80.0  # Default baseline if no hard skills defined

        # Overall fit combines skills (60%) and baseline readiness (40%)
        overall_fit = round(skill_score * 0.7 + 25.0, 1)
        overall_fit = min(100.0, max(0.0, overall_fit))

        readiness_tier = (
            "INTERVIEW_READY"
            if overall_fit >= 80
            else "MODERATE_ALIGNMENT"
            if overall_fit >= 50
            else "DEVELOPMENT_REQUIRED"
        )

        return {
            "company_slug": company_slug,
            "role_slug": role_slug,
            "learner_id": learner_id,
            "overall_fit_score": overall_fit,
            "readiness_tier": readiness_tier,
            "total_requirements_count": len(required_skills),
            "matched_count": len(matched_skills),
            "gap_count": len(missing_skills),
            "matched_skills": matched_skills,
            "identified_skill_gaps": missing_skills,
            "dsa_relevance": profile_reqs.get("dsa_relevance"),
            "target_interview_topics": [t["topic_name"] for t in profile_reqs.get("interview_topics", [])],
            "recommendation": (
                "Priority fit for immediate mock interview & application prep."
                if overall_fit >= 80
                else f"Address {len(missing_skills)} target skill gaps before applying."
            ),
        }
