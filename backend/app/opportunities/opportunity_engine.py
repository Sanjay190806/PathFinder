from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.opportunity import Opportunity, LearnerOpportunityMatch
from backend.app.models.profile import LearnerProfile
from backend.app.models.practical_competency import PracticalCompetency
from backend.app.models.portfolio import LearnerPortfolio
from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine
from backend.app.schemas.opportunities import OpportunityOut, OpportunityMatchOut
from backend.app.opportunities.opportunity_registry import CURATED_OPPORTUNITIES

class OpportunityEngine:
    def __init__(self, db: Session):
        self.db = db
        self._ensure_opportunities()

    def _ensure_opportunities(self):
        for o in CURATED_OPPORTUNITIES:
            existing = self.db.query(Opportunity).filter(Opportunity.slug == o["slug"]).first()
            if not existing:
                opp = Opportunity(
                    slug=o["slug"],
                    title=o["title"],
                    company_name=o["company_name"],
                    role_category=o["role_category"],
                    required_skills=o["required_skills"],
                    preferred_skills=o["preferred_skills"],
                    min_experience_level=o["min_experience_level"],
                    location_type=o["location_type"],
                    salary_range=o["salary_range"],
                    description=o["description"],
                    opportunity_type=o["opportunity_type"],
                    is_active=True
                )
                self.db.add(opp)
        self.db.commit()

    def list_opportunities(self, role: Optional[str] = None) -> List[OpportunityOut]:
        query = self.db.query(Opportunity).filter(Opportunity.is_active == True)
        if role:
            query = query.filter(Opportunity.role_category.ilike(f"%{role}%"))
        return [
            OpportunityOut(
                id=o.id,
                slug=o.slug,
                title=o.title,
                company_name=o.company_name,
                role_category=o.role_category,
                required_skills=o.required_skills or [],
                preferred_skills=o.preferred_skills or [],
                min_experience_level=o.min_experience_level,
                location_type=o.location_type,
                salary_range=o.salary_range,
                description=o.description,
                opportunity_type=o.opportunity_type
            )
            for o in query.all()
        ]

    def match_opportunities(self, profile_id: str) -> List[OpportunityMatchOut]:
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

        opportunities = self.db.query(Opportunity).filter(Opportunity.is_active == True).all()
        matches: List[OpportunityMatchOut] = []

        for opp in opportunities:
            req_skills = opp.required_skills or []
            if not req_skills:
                skill_coverage = 0.80
                missing = []
            else:
                demonstrated = [s for s in req_skills if comps.get(s, 0.0) >= 0.60 or profile.skill_confidence_map.get(s, 0.0) >= 0.60]
                skill_coverage = len(demonstrated) / len(req_skills)
                missing = [s for s in req_skills if s not in demonstrated]

            # Weighted match formula
            match_score = round(
                (
                    0.35 * skill_coverage +
                    0.30 * theoretical_readiness +
                    0.20 * port_fit +
                    0.15 * (1.0 if any(profile.goals and opp.role_category.lower() in g.target_role.lower() for g in profile.goals) else 0.50)
                ) * 100.0,
                1
            )

            if match_score >= 75:
                level = "Strong Fit"
            elif match_score >= 55:
                level = "Competitive Fit"
            elif match_score >= 35:
                level = "Developing Fit"
            else:
                level = "Early Prerequisite"

            reasons = [
                f"{int(skill_coverage * 100)}% required skill coverage",
                f"Theoretical career readiness index: {int(theoretical_readiness * 100)}%"
            ]
            if port_fit >= 0.50:
                reasons.append("Verified portfolio evidence aligns with job scope")

            match_out = OpportunityMatchOut(
                opportunity=OpportunityOut(
                    id=opp.id,
                    slug=opp.slug,
                    title=opp.title,
                    company_name=opp.company_name,
                    role_category=opp.role_category,
                    required_skills=opp.required_skills or [],
                    preferred_skills=opp.preferred_skills or [],
                    min_experience_level=opp.min_experience_level,
                    location_type=opp.location_type,
                    salary_range=opp.salary_range,
                    description=opp.description,
                    opportunity_type=opp.opportunity_type
                ),
                match_score=match_score,
                match_level=level,
                factor_breakdown={
                    "skill_coverage": skill_coverage,
                    "theoretical_readiness": theoretical_readiness,
                    "portfolio_fit": port_fit
                },
                missing_skills=missing,
                match_reasons=reasons
            )
            matches.append(match_out)

        # Sort by match score descending
        matches.sort(key=lambda m: m.match_score, reverse=True)
        return matches
