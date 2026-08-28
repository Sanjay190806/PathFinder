from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class LearnerPortfolio(Base):
    __tablename__ = "learner_portfolios"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    target_role = Column(String(100), nullable=False, index=True)
    quality_score = Column(Float, default=0.0)  # [0.0, 100.0]
    quality_dimensions = Column(JSON, default=dict)
    verification_status = Column(String(50), default="Developing Portfolio")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="portfolio")
    artifacts = relationship("PortfolioArtifact", back_populates="portfolio", cascade="all, delete-orphan")

class PortfolioArtifact(Base):
    __tablename__ = "portfolio_artifacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    portfolio_id = Column(String(36), ForeignKey("learner_portfolios.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    artifact_type = Column(String(50), default="source_repository")  # source_repository, project_report, architecture_diagram, dataset_analysis, deployment_evidence, test_report
    url_or_path = Column(String(500), nullable=False)
    skills = Column(JSON, default=list)
    verification_level = Column(String(50), default="Self-Reported")  # Unverified, Self-Reported, System-Verified, Assessment-Verified, Project-Verified
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    portfolio = relationship("LearnerPortfolio", back_populates="artifacts")
