import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    education_level = Column(String(100), nullable=True) # High School, Undergraduate, Master, Self-taught
    field_of_study = Column(String(100), nullable=True)
    experience_level = Column(String(50), default="Beginner") # Beginner, Intermediate, Advanced
    weekly_hours = Column(Integer, default=10)
    preferred_formats = Column(JSON, default=lambda: ["video", "hands-on", "projects"])
    learning_objective = Column(String(100), default="Career Switch") # Internship, Placement, Portfolio, Skill
    skill_confidence_map = Column(JSON, default=dict) # { "skill_slug": 0.75 }
    velocity_score = Column(Float, default=1.0)
    difficulty_tolerance = Column(Float, default=0.5) # 0.0 (Gentle) to 1.0 (Challenging)
    state_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="profile")
    goals = relationship("Goal", back_populates="profile", cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="profile", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="profile", cascade="all, delete-orphan")
    progress_records = relationship("Progress", back_populates="profile", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="profile", cascade="all, delete-orphan")
    interactions = relationship("Interaction", back_populates="profile", cascade="all, delete-orphan")
    assessment_responses = relationship("AssessmentResponse", back_populates="profile", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="profile", cascade="all, delete-orphan")
    behavior_events = relationship("BehaviorEvent", back_populates="profile", cascade="all, delete-orphan")
