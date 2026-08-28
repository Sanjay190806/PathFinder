from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class PracticalCompetency(Base):
    __tablename__ = "practical_competencies"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    career_role = Column(String(100), nullable=False, index=True)
    skill_slug = Column(String(64), nullable=False, index=True)
    competency_type = Column(String(50), default="applied_engineering")
    level = Column(String(32), default="Unknown")  # Unknown, Beginner, Developing, Competent, Strong, Mastery
    score = Column(Float, default=0.0)  # [0.0, 1.0]
    confidence = Column(Float, default=0.5)  # [0.0, 1.0]
    evidence_count = Column(Integer, default=0)
    dimensions = Column(JSON, default=dict)  # {"application": 0.8, "problem_solving": 0.7, "debugging": 0.6, ...}
    last_demonstrated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="practical_competencies")

class PracticalEvidenceRecord(Base):
    __tablename__ = "practical_evidence_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_slug = Column(String(64), nullable=False, index=True)
    evidence_type = Column(String(64), nullable=False, index=True)  # project, practical_assessment, debugging_exercise, scenario, simulation, validated_milestone, portfolio_artifact
    source_id = Column(String(100), nullable=False, index=True)
    score = Column(Float, default=0.0)  # [0.0, 1.0]
    confidence = Column(Float, default=0.8)  # [0.0, 1.0]
    evaluator = Column(String(50), default="system_rubric")
    metadata_payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="practical_evidence_records")
