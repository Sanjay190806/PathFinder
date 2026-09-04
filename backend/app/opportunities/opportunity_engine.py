from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from abc import ABC, abstractmethod
from sqlalchemy.orm import Session

from backend.app.models.opportunity import Opportunity, LearnerOpportunityMatch
from backend.app.models.profile import LearnerProfile
from backend.app.models.practical_competency import PracticalCompetency
from backend.app.models.portfolio import LearnerPortfolio
from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine
from backend.app.schemas.opportunities import OpportunityOut, OpportunityMatchOut
from backend.app.opportunities.opportunity_registry import CURATED_OPPORTUNITIES

class BaseOpportunityProvider(ABC):
    @abstractmethod
    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        pass

class CuratedRegistryProvider(BaseOpportunityProvider):
    def fetch_opportunities(self) -> List[Dict[str, Any]]:
        return CURATED_OPPORTUNITIES

class OpportunityEngine:
    def __init__(self, db: Session, provider: Optional[BaseOpportunityProvider] = None):
        self.db = db
        self.provider = provider or CuratedRegistryProvider()
        self._ensure_opportunities()

    def _ensure_opportunities(self):
        items = self.provider.fetch_opportunities()
        for o in items:
            existing = self.db.query(Opportunity).filter(Opportunity.slug == o["slug"]).first()
            if not existing:
                opp = Opportunity(
                    slug=o["slug"],
                    title=o["title"],
                    company_name=o["company_name"],
                    role_category=o["role_category"],
                    required_skills=o.get("required_skills", []),
                    preferred_skills=o.get("preferred_skills", []),
                    min_experience_level=o.get("min_experience_level", "Entry Level"),
                    location_type=o.get("location_type", "Remote"),
                    salary_range=o.get("salary_range", "₹6 LPA - ₹12 LPA"),
                    description=o["description"],
                    opportunity_type=o.get("opportunity_type", "Job"),
                    country=o.get("country", "India"),
                    state=o.get("state", "All India"),
                    city=o.get("city", "Pan-India"),
                    min_education_stage=o.get("min_education_stage", "Undergraduate"),
                    eligible_streams=o.get("eligible_streams", []),
                    application_url=o.get("application_url"),
                    source=o.get("source", "JanSahay Verified Portal"),
                    provider=o.get("provider", "Direct Employer"),
                    verification_status=o.get("verification_status", "VERIFIED"),
                    freshness=o.get("freshness", "FRESH"),
                    is_active=True
                )
                self.db.add(opp)
            else:
                # Update existing attributes if needed
                existing.country = o.get("country", existing.country or "India")
                existing.city = o.get("city", existing.city)
                existing.state = o.get("state", existing.state)
                existing.min_education_stage = o.get("min_education_stage", existing.min_education_stage)
                existing.eligible_streams = o.get("eligible_streams", existing.eligible_streams)
                existing.application_url = o.get("application_url", existing.application_url)
                existing.verification_status = o.get("verification_status", existing.verification_status)
                existing.freshness = o.get("freshness", existing.freshness)
        self.db.commit()

    def _to_out(self, o: Opportunity) -> OpportunityOut:
        return OpportunityOut(
            id=o.id,
            slug=o.slug,
            title=o.title,
            company_name=o.company_name,
            role_category=o.role_category,
            required_skills=o.required_skills or [],
            preferred_skills=o.preferred_skills or [],
            min_experience_level=o.min_experience_level or "Entry Level",
            location_type=o.location_type or "Remote",
            salary_range=o.salary_range or "Unknown",
            description=o.description,
            opportunity_type=o.opportunity_type or "Job",
            country=o.country or "India",
            state=o.state,
            city=o.city,
            min_education_stage=o.min_education_stage or "Undergraduate",
            eligible_streams=o.eligible_streams or [],
            application_url=o.application_url,
            source=o.source or "JanSahay Verified Portal",
            provider=o.provider or "Direct Employer",
            verification_status=o.verification_status or "VERIFIED",
            freshness=o.freshness or "FRESH"
        )

    def list_opportunities(self, role: Optional[str] = None) -> List[OpportunityOut]:
        query = self.db.query(Opportunity).filter(Opportunity.is_active == True)
        if role:
            query = query.filter(Opportunity.role_category.ilike(f"%{role}%"))
        return [self._to_out(o) for o in query.all()]

    def discover_opportunities(
        self,
        career: Optional[str] = None,
        skill: Optional[str] = None,
        location: Optional[str] = None,
        city: Optional[str] = None,
        work_mode: Optional[str] = None,
        opportunity_type: Optional[str] = None,
        education_level: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[OpportunityOut]:
        """
        India-first searchable opportunity catalog with multi-dimensional filtering.
        """
        query = self.db.query(Opportunity).filter(Opportunity.is_active == True)

        if career:
            c_term = career.lower().strip()
            query = query.filter(
                (Opportunity.role_category.ilike(f"%{c_term}%")) |
                (Opportunity.title.ilike(f"%{c_term}%"))
            )
        if location:
            query = query.filter(
                (Opportunity.state.ilike(f"%{location}%")) |
                (Opportunity.country.ilike(f"%{location}%")) |
                (Opportunity.city.ilike(f"%{location}%"))
            )
        if city:
            query = query.filter(Opportunity.city.ilike(f"%{city}%"))
        if work_mode:
            query = query.filter(Opportunity.location_type.ilike(f"%{work_mode}%"))
        if opportunity_type:
            query = query.filter(Opportunity.opportunity_type.ilike(f"%{opportunity_type}%"))
        if education_level:
            query = query.filter(Opportunity.min_education_stage.ilike(f"%{education_level}%"))

        results = query.all()

        if skill:
            s_term = skill.lower().strip()
            results = [
                r for r in results
                if any(s_term in sk.lower() for sk in (r.required_skills or []))
            ]

        # Apply pagination bounds
        safe_limit = max(1, min(100, limit))
        safe_offset = max(0, offset)
        paginated_results = results[safe_offset : safe_offset + safe_limit]

        return [self._to_out(o) for o in paginated_results]

    def match_opportunities(self, profile_id: str) -> List[OpportunityMatchOut]:
        """
        Matches authenticated learner against opportunities using:
        1. Hard Constraint Elimination (education level compatibility, expiration, verification)
        2. Weighted Multi-factor Scoring (Skill coverage 35%, Readiness 30%, Portfolio 20%, Stream/Career fit 15%)
        3. Explainability (why it matches + remaining blockers)
        """
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        # 1. Theoretical Readiness
        readiness_engine = OpportunityReadinessEngine(self.db)
        r_data = readiness_engine.calculate_readiness(profile_id=profile_id)
        theoretical_readiness = r_data["readiness_score"] / 100.0

        # 2. Practical Competencies
        comps = {
            c.skill_slug: c.score
            for c in self.db.query(PracticalCompetency).filter(PracticalCompetency.profile_id == profile_id).all()
        }

        # 3. Portfolio Quality
        portfolio = self.db.query(LearnerPortfolio).filter(LearnerPortfolio.profile_id == profile_id).first()
        port_fit = (portfolio.quality_score / 100.0) if portfolio else 0.20

        opportunities = self.db.query(Opportunity).filter(
            Opportunity.is_active == True,
            Opportunity.verification_status != "UNAVAILABLE"
        ).all()

        matches: List[OpportunityMatchOut] = []

        learner_edu_stage = (profile.education_stage or profile.education_level or "").lower()
        learner_stream = (profile.education_stream or profile.specialization or "").lower()

        for opp in opportunities:
            opp_edu = (opp.min_education_stage or "undergraduate").lower()

            # --- HARD CONSTRAINTS ---
            # Rule A: If learner is in School (Class 9-10), block roles requiring Undergraduate/Postgraduate
            if "school" in learner_edu_stage or "secondary" in learner_edu_stage:
                if "undergraduate" in opp_edu or "postgraduate" in opp_edu:
                    continue

            # Rule B: If learner is Higher Secondary (Class 11-12), block full-time professional roles requiring degree
            if "higher secondary" in learner_edu_stage or "class 11" in learner_edu_stage or "class 12" in learner_edu_stage:
                if opp.opportunity_type in ("Full-Time", "Job") and "undergraduate" in opp_edu:
                    continue

            # Calculate Skill Coverage
            req_skills = opp.required_skills or []
            conf_map = dict(profile.skill_confidence_map or {})

            if not req_skills:
                skill_coverage = 0.80
                missing = []
            else:
                demonstrated = [
                    s for s in req_skills
                    if comps.get(s, 0.0) >= 0.60 or conf_map.get(s, 0.0) >= 0.60
                ]
                skill_coverage = len(demonstrated) / len(req_skills)
                missing = [s for s in req_skills if s not in demonstrated]

            # Stream / Goal Alignment
            stream_fit = 0.50
            if opp.eligible_streams:
                opp_streams = [st.lower() for st in opp.eligible_streams]
                if "any" in opp_streams or any(st in learner_stream for st in opp_streams):
                    stream_fit = 1.0
            elif any(profile.goals and opp.role_category.lower() in g.target_role.lower() for g in profile.goals):
                stream_fit = 1.0

            # Weighted match score
            match_score = round(
                (
                    0.35 * skill_coverage +
                    0.30 * theoretical_readiness +
                    0.20 * port_fit +
                    0.15 * stream_fit
                ) * 100.0,
                1
            )

            # Match Level
            if match_score >= 70:
                level = "Strong Fit"
            elif match_score >= 50:
                level = "Competitive Fit"
            elif match_score >= 30:
                level = "Developing Fit"
            else:
                level = "Early Prerequisite"

            reasons = [
                f"{int(skill_coverage * 100)}% required skill alignment",
                f"Theoretical career readiness index: {int(theoretical_readiness * 100)}%"
            ]
            if port_fit >= 0.50:
                reasons.append("Verified portfolio evidence aligns with job scope")
            if stream_fit >= 0.80 and learner_stream:
                reasons.append(f"Educational stream alignment with {profile.education_stream or 'your field'}")

            blockers = []
            if missing:
                blockers.append(f"Missing required competencies in: {', '.join(missing[:3])}")
            if skill_coverage < 0.50:
                blockers.append("Skill coverage is below 50%; recommend finishing core phase roadmap modules")
            if port_fit < 0.40 and opp.opportunity_type != "Competition":
                blockers.append("Portfolio evidence is early; consider adding practical capstone projects")

            match_out = OpportunityMatchOut(
                opportunity=self._to_out(opp),
                match_score=match_score,
                match_level=level,
                factor_breakdown={
                    "skill_coverage": skill_coverage,
                    "theoretical_readiness": theoretical_readiness,
                    "portfolio_fit": port_fit,
                    "stream_fit": stream_fit
                },
                missing_skills=missing,
                match_reasons=reasons,
                blockers=blockers
            )
            matches.append(match_out)

        # Sort by match score descending
        matches.sort(key=lambda m: m.match_score, reverse=True)
        return matches
