import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Boolean,
    Integer,
    Float,
    JSON,
    ForeignKey,
    DateTime,
    Text,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class RoleSkillRequirement(Base):
    __tablename__ = "role_skill_requirements"
    __table_args__ = (
        Index("idx_role_skill_req", "role_id", "skill_id"),
        UniqueConstraint("role_id", "skill_id", name="uq_role_skill_req"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role_id = Column(String(36), ForeignKey("company_roles.id", ondelete="CASCADE"), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    requirement_type = Column(String(50), default="REQUIRED")    # REQUIRED, PREFERRED, VALUABLE, OPTIONAL, ROLE_DEPENDENT, UNKNOWN
    importance = Column(String(30), default="HIGH")              # HIGH, MEDIUM, LOW
    minimum_level = Column(String(50), default="WORKING")        # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT

    source = Column(String(100), default="Verified Job Specification")
    source_url = Column(String(300), nullable=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, PARTIALLY_VERIFIED, SEED_METADATA, UNVERIFIED
    effective_from = Column(DateTime, nullable=True)
    effective_to = Column(DateTime, nullable=True)
    version = Column(Integer, default=1)

    company_role = relationship("CompanyRole", back_populates="skill_requirements")
    skill = relationship("Skill")


class RoleDSARequirement(Base):
    __tablename__ = "role_dsa_requirements"
    __table_args__ = (
        Index("idx_role_dsa_req", "role_id", "dsa_topic_slug"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role_id = Column(String(36), ForeignKey("company_roles.id", ondelete="CASCADE"), nullable=False, index=True)

    dsa_topic_slug = Column(String(100), nullable=False, index=True)
    dsa_topic_name = Column(String(150), nullable=True)
    importance = Column(String(30), default="HIGH")              # HIGH, MEDIUM, LOW
    difficulty_target = Column(String(30), default="MEDIUM")     # EASY, MEDIUM, HARD
    requirement_type = Column(String(50), default="REQUIRED")    # REQUIRED, PREFERRED, VALUABLE, OPTIONAL

    source = Column(String(100), default="Role Interview Blueprint")
    source_url = Column(String(300), nullable=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_status = Column(String(50), default="VERIFIED")

    company_role = relationship("CompanyRole", back_populates="dsa_requirements")


class RoleTechnologyRequirement(Base):
    __tablename__ = "role_technology_requirements"
    __table_args__ = (
        Index("idx_role_tech_req", "role_id", "category"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role_id = Column(String(36), ForeignKey("company_roles.id", ondelete="CASCADE"), nullable=False, index=True)

    category = Column(String(50), nullable=False, index=True)    # PROGRAMMING_LANGUAGE, FRAMEWORK, DATABASE, CLOUD, TOOL, EDA_TOOL, etc.
    technology_name = Column(String(100), nullable=False, index=True) # Java, Python, React, AWS, Docker, Verilog
    is_mandatory = Column(Boolean, default=False)
    importance = Column(String(30), default="HIGH")
    requirement_type = Column(String(50), default="PREFERRED")

    company_role = relationship("CompanyRole", back_populates="tech_requirements")


class RoleInterviewTopic(Base):
    __tablename__ = "role_interview_topics"
    __table_args__ = (
        Index("idx_role_interview_topic", "role_id", "topic_category"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role_id = Column(String(36), ForeignKey("company_roles.id", ondelete="CASCADE"), nullable=False, index=True)

    topic_name = Column(String(150), nullable=False)
    topic_category = Column(String(50), default="TECHNICAL")     # DSA, SYSTEM_DESIGN, CS_CORE, DOMAIN_SPECIFIC, BEHAVIORAL
    weight = Column(Float, default=1.0)
    focus_areas = Column(JSON, default=list)

    company_role = relationship("CompanyRole", back_populates="interview_topics")
