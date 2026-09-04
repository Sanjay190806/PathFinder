from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.user import User
from backend.app.models.opportunity import Opportunity
from backend.app.models.portfolio import LearnerPortfolio, PortfolioArtifact
from backend.app.models.project import LearnerProject
from backend.app.models.practical_competency import PracticalEvidenceRecord
from backend.app.models.scenario import ScenarioAttempt
from backend.app.models.career_action import ResumeAudit, MockInterviewSession
from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine
from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.intelligence.mastery_engine import SkillMasteryEngine


class PreparationScorer:
    """
    Computes a deterministic, transparent 9-dimension preparation score
    with comprehensive DecisionTrace explainability.
    """

    DIMENSION_WEIGHTS = {
        "technical_readiness": 0.20,
        "practical_competency": 0.15,
        "project_readiness": 0.15,
        "interview_readiness": 0.15,
        "resume_ats": 0.10,
        "portfolio_readiness": 0.10,
        "opportunity_specific": 0.05,
        "communication": 0.05,
        "behavioral": 0.05,
    }

    def __init__(self, db: Session):
        self.db = db
        self.readiness_engine = OpportunityReadinessEngine(db)
        self.gap_engine = CareerSkillGapEngine(db)
        self.mastery_engine = SkillMasteryEngine(db)

    def calculate_preparation_score(
        self,
        learner_id: str,
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        # Resolve learner profile
        user = self.db.query(User).filter(User.id == learner_id).first()
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.user_id == learner_id).first()
        profile_id = profile.id if profile else learner_id

        # 1. Technical Readiness (0-100)
        tech_score = 65.0
        try:
            if profile:
                base_readiness = self.readiness_engine.calculate_readiness(profile.id)
                tech_score = float(base_readiness.get("readiness_score", 65.0))
        except Exception:
            tech_score = 65.0

        # 2. Practical Competency (0-100)
        # Check practical evidence records & completed scenarios
        evidence_count = (
            self.db.query(PracticalEvidenceRecord)
            .filter(PracticalEvidenceRecord.profile_id == profile_id)
            .count()
        )
        scenario_attempts = (
            self.db.query(ScenarioAttempt)
            .filter(ScenarioAttempt.profile_id == profile_id, ScenarioAttempt.score >= 0.7)
            .count()
        )
        practical_score = min(100.0, (evidence_count * 15.0) + (scenario_attempts * 20.0) + 40.0)

        # 3. Project Readiness (0-100)
        # Check active & completed projects
        projects = (
            self.db.query(LearnerProject)
            .filter(LearnerProject.profile_id == profile_id)
            .all()
        )
        completed_projects = [p for p in projects if getattr(p, "status", "") in ("COMPLETED", "SUBMITTED", "EVALUATED")]
        if completed_projects:
            project_score = min(100.0, 50.0 + len(completed_projects) * 25.0)
        elif projects:
            project_score = 45.0 + min(35.0, len(projects) * 15.0)
        else:
            project_score = 30.0

        # 4. Resume ATS (0-100)
        latest_resume = (
            self.db.query(ResumeAudit)
            .filter(ResumeAudit.profile_id == profile_id)
            .order_by(ResumeAudit.created_at.desc())
            .first()
        )
        resume_score = float(latest_resume.ats_score) if latest_resume else 50.0

        # 5. Portfolio Readiness (0-100)
        portfolio = (
            self.db.query(LearnerPortfolio)
            .filter(LearnerPortfolio.profile_id == profile_id)
            .first()
        )
        artifacts = (
            self.db.query(PortfolioArtifact)
            .filter(PortfolioArtifact.portfolio_id == portfolio.id)
            .all()
            if portfolio
            else []
        )
        if portfolio:
            base_portfolio_score = float(portfolio.quality_score or 0.0)
            artifact_bonus = min(30.0, len(artifacts) * 10.0)
            portfolio_score = min(100.0, max(base_portfolio_score, 40.0 + artifact_bonus))
        else:
            portfolio_score = 35.0

        # 6. Interview Readiness (0-100)
        sessions = (
            self.db.query(MockInterviewSession)
            .filter(MockInterviewSession.profile_id == profile_id)
            .order_by(MockInterviewSession.completed_at.desc())
            .all()
        )
        if sessions:
            interview_score = float(sum(s.overall_score for s in sessions if s.overall_score) / max(1, len(sessions)))
        else:
            interview_score = 55.0

        # 7. Communication (0-100)
        # Based on average interview depth / clarity / confidence
        communication_score = round(max(40.0, min(100.0, interview_score * 0.95 + 5.0)), 1)

        # 8. Behavioral (0-100)
        behavioral_score = round(max(45.0, min(100.0, interview_score * 0.90 + 8.0)), 1)

        # 9. Opportunity-Specific Match (0-100)
        opp_score = 70.0
        opp_obj = None
        if opportunity_id:
            opp_obj = self.db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
            if opp_obj:
                required_skills = opp_obj.required_skills or []
                if required_skills and profile:
                    gaps = self.gap_engine.calculate_skill_gaps(profile_id=profile_id).get("gaps", [])
                    gap_slugs = {g.get("skill_slug", "").lower() for g in gaps}
                    matched = [s for s in required_skills if s.lower() not in gap_slugs]
                    opp_score = round((len(matched) / max(1, len(required_skills))) * 100.0, 1)
                else:
                    opp_score = 75.0
        else:
            opp_score = round((tech_score + practical_score) / 2.0, 1)

        dimension_scores = {
            "technical_readiness": round(tech_score, 1),
            "practical_competency": round(practical_score, 1),
            "project_readiness": round(project_score, 1),
            "interview_readiness": round(interview_score, 1),
            "resume_ats": round(resume_score, 1),
            "portfolio_readiness": round(portfolio_score, 1),
            "opportunity_specific": round(opp_score, 1),
            "communication": round(communication_score, 1),
            "behavioral": round(behavioral_score, 1),
        }

        # Overall composite score
        overall_score = sum(dimension_scores[dim] * weight for dim, weight in self.DIMENSION_WEIGHTS.items())
        overall_score = round(max(0.0, min(100.0, overall_score)), 1)

        # Readiness level
        if overall_score >= 85.0:
            readiness_level = "APPLICATION_READY"
        elif overall_score >= 70.0:
            readiness_level = "GOOD"
        elif overall_score >= 50.0:
            readiness_level = "MODERATE"
        else:
            readiness_level = "LOW"

        # Categorize strengths & weaknesses
        sorted_dims = sorted(dimension_scores.items(), key=lambda x: x[1], reverse=True)
        strengths = [
            f"{dim.replace('_', ' ').title()} is strong at {score}%"
            for dim, score in sorted_dims if score >= 75.0
        ]
        if not strengths:
            strengths = [f"{sorted_dims[0][0].replace('_', ' ').title()} is leading at {sorted_dims[0][1]}%"]

        weaknesses = [
            f"{dim.replace('_', ' ').title()} needs improvement ({score}%)"
            for dim, score in sorted_dims if score < 65.0
        ]
        if not weaknesses:
            weaknesses = [f"Continue polishing {sorted_dims[-1][0].replace('_', ' ').title()} ({sorted_dims[-1][1]}%)"]

        critical_blockers = []
        if dimension_scores["resume_ats"] < 50.0:
            critical_blockers.append("Resume ATS keyword coverage is below 50%; candidate risks initial screening rejection.")
        if dimension_scores["project_readiness"] < 40.0:
            critical_blockers.append("Lacks verified capstone project evidence to demonstrate end-to-end implementation skills.")
        if dimension_scores["technical_readiness"] < 45.0:
            critical_blockers.append("Core foundational technical prerequisites have unaddressed gaps.")

        decision_trace = {
            "algorithm": "PreparationScorer_v1_Stage10",
            "weights": self.DIMENSION_WEIGHTS,
            "inputs": {
                "profile_id": profile_id,
                "career_id": career_id,
                "opportunity_id": opportunity_id,
                "evidence_count": evidence_count,
                "scenario_attempts_passed": scenario_attempts,
                "completed_projects_count": len(completed_projects),
                "portfolio_artifacts_count": len(artifacts),
                "mock_sessions_count": len(sessions),
            },
            "formula": "sum(dimension_score[i] * weight[i]) normalized to [0, 100]",
            "readiness_level": readiness_level,
        }

        return {
            "learner_id": learner_id,
            "career_id": career_id,
            "opportunity_id": opportunity_id,
            "overall_score": overall_score,
            "readiness_level": readiness_level,
            "dimension_scores": dimension_scores,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "critical_blockers": critical_blockers,
            "decision_trace": decision_trace,
        }
