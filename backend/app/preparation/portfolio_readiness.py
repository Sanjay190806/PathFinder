from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.portfolio import LearnerPortfolio, PortfolioArtifact
from backend.app.models.project import LearnerProject
from backend.app.portfolio.portfolio_engine import PortfolioEngine


class PortfolioReadinessAuditor:
    """
    Evaluates learner portfolio readiness across project depth,
    README documentation quality, live demo deployment, and automated test coverage.
    """

    def __init__(self, db: Session):
        self.db = db
        self.portfolio_engine = PortfolioEngine(db)

    def audit_portfolio(self, learner_id: str) -> Dict[str, Any]:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.user_id == learner_id).first()
        profile_id = profile.id if profile else learner_id

        # Get or create portfolio
        portfolio_record = (
            self.db.query(LearnerPortfolio)
            .filter(LearnerPortfolio.profile_id == profile_id)
            .first()
        )
        if not portfolio_record and profile:
            try:
                self.portfolio_engine.get_or_create_portfolio(profile.id)
                portfolio_record = (
                    self.db.query(LearnerPortfolio)
                    .filter(LearnerPortfolio.profile_id == profile.id)
                    .first()
                )
            except Exception:
                pass

        artifacts = []
        if portfolio_record:
            artifacts = (
                self.db.query(PortfolioArtifact)
                .filter(PortfolioArtifact.portfolio_id == portfolio_record.id)
                .all()
            )

        projects = (
            self.db.query(LearnerProject)
            .filter(LearnerProject.profile_id == profile_id)
            .all()
        )

        # 1. Completeness Score (0-100)
        has_artifacts = len(artifacts) > 0
        has_projects = len(projects) > 0
        completeness = 40.0
        if has_artifacts:
            completeness += min(30.0, len(artifacts) * 15.0)
        if has_projects:
            completeness += min(30.0, len(projects) * 15.0)
        completeness = min(100.0, completeness)

        # 2. Project Depth Score (0-100)
        # Evaluated by number of completed milestones and technical stack variety
        project_depth = 45.0
        for p in projects:
            if hasattr(p, "milestones") and p.milestones:
                project_depth += len(p.milestones) * 10.0
            if getattr(p, "status", "") in ("COMPLETED", "EVALUATED"):
                project_depth += 15.0
        project_depth = max(40.0, min(100.0, project_depth))

        # 3. README Quality Score (0-100)
        # Check artifact URLs or project descriptions for documentation indicators
        readme_score = 60.0
        for art in artifacts:
            if art.artifact_type in ("DOCUMENTATION", "CODE_REPOSITORY"):
                readme_score += 15.0
        readme_score = min(100.0, readme_score)

        # 4. Live Demo Score (0-100)
        demo_artifacts = [a for a in artifacts if a.url_or_path and ("http" in a.url_or_path or "demo" in a.title.lower())]
        live_demo_score = 90.0 if demo_artifacts else 40.0

        # 5. Test Coverage Score (0-100)
        test_artifacts = [a for a in artifacts if "test" in a.title.lower() or a.verification_level in ("VERIFIED", "PRODUCTION")]
        test_coverage_score = 85.0 if test_artifacts else 50.0

        # Composite Portfolio Score
        portfolio_score = round(
            (completeness * 0.25) +
            (project_depth * 0.25) +
            (readme_quality_score := readme_score) * 0.20 +
            (live_demo_score * 0.15) +
            (test_coverage_score * 0.15),
            1,
        )

        missing_evidence = []
        if not demo_artifacts:
            missing_evidence.append("Live interactive demo URL or hosted deployment link.")
        if not test_artifacts:
            missing_evidence.append("Automated test suite documentation (e.g. pytest / jest badges).")
        if len(artifacts) < 2:
            missing_evidence.append("Multiple diverse artifacts demonstrating varied technical specializations.")

        upgrades = [
            "Add architecture diagrams and benchmark graphs to GitHub repository README.",
            "Deploy a working demo using Vercel, Railway, or GitHub Pages with reproducible seed data.",
            "Include a comprehensive test suite (unit + integration) with >=80% code coverage badge.",
        ]
        if missing_evidence:
            upgrades.insert(0, f"Prioritize attaching: {missing_evidence[0]}")

        return {
            "portfolio_score": portfolio_score,
            "completeness_score": round(completeness, 1),
            "project_depth_score": round(project_depth, 1),
            "readme_quality_score": round(readme_quality_score, 1),
            "live_demo_score": round(live_demo_score, 1),
            "test_coverage_score": round(test_coverage_score, 1),
            "missing_evidence": missing_evidence,
            "recommended_portfolio_upgrades": upgrades,
        }
