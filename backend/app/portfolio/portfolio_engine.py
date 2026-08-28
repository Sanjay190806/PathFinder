from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.portfolio import LearnerPortfolio, PortfolioArtifact
from backend.app.models.profile import LearnerProfile
from backend.app.models.practical_competency import PracticalEvidenceRecord
from backend.app.schemas.portfolio import ArtifactCreate, ArtifactOut, PortfolioOut

class PortfolioEngine:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_portfolio(self, profile_id: str) -> PortfolioOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Engineering Career"

        portfolio = self.db.query(LearnerPortfolio).filter(LearnerPortfolio.profile_id == profile_id).first()
        if not portfolio:
            portfolio = LearnerPortfolio(
                profile_id=profile_id,
                target_role=target_role,
                quality_score=0.0,
                quality_dimensions={"technical_depth": 0.0, "breadth": 0.0, "evidence_quality": 0.0, "documentation": 0.0},
                verification_status="Initial Portfolio"
            )
            self.db.add(portfolio)
            self.db.commit()
            self.db.refresh(portfolio)

        return self._recalculate_portfolio_quality(portfolio)

    def add_artifact(self, profile_id: str, artifact_in: ArtifactCreate) -> PortfolioOut:
        portfolio_record = self.db.query(LearnerPortfolio).filter(LearnerPortfolio.profile_id == profile_id).first()
        if not portfolio_record:
            self.get_or_create_portfolio(profile_id)
            portfolio_record = self.db.query(LearnerPortfolio).filter(LearnerPortfolio.profile_id == profile_id).first()

        artifact = PortfolioArtifact(
            portfolio_id=portfolio_record.id,
            title=artifact_in.title,
            artifact_type=artifact_in.artifact_type,
            url_or_path=artifact_in.url_or_path,
            skills=artifact_in.skills,
            verification_level=artifact_in.verification_level,
            is_featured=artifact_in.is_featured
        )
        self.db.add(artifact)
        self.db.commit()
        return self._recalculate_portfolio_quality(portfolio_record)

    def _recalculate_portfolio_quality(self, portfolio: LearnerPortfolio) -> PortfolioOut:
        artifacts = self.db.query(PortfolioArtifact).filter(PortfolioArtifact.portfolio_id == portfolio.id).all()
        evidence_count = (
            self.db.query(PracticalEvidenceRecord)
            .filter(PracticalEvidenceRecord.profile_id == portfolio.profile_id)
            .count()
        )

        total_artifacts = len(artifacts)
        verified_count = sum(1 for a in artifacts if a.verification_level in ("System-Verified", "Assessment-Verified", "Project-Verified"))

        # Dimensions: 0-100
        technical_depth = min(100.0, round(verified_count * 25.0 + evidence_count * 10.0, 1))
        breadth = min(100.0, round(total_artifacts * 20.0, 1))
        evidence_quality = min(100.0, round((verified_count / max(1, total_artifacts)) * 100.0, 1)) if total_artifacts > 0 else 0.0
        documentation = 85.0 if total_artifacts > 0 else 0.0

        quality_score = round(
            0.35 * technical_depth +
            0.25 * breadth +
            0.25 * evidence_quality +
            0.15 * documentation,
            1
        )

        if quality_score >= 80:
            status = "Verified Strong Portfolio"
        elif quality_score >= 50:
            status = "Developing Verified Portfolio"
        elif total_artifacts > 0:
            status = "Early Portfolio"
        else:
            status = "Empty Portfolio"

        portfolio.quality_score = quality_score
        portfolio.quality_dimensions = {
            "technical_depth": technical_depth,
            "breadth": breadth,
            "evidence_quality": evidence_quality,
            "documentation": documentation
        }
        portfolio.verification_status = status
        self.db.commit()
        self.db.refresh(portfolio)

        gaps = []
        if verified_count == 0:
            gaps.append("No system-verified project or assessment artifacts submitted yet.")
        if total_artifacts < 3:
            gaps.append("Target minimum of 3 diverse technical artifacts for career readiness.")

        explanation = (
            f"Portfolio quality rated {quality_score}/100 ({status}) across {total_artifacts} artifact(s) "
            f"and {evidence_count} backend-verified evidence records."
        )

        return PortfolioOut(
            id=portfolio.id,
            profile_id=portfolio.profile_id,
            target_role=portfolio.target_role,
            quality_score=portfolio.quality_score,
            verification_status=portfolio.verification_status,
            quality_dimensions=portfolio.quality_dimensions or {},
            artifacts=[
                ArtifactOut(
                    id=a.id,
                    title=a.title,
                    artifact_type=a.artifact_type,
                    url_or_path=a.url_or_path,
                    skills=a.skills or [],
                    verification_level=a.verification_level,
                    is_featured=a.is_featured,
                    created_at=a.created_at
                )
                for a in artifacts
            ],
            gaps=gaps,
            explanation=explanation
        )
