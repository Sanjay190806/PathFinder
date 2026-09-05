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

    # 🇮🇳 JanSahay / SIH26101 Indian Education Taxonomy attributes
    country = Column(String(50), default="India")
    education_stage = Column(String(100), nullable=True)
    education_domain = Column(String(150), nullable=True)
    education_stream = Column(String(150), nullable=True)
    specialization = Column(String(150), nullable=True)
    qualification = Column(String(150), nullable=True)
    current_role = Column(String(100), nullable=True)
    work_domain = Column(String(100), nullable=True)
    institution = Column(String(200), nullable=True)
    graduation_year = Column(String(20), nullable=True)
    custom_education_label = Column(String(250), nullable=True)
    education_profile = Column(JSON, nullable=True)

    # Phase 9 Stage 1 Extended Education Attributes
    board = Column(String(100), nullable=True)
    subject_combination = Column(String(200), nullable=True)
    institution_type = Column(String(100), nullable=True)
    current_year = Column(String(50), nullable=True)
    subjects = Column(JSON, nullable=True)
    preferred_language = Column(String(50), default="English")
    fallback_language = Column(String(50), default="English")

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
    
    # Phase 8 Relationships
    practical_competencies = relationship("PracticalCompetency", back_populates="profile", cascade="all, delete-orphan")
    practical_evidence_records = relationship("PracticalEvidenceRecord", back_populates="profile", cascade="all, delete-orphan")
    projects = relationship("LearnerProject", back_populates="profile", cascade="all, delete-orphan")
    scenario_attempts = relationship("ScenarioAttempt", back_populates="profile", cascade="all, delete-orphan")
    practical_assessment_attempts = relationship("PracticalAssessmentAttempt", back_populates="profile", cascade="all, delete-orphan")
    portfolio = relationship("LearnerPortfolio", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    opportunity_matches = relationship("LearnerOpportunityMatch", back_populates="profile", cascade="all, delete-orphan")
    applications = relationship("LearnerApplication", back_populates="profile", cascade="all, delete-orphan")
    resume_audits = relationship("ResumeAudit", back_populates="profile", cascade="all, delete-orphan")
    mock_interviews = relationship("MockInterviewSession", back_populates="profile", cascade="all, delete-orphan")
