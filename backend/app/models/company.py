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


class Company(Base):
    __tablename__ = "companies"
    __table_args__ = (
        Index("idx_companies_slug_status", "slug", "status"),
        Index("idx_companies_industry_type", "industry", "company_type"),
        Index("idx_companies_country", "headquarters_country"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(120), unique=True, nullable=False, index=True)
    canonical_name = Column(String(150), nullable=False, index=True)
    display_name = Column(String(150), nullable=False)
    aliases = Column(JSON, default=list)                         # ["Google LLC", "Google Inc", "Alphabet"]
    website = Column(String(255), nullable=True)
    careers_url = Column(String(255), nullable=True)

    industry = Column(String(100), nullable=False, index=True)   # Software & Cloud, Semiconductor, Healthcare, etc.
    company_type = Column(String(50), nullable=False, index=True) # PRODUCT, SERVICES, CONSULTING, STARTUP, SEMICONDUCTOR, etc.

    headquarters_country = Column(String(100), default="India", index=True)
    headquarters_region = Column(String(100), nullable=True)
    operating_countries = Column(JSON, default=lambda: ["India"])
    operating_regions = Column(JSON, default=lambda: ["Bengaluru", "National"])

    description = Column(Text, nullable=True)
    status = Column(String(30), default="ACTIVE", index=True)
    is_verified = Column(Boolean, default=True)

    # Provenance & Audit
    source = Column(String(100), default="PathFinder Corporate Registry")
    source_url = Column(String(300), nullable=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PARTIALLY_VERIFIED, SEED_METADATA, UNVERIFIED
    version = Column(Integer, default=1)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    roles = relationship("CompanyRole", back_populates="company", cascade="all, delete-orphan")


class CompanyRole(Base):
    __tablename__ = "company_roles"
    __table_args__ = (
        Index("idx_company_roles_lookup", "company_id", "role_slug"),
        Index("idx_company_roles_career", "career_id"),
        UniqueConstraint("company_id", "role_slug", name="uq_company_role_slug"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="SET NULL"), nullable=True, index=True)

    role_slug = Column(String(120), nullable=False, index=True)
    canonical_role_name = Column(String(150), nullable=False, index=True)  # Software Engineer, ML Engineer, etc.
    display_name = Column(String(150), nullable=False)
    aliases = Column(JSON, default=list)                                  # ["SDE", "SWE-1", "Backend SDE"]
    description = Column(Text, nullable=True)

    employment_type = Column(String(50), default="FULL_TIME")             # FULL_TIME, INTERN, CONTRACT
    experience_level = Column(String(50), default="ENTRY_LEVEL", index=True) # INTERN, ENTRY_LEVEL, JUNIOR, MID_LEVEL, SENIOR, LEAD
    location_scope = Column(String(100), default="National")
    remote_type = Column(String(50), default="HYBRID")                    # REMOTE, HYBRID, ONSITE
    status = Column(String(30), default="ACTIVE")

    # Role-level Core Signals
    dsa_relevance = Column(String(30), default="UNKNOWN")                  # VERY_HIGH, HIGH, MEDIUM, LOW, MINIMAL, NOT_APPLICABLE, UNKNOWN
    cs_fundamentals_relevance = Column(JSON, default=dict)                # {"os": "HIGH", "dbms": "HIGH", "networks": "MEDIUM", "system_design": "HIGH"}

    # Provenance
    source = Column(String(100), default="Verified Employer Job Specification")
    source_url = Column(String(300), nullable=True)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    verification_status = Column(String(50), default="VERIFIED")
    version = Column(Integer, default=1)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    company = relationship("Company", back_populates="roles")
    career = relationship("Career")
    skill_requirements = relationship(
        "RoleSkillRequirement", back_populates="company_role", cascade="all, delete-orphan"
    )
    dsa_requirements = relationship(
        "RoleDSARequirement", back_populates="company_role", cascade="all, delete-orphan"
    )
    tech_requirements = relationship(
        "RoleTechnologyRequirement", back_populates="company_role", cascade="all, delete-orphan"
    )
    interview_topics = relationship(
        "RoleInterviewTopic", back_populates="company_role", cascade="all, delete-orphan"
    )
