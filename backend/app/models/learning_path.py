import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, JSON, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(String(36), ForeignKey("goals.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True)
    current_version_id = Column(String(36), nullable=True)
    algorithm_version = Column(String(50), default="v1.2.0")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="learning_paths")
    goal = relationship("Goal", back_populates="learning_paths")
    versions = relationship("LearningPathVersion", back_populates="learning_path", cascade="all, delete-orphan")
    roadmap_changes = relationship("RoadmapChange", back_populates="learning_path", cascade="all, delete-orphan")

class LearningPathVersion(Base):
    __tablename__ = "learning_path_versions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False, index=True)
    version_number = Column(Integer, default=1)
    version_hash = Column(String(64), nullable=True)
    trigger = Column(String(100), default="initial_generation")
    change_summary = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    idempotency_key = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    learning_path = relationship("LearningPath", back_populates="versions")
    items = relationship("LearningPathItem", back_populates="version", cascade="all, delete-orphan", order_by="LearningPathItem.sequence_order")
    roadmap_changes = relationship("RoadmapChange", foreign_keys="RoadmapChange.version_id", back_populates="version", cascade="all, delete-orphan")

class LearningPathItem(Base):
    __tablename__ = "learning_path_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    version_id = Column(String(36), ForeignKey("learning_path_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    phase_number = Column(Integer, default=1)  # Phase 1 to 5
    phase_name = Column(String(100), default="Foundations")
    sequence_order = Column(Integer, default=1)
    planned_hours = Column(Float, default=5.0)
    is_completed = Column(Boolean, default=False)
    is_skipped = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    completion_date = Column(DateTime, nullable=True)

    version = relationship("LearningPathVersion", back_populates="items")
    resource = relationship("LearningResource", back_populates="path_items")
    explanation = relationship("RecommendationExplanation", back_populates="path_item", uselist=False, cascade="all, delete-orphan")

class RoadmapChange(Base):
    __tablename__ = "roadmap_changes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    learning_path_id = Column(String(36), ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=True, index=True)
    version_id = Column(String(36), ForeignKey("learning_path_versions.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_version_id = Column(String(36), nullable=True)
    new_version_id = Column(String(36), nullable=True)
    previous_item_id = Column(String(36), nullable=True)
    new_item_id = Column(String(36), nullable=True)
    change_type = Column(String(50), default="inserted")  # inserted, removed, reordered, phase_shifted, unchanged
    reason = Column(String(500), nullable=False)
    trigger = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    learning_path = relationship("LearningPath", back_populates="roadmap_changes")
    version = relationship("LearningPathVersion", foreign_keys=[version_id], back_populates="roadmap_changes")

class RecommendationExplanation(Base):
    __tablename__ = "recommendation_explanations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    path_item_id = Column(String(36), ForeignKey("learning_path_items.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    goal_relevance_score = Column(Float, default=0.0)
    skill_gap_score = Column(Float, default=0.0)
    prereq_score = Column(Float, default=0.0)
    difficulty_score = Column(Float, default=0.0)
    pref_score = Column(Float, default=0.0)
    time_score = Column(Float, default=0.0)
    engagement_score = Column(Float, default=0.0)
    diversity_score = Column(Float, default=0.0)
    composite_score = Column(Float, default=0.0)
    structured_reasons = Column(JSON, default=list)
    human_readable_explanation = Column(String(1000), nullable=False)

    path_item = relationship("LearningPathItem", back_populates="explanation")
