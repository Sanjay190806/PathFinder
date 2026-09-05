import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    JSON,
    ForeignKey,
    DateTime,
    Text,
    Index,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class DSADomain(Base):
    __tablename__ = "dsa_domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    topics = relationship("DSATopic", back_populates="domain", cascade="all, delete-orphan")


class DSATopic(Base):
    __tablename__ = "dsa_topics"
    __table_args__ = (
        Index("idx_dsa_topic_slug", "slug"),
        Index("idx_dsa_topic_domain", "domain_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    domain_id = Column(String(36), ForeignKey("dsa_domains.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)

    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    # Classification & Guidance
    typical_importance = Column(String(30), default="HIGH")       # VERY_HIGH, HIGH, MEDIUM, LOW
    prerequisite_topic_slugs = Column(JSON, default=list)        # e.g. ["arrays", "recursion"]

    domain = relationship("DSADomain", back_populates="topics")
    skill = relationship("Skill")
    subtopics = relationship("DSASubtopic", back_populates="topic", cascade="all, delete-orphan")


class DSASubtopic(Base):
    __tablename__ = "dsa_subtopics"
    __table_args__ = (
        Index("idx_dsa_subtopic_topic", "topic_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    topic_id = Column(String(36), ForeignKey("dsa_topics.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)

    topic = relationship("DSATopic", back_populates="subtopics")
    concepts = relationship("DSAConcept", back_populates="subtopic", cascade="all, delete-orphan")


class DSAConcept(Base):
    __tablename__ = "dsa_concepts"
    __table_args__ = (
        Index("idx_dsa_concept_diff", "difficulty"),
        Index("idx_dsa_concept_subtopic", "subtopic_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    subtopic_id = Column(String(36), ForeignKey("dsa_subtopics.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    difficulty = Column(String(30), default="MEDIUM", index=True) # EASY, MEDIUM, HARD
    learning_objectives = Column(JSON, default=list)             # ["UNDERSTAND", "IMPLEMENT", "APPLY"]
    common_patterns = Column(JSON, default=list)                 # e.g. ["Two Pointers from ends", "Slow and Fast"]
    common_mistakes = Column(JSON, default=list)                 # e.g. ["Off-by-one error on bound check"]
    practice_resources = Column(JSON, default=list)              # List of resource references (title, url, free/paid, platform)

    subtopic = relationship("DSASubtopic", back_populates="concepts")
