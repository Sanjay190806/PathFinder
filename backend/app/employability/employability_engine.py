from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.practical_competency import PracticalCompetency, PracticalEvidenceRecord
from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine
from backend.app.portfolio.portfolio_engine import PortfolioEngine
from backend.app.schemas.employability import EmployabilityScoreOut

EMPLOYABILITY_LEVELS = [
    (90.0, "Strongly Demonstrated"),
    (75.0, "Job-Ready Track"),
    (60.0, "Interview Preparation"),
    (40.0, "Developing"),
    (20.0, "Early Development"),
    (0.0, "Foundation Required"),
]

def score_to_employability_level(score: float) -> str:
    for threshold, level in EMPLOYABILITY_LEVELS:
        if score >= threshold:
            return level
    return "Foundation Required"

class EmployabilityEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_employability(self, profile_id: str) -> EmployabilityScoreOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Engineering Career"

        # 1. Phase 7 Theoretical / Career Readiness (0-100)
        readiness_engine = OpportunityReadinessEngine(self.db)
        r_data = readiness_engine.calculate_readiness(profile_id=profile_id)
        career_readiness = r_data["readiness_score"]

        # 2. Phase 8 Practical Competencies (0-100)
        comps = self.db.query(PracticalCompetency).filter(PracticalCompetency.profile_id == profile_id).all()
        if comps:
            avg_comp_score = (sum(c.score for c in comps) / len(comps)) * 100.0
        else:
            avg_comp_score = 0.0

        all_evidence = (
            self.db.query(PracticalEvidenceRecord)
            .filter(PracticalEvidenceRecord.profile_id == profile_id)
            .all()
        )
        evidence_count = len(all_evidence)

        # Practical readiness blends practical competencies and evidence count
        practical_readiness = min(100.0, round(avg_comp_score * 0.70 + min(30.0, evidence_count * 10.0), 1))

        # 3. Portfolio Quality (0-100)
        port_engine = PortfolioEngine(self.db)
        port_data = port_engine.get_or_create_portfolio(profile_id=profile_id)
        portfolio_score = port_data.quality_score

        # 4. Market Alignment (0-100) & Freshness (0-100)
        market_score = 85.0
        freshness_score = round(r_data.get("freshness_score", 1.0) * 100.0, 1)

        # 5. Deterministic Composite Employability Score
        weights = {
            "career_readiness": 0.35,
            "practical_readiness": 0.35,
            "portfolio_evidence": 0.15,
            "market_alignment": 0.10,
            "evidence_freshness": 0.05,
        }

        employability_score = round(
            weights["career_readiness"] * career_readiness +
            weights["practical_readiness"] * practical_readiness +
            weights["portfolio_evidence"] * portfolio_score +
            weights["market_alignment"] * market_score +
            weights["evidence_freshness"] * freshness_score,
            1
        )

        level = score_to_employability_level(employability_score)
        confidence = min(1.0, round(0.40 + (evidence_count * 0.10), 2))

        # High Impact Actions
        actions = []
        if practical_readiness < 50.0:
            actions.append({
                "type": "project",
                "title": f"Complete a verified real-world project for {target_role}",
                "priority": "HIGH"
            })
        if portfolio_score < 50.0:
            actions.append({
                "type": "portfolio",
                "title": "Add at least 2 verified project artifacts to your career portfolio",
                "priority": "HIGH"
            })
        if r_data.get("critical_blockers"):
            actions.append({
                "type": "prerequisite",
                "title": f"Resolve critical blocker in {r_data['critical_blockers'][0]}",
                "priority": "HIGH"
            })

        explanation = (
            f"Overall Employability for {target_role} is evaluated at {employability_score}/100 ({level}) "
            f"combining {int(career_readiness)}% Career Readiness, {int(practical_readiness)}% Practical Engineering Readiness, "
            f"and {int(portfolio_score)}% Portfolio Evidence Quality."
        )

        return EmployabilityScoreOut(
            profile_id=profile_id,
            target_role=target_role,
            employability_score=employability_score,
            readiness_level=level,
            career_readiness_score=career_readiness,
            practical_readiness_score=practical_readiness,
            portfolio_quality_score=portfolio_score,
            market_alignment_score=market_score,
            evidence_freshness_score=freshness_score,
            confidence=confidence,
            evidence_count=evidence_count,
            weights=weights,
            high_impact_actions=actions,
            explanation=explanation,
            calculated_at=datetime.now(timezone.utc)
        )
