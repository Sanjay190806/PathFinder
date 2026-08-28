from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class LearnerApplication(Base):
    __tablename__ = "learner_applications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="saved", index=True)  # saved, applied, interviewing, offered, rejected, withdrawn
    target_deadline = Column(DateTime, nullable=True)
    notes = Column(String(1000), default="")
    prep_actions = Column(JSON, default=list)  # [{"title": "Review transformer KV-cache", "completed": False}]
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="applications")
    opportunity = relationship("Opportunity")

class ResumeAudit(Base):
    __tablename__ = "resume_audits"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(100), nullable=False)
    ats_score = Column(Float, default=0.0)  # [0.0, 100.0]
    keyword_coverage = Column(JSON, default=dict)
    missing_keywords = Column(JSON, default=list)
    bullet_improvements = Column(JSON, default=list)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="resume_audits")

class MockInterviewSession(Base):
    __tablename__ = "mock_interview_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    target_role = Column(String(100), nullable=False)
    interview_type = Column(String(50), default="Technical Core")  # Technical Core, System Design, Scenario Defense
    question_transcript = Column(JSON, default=list)  # [{"q": "...", "a": "...", "score": 0.85, "rubric": "..."}]
    overall_score = Column(Float, default=0.0)  # [0.0, 100.0]
    feedback = Column(String(1000), default="")
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="mock_interviews")
