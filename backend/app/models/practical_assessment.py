from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class PracticalAssessment(Base):
    __tablename__ = "practical_assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    assessment_type = Column(String(50), default="Build Assessment")  # Debugging Assessment, Build Assessment, Architecture Assessment, Data Analysis, Security, RTL Design, Deployment, System Design
    career_roles = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    difficulty = Column(String(32), default="Intermediate")
    instructions = Column(String(1000), nullable=False)
    constraints = Column(JSON, default=list)
    evaluation_rubric = Column(JSON, default=dict)
    passing_threshold = Column(Float, default=0.70)
    is_active = Column(Boolean, default=True)

class PracticalAssessmentAttempt(Base):
    __tablename__ = "practical_assessment_attempts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id = Column(String(36), ForeignKey("practical_assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_payload = Column(JSON, default=dict)
    score = Column(Float, default=0.0)  # [0.0, 1.0]
    passed = Column(Boolean, default=False)
    rubric_breakdown = Column(JSON, default=dict)
    evaluator_feedback = Column(String(1000), default="")
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="practical_assessment_attempts")
    assessment = relationship("PracticalAssessment")
