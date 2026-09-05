import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Float, Integer, Boolean, JSON, ForeignKey, DateTime,
    UniqueConstraint, CheckConstraint
)
from sqlalchemy.orm import relationship, backref
from backend.app.database import Base


class CourseSyllabus(Base):
    __tablename__ = "course_syllabuses"
    __table_args__ = (
        UniqueConstraint("course_id", "version", name="uq_course_syllabus_version"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    course_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_active = Column(Boolean, default=True)
    language = Column(String(50), default="English")
    
    # Provenance tracking
    source = Column(String(50), default="OFFICIAL_PROVIDER")  # OFFICIAL_PROVIDER, INSTITUTION, COURSE_METADATA, LEARNER_PROVIDED, IMPORTED_DOCUMENT, AI_ASSISTED_EXTRACTION, MANUAL_ADMIN, OTHER
    source_url = Column(String(500), nullable=True)
    provider = Column(String(100), default="NPTEL")
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verified_at = Column(DateTime, nullable=True)
    verification_status = Column(String(50), default="UNVERIFIED")  # VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, AI_ASSISTED
    
    # Authoritative Validation Status
    validation_status = Column(String(50), default="VALID")  # VALID, INVALID, DRAFT
    validation_errors = Column(JSON, default=list)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    course = relationship("LearningResource", backref="syllabuses")
    modules = relationship("SyllabusModule", back_populates="syllabus", cascade="all, delete-orphan", order_by="SyllabusModule.order_index")
    progress_records = relationship("LearnerCourseProgress", back_populates="syllabus", cascade="all, delete-orphan")


class SyllabusModule(Base):
    __tablename__ = "syllabus_modules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    syllabus_id = Column(String(36), ForeignKey("course_syllabuses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    weight = Column(Float, default=0.0, nullable=False)  # Normalized percentage of syllabus (0-100)
    estimated_learning_hours = Column(Float, default=5.0)
    prerequisite_module_ids = Column(JSON, default=list)

    # Relationships
    syllabus = relationship("CourseSyllabus", back_populates="modules")
    topics = relationship("SyllabusTopic", back_populates="module", cascade="all, delete-orphan", order_by="SyllabusTopic.order_index")


class SyllabusTopic(Base):
    __tablename__ = "syllabus_topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    module_id = Column(String(36), ForeignKey("syllabus_modules.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    weight = Column(Float, default=0.0, nullable=False)  # Normalized percentage within module (0-100)
    difficulty = Column(String(50), default="Intermediate")  # Beginner, Intermediate, Advanced
    estimated_learning_hours = Column(Float, default=1.5)

    # Relationships
    module = relationship("SyllabusModule", back_populates="topics")
    subtopics = relationship("SyllabusSubtopic", back_populates="topic", cascade="all, delete-orphan", order_by="SyllabusSubtopic.order_index")
    objectives = relationship("LearningObjective", back_populates="topic", cascade="all, delete-orphan")
    topic_skills = relationship("SyllabusTopicSkill", back_populates="topic", cascade="all, delete-orphan")


class SyllabusSubtopic(Base):
    __tablename__ = "syllabus_subtopics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    topic_id = Column(String(36), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(String(1000), nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    difficulty = Column(String(50), default="Intermediate")

    # Relationships
    topic = relationship("SyllabusTopic", back_populates="subtopics")


class LearningObjective(Base):
    __tablename__ = "learning_objectives"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    topic_id = Column(String(36), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    objective = Column(String(500), nullable=False)
    objective_type = Column(String(50), default="UNDERSTAND")  # UNDERSTAND, EXPLAIN, APPLY, ANALYZE, IMPLEMENT, DEBUG, DESIGN, EVALUATE, PRACTICE
    skill_ids = Column(JSON, default=list)  # Slugs or UUIDs of skills
    difficulty = Column(String(50), default="Intermediate")
    importance = Column(String(50), default="MEDIUM")  # HIGH, MEDIUM, LOW

    # Relationships
    topic = relationship("SyllabusTopic", back_populates="objectives")


class SyllabusTopicSkill(Base):
    __tablename__ = "syllabus_topic_skills"
    __table_args__ = (
        UniqueConstraint("topic_id", "skill_id", name="uq_topic_skill"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    topic_id = Column(String(36), ForeignKey("syllabus_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), default="REQUIRED")  # REQUIRED, SUPPORTING, PREREQUISITE, OPTIONAL
    importance = Column(Float, default=1.0)
    confidence = Column(Float, default=1.0)
    source = Column(String(50), default="CATALOG")  # CATALOG, INFERRED, AI_ASSISTED, MANUAL

    # Relationships
    topic = relationship("SyllabusTopic", back_populates="topic_skills")
    skill = relationship("Skill", backref="syllabus_topic_mappings")


class LearnerCourseProgress(Base):
    __tablename__ = "learner_course_progress"
    __table_args__ = (
        UniqueConstraint("profile_id", "course_id", name="uq_learner_course_progress"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    syllabus_id = Column(String(36), ForeignKey("course_syllabuses.id", ondelete="CASCADE"), nullable=False, index=True)
    syllabus_version = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="NOT_STARTED")  # NOT_STARTED, IN_PROGRESS, ASSESSMENT_READY, ASSESSMENT_ATTEMPTED, PASSED, FAILED, COMPLETED
    
    # Progress tracking across granular levels
    completed_module_ids = Column(JSON, default=list)
    completed_topic_ids = Column(JSON, default=list)
    mastered_objective_ids = Column(JSON, default=list)
    
    # Coverage Metrics
    module_progress_pct = Column(Float, default=0.0)
    topic_progress_pct = Column(Float, default=0.0)
    objective_progress_pct = Column(Float, default=0.0)
    overall_coverage_pct = Column(Float, default=0.0)
    
    assessment_ready_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = relationship("LearnerProfile", backref=backref("course_progress_records", cascade="all, delete-orphan"))
    course = relationship("LearningResource", backref="learner_course_progress_records")
    syllabus = relationship("CourseSyllabus", back_populates="progress_records")
