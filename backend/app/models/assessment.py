import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(200), nullable=False)
    domain = Column(String(100), nullable=False) # AI/ML, Data Science, Full Stack, DevOps, Cybersecurity
    target_skill_ids = Column(JSON, default=list)

    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    assessment_id = Column(String(36), ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(String(500), nullable=False)
    options = Column(JSON, nullable=False) # ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(String(500), nullable=True)
    difficulty_weight = Column(Float, default=0.5)

    assessment = relationship("Assessment", back_populates="questions")
    skill = relationship("Skill", back_populates="assessment_questions")
    responses = relationship("AssessmentResponse", back_populates="question", cascade="all, delete-orphan")

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(String(36), ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    confidence_delta = Column(Float, default=0.0)
    answered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="assessment_responses")
    question = relationship("AssessmentQuestion", back_populates="responses")
