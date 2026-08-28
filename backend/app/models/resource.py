import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, ForeignKey, DateTime, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearningResource(Base):
    __tablename__ = "learning_resources"
    __table_args__ = (
        CheckConstraint("estimated_hours > 0", name="chk_positive_estimated_hours"),
        CheckConstraint("quality_score >= 0.0 AND quality_score <= 1.0", name="chk_quality_score_range"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String(1000), nullable=False)
    provider = Column(String(100), default="Coursera")
    url = Column(String(500), nullable=False)
    resource_type = Column(String(50), default="course")  # course, video, article, documentation, tutorial, project, quiz, book
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    estimated_hours = Column(Float, default=5.0, nullable=False)
    quality_score = Column(Float, default=0.90, nullable=False)  # 0.0 to 1.0
    career_relevance = Column(JSON, default=list)  # ["ai-ml-engineer", "data-scientist"]
    format = Column(String(50), default="video")  # video, hands-on, project, theory, interactive, article
    status = Column(String(50), default="active")  # active, archived, draft
    embedding = Column(JSON, nullable=True)  # Serialized float vector
    embedding_model = Column(String(100), default="text-embedding-004")
    embedding_model_version = Column(String(50), default="v1.0")
    embedding_dimension = Column(Integer, default=128)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    resource_skills = relationship("ResourceSkill", back_populates="resource", cascade="all, delete-orphan")
    prerequisite_skills = relationship("ResourcePrerequisite", back_populates="resource", cascade="all, delete-orphan")
    path_items = relationship("LearningPathItem", back_populates="resource")
    progress_records = relationship("Progress", back_populates="resource")
    feedbacks = relationship("Feedback", back_populates="resource")
    interactions = relationship("Interaction", back_populates="resource")
    recommendations = relationship("Recommendation", back_populates="resource")

class ResourceSkill(Base):
    __tablename__ = "resource_skills"
    __table_args__ = (
        UniqueConstraint("resource_id", "skill_id", name="uq_resource_skill"),
        CheckConstraint("relevance_weight >= 0.0 AND relevance_weight <= 1.0", name="chk_resource_skill_relevance"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    relevance_weight = Column(Float, default=1.0)
    coverage_level = Column(String(50), default="comprehensive")  # comprehensive, foundational, practical, overview
    is_primary = Column(Boolean, default=True)

    resource = relationship("LearningResource", back_populates="resource_skills")
    skill = relationship("Skill", back_populates="resource_skills")

class ResourcePrerequisite(Base):
    __tablename__ = "resource_prerequisites"
    __table_args__ = (
        UniqueConstraint("resource_id", "skill_id", name="uq_resource_prerequisite"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    is_mandatory = Column(Boolean, default=True)

    resource = relationship("LearningResource", back_populates="prerequisite_skills")
    skill = relationship("Skill", back_populates="resource_prerequisites")
