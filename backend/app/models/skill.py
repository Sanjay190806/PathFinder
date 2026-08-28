import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, JSON, ForeignKey, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Skill(Base):
    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)  # Programming, AI/ML, Mathematics, Data Science, DevOps, Cybersecurity, Software Engineering, Web Development
    description = Column(String(500), nullable=True)
    difficulty_tier = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    embedding = Column(JSON, nullable=True)  # Serialized float vector
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    prerequisites = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.skill_id",
        back_populates="skill",
        cascade="all, delete-orphan"
    )
    dependent_skills = relationship(
        "SkillPrerequisite",
        foreign_keys="SkillPrerequisite.prerequisite_skill_id",
        back_populates="prerequisite_skill",
        cascade="all, delete-orphan"
    )
    resource_skills = relationship("ResourceSkill", back_populates="skill", cascade="all, delete-orphan")
    resource_prerequisites = relationship("ResourcePrerequisite", back_populates="skill", cascade="all, delete-orphan")
    learner_skills = relationship("LearnerSkill", back_populates="skill", cascade="all, delete-orphan")
    assessment_questions = relationship("AssessmentQuestion", back_populates="skill")

class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"
    __table_args__ = (
        UniqueConstraint("skill_id", "prerequisite_skill_id", name="uq_skill_prerequisite"),
        CheckConstraint("skill_id != prerequisite_skill_id", name="chk_no_self_prerequisite"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    prerequisite_type = Column(String(50), default="mandatory")  # mandatory, recommended
    is_mandatory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    skill = relationship("Skill", foreign_keys=[skill_id], back_populates="prerequisites")
    prerequisite_skill = relationship("Skill", foreign_keys=[prerequisite_skill_id], back_populates="dependent_skills")

class LearnerSkill(Base):
    __tablename__ = "learner_skills"
    __table_args__ = (
        UniqueConstraint("profile_id", "skill_id", name="uq_learner_skill"),
        CheckConstraint("assessed_confidence >= 0.0 AND assessed_confidence <= 1.0", name="chk_confidence_range"),
        CheckConstraint("target_confidence >= 0.0 AND target_confidence <= 1.0", name="chk_target_confidence_range"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    self_rating = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    assessed_confidence = Column(Float, default=0.20)  # 0.0 to 1.0
    target_confidence = Column(Float, default=0.85)  # 0.0 to 1.0
    source = Column(String(50), default="self_rating")  # self_rating, assessment, interaction, feedback
    verified = Column(Boolean, default=False)
    last_assessed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="learner_skills")
    skill = relationship("Skill", back_populates="learner_skills")
