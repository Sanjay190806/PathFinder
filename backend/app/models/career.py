"""
Canonical Career Data Models (Phase 11 Stage 1)
Defines relational entities for Domains, Families, Careers, Specializations,
Relationships, Skills Requirements, Education Requirements, and Regional Metadata.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    JSON,
    ForeignKey,
    DateTime,
    Text,
    UniqueConstraint,
    Index
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class CareerDomain(Base):
    __tablename__ = "career_domains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    icon = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    families = relationship("CareerFamily", back_populates="domain", cascade="all, delete-orphan")
    careers = relationship("Career", back_populates="domain")


class CareerFamily(Base):
    __tablename__ = "career_families"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    domain_id = Column(String(36), ForeignKey("career_domains.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    domain = relationship("CareerDomain", back_populates="families")
    careers = relationship("Career", back_populates="family")


class Career(Base):
    __tablename__ = "careers"
    __table_args__ = (
        Index("idx_careers_search", "canonical_name", "status", "is_active"),
        Index("idx_careers_domain_family", "career_domain_id", "career_family_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    canonical_name = Column(String(150), nullable=False, index=True)
    display_name = Column(String(150), nullable=False)
    short_description = Column(String(500), nullable=False)
    long_description = Column(Text, nullable=True)

    career_domain_id = Column(String(36), ForeignKey("career_domains.id", ondelete="SET NULL"), nullable=True, index=True)
    career_family_id = Column(String(36), ForeignKey("career_families.id", ondelete="SET NULL"), nullable=True, index=True)
    specialization = Column(String(150), nullable=True)

    # Search & Discovery
    aliases = Column(JSON, default=list)       # ["SDE", "Software Developer", "Coder"]
    keywords = Column(JSON, default=list)      # ["code", "algorithms", "programming"]
    status = Column(String(30), default="ACTIVE", index=True)  # ACTIVE, DRAFT, ARCHIVED, DEPRECATED
    is_active = Column(Boolean, default=True, index=True)

    # Attributes & Governance
    is_emerging = Column(Boolean, default=False, index=True)
    emergence_source = Column(String(200), nullable=True)
    last_verified_at = Column(DateTime, nullable=True)

    is_regulated = Column(Boolean, default=False, index=True)
    regulation_country = Column(String(50), nullable=True)
    regulatory_requirement = Column(Text, nullable=True)
    qualification_requirement = Column(String(250), nullable=True)

    country_scope = Column(String(50), default="GLOBAL")  # GLOBAL, REGIONAL, INDIA
    global_relevance = Column(Float, default=1.0)

    # Workplace & Practice
    work_environment = Column(String(100), nullable=True)  # Office, Hospital, Field, Studio, Remote
    remote_compatibility = Column(String(50), default="MEDIUM")  # HIGH, MEDIUM, LOW, HYBRID
    typical_tasks = Column(JSON, default=list)
    tools = Column(JSON, default=list)
    portfolio_expectations = Column(Text, nullable=True)
    experience_levels = Column(JSON, default=lambda: ["Entry", "Mid", "Senior"])
    employment_types = Column(JSON, default=lambda: ["Full-Time", "Contract"])
    industry_types = Column(JSON, default=list)

    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    domain = relationship("CareerDomain", back_populates="careers")
    family = relationship("CareerFamily", back_populates="careers")
    specializations = relationship("CareerSpecialization", back_populates="career", cascade="all, delete-orphan")
    skill_requirements = relationship("CareerSkillRequirement", back_populates="career", cascade="all, delete-orphan")
    education_requirements = relationship("CareerEducationRequirement", back_populates="career", cascade="all, delete-orphan")
    regional_metadata = relationship("CareerRegionalMetadata", back_populates="career", cascade="all, delete-orphan")
    requirements = relationship("CareerRequirement", back_populates="career", cascade="all, delete-orphan")
    pathways = relationship("CareerPathwayDefinition", back_populates="career", cascade="all, delete-orphan")
    market_signals = relationship("CareerMarketSignal", back_populates="career", cascade="all, delete-orphan")
    translations = relationship("CareerTranslation", back_populates="career", cascade="all, delete-orphan")

    outgoing_relationships = relationship(
        "CareerRelationship",
        foreign_keys="CareerRelationship.source_career_id",
        back_populates="source_career",
        cascade="all, delete-orphan"
    )
    incoming_relationships = relationship(
        "CareerRelationship",
        foreign_keys="CareerRelationship.target_career_id",
        back_populates="target_career",
        cascade="all, delete-orphan"
    )


class CareerSpecialization(Base):
    __tablename__ = "career_specializations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    slug = Column(String(100), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    focus_areas = Column(JSON, default=list)
    order = Column(Integer, default=0)

    career = relationship("Career", back_populates="specializations")


class CareerRelationship(Base):
    __tablename__ = "career_relationships"
    __table_args__ = (
        UniqueConstraint("source_career_id", "target_career_id", "relationship_type", name="uq_career_relationship"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    target_career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), nullable=False)  # RELATED, SUBSPECIALIZATION, ALTERNATIVE, ADJACENT, TRANSITION, PREDECESSOR, SUCCESSOR
    notes = Column(Text, nullable=True)
    transferable_skills = Column(JSON, default=list)
    bridge_skills = Column(JSON, default=list)

    source_career = relationship("Career", foreign_keys=[source_career_id], back_populates="outgoing_relationships")
    target_career = relationship("Career", foreign_keys=[target_career_id], back_populates="incoming_relationships")


class CareerSkillRequirement(Base):
    __tablename__ = "career_skill_requirements"
    __table_args__ = (
        UniqueConstraint("career_id", "skill_id", name="uq_career_skill_requirement"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    # References the existing canonical skills table directly - no duplicate skill taxonomy!
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)

    importance = Column(String(30), default="RECOMMENDED", index=True)  # MANDATORY, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE
    proficiency_level = Column(String(30), default="WORKING")           # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT
    evidence_type = Column(String(100), nullable=True)                  # Code, Portfolio, Assessment, Project, Certification
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    career = relationship("Career", back_populates="skill_requirements")
    skill = relationship("Skill")


class CareerEducationRequirement(Base):
    __tablename__ = "career_education_requirements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Maps to Phase 9 Education taxonomy
    education_level = Column(String(100), nullable=False)  # secondary-school, higher-secondary, diploma-polytechnic, iti-vocational, undergraduate, postgraduate
    preferred_streams = Column(JSON, default=list)         # ["engineering-technology", "computer-science-engineering", "pcm"]
    subject_prerequisites = Column(JSON, default=list)     # ["Mathematics", "Physics", "Computer Science"]
    requirement_type = Column(String(30), default="RECOMMENDED")  # HARD, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE
    notes = Column(Text, nullable=True)

    career = relationship("Career", back_populates="education_requirements")


class CareerRegionalMetadata(Base):
    __tablename__ = "career_regional_metadata"
    __table_args__ = (
        UniqueConstraint("career_id", "country_code", "region_code", name="uq_career_regional_metadata"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    country_code = Column(String(10), nullable=False, default="GLOBAL")  # IN, US, GLOBAL
    region_code = Column(String(50), nullable=True)                      # State or jurisdiction code
    regulatory_body = Column(String(200), nullable=True)                 # NMC, BCI, AICTE, DGCA
    statutory_exam = Column(String(200), nullable=True)                  # NEET-UG, CLAT, CPL, CA-Foundation
    notes = Column(Text, nullable=True)

    career = relationship("Career", back_populates="regional_metadata")


class CareerRequirement(Base):
    __tablename__ = "career_requirements"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    requirement_type = Column(String(30), nullable=False, index=True)  # HARD_REQUIREMENT, RECOMMENDED, HELPFUL, OPTIONAL, BRIDGE_REQUIRED
    category = Column(String(50), nullable=False, index=True)          # EDUCATION, SUBJECT, DEGREE, CERTIFICATION, LICENSE, SKILL, EXPERIENCE, PORTFOLIO, PROJECT, REGULATORY
    requirement_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)

    education_level = Column(String(100), nullable=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    minimum_level = Column(String(30), default="WORKING")              # FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED
    mandatory = Column(Boolean, default=False)

    source = Column(String(200), nullable=True)
    source_url = Column(String(300), nullable=True)
    verification_status = Column(String(30), default="VERIFIED")       # VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, UNKNOWN, EXPIRED
    country_code = Column(String(10), default="GLOBAL")
    region_code = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    career = relationship("Career", back_populates="requirements")
    skill = relationship("Skill")


class CareerPathwayDefinition(Base):
    __tablename__ = "career_pathways"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    pathway_id = Column(String(100), nullable=False, index=True)
    pathway_type = Column(String(50), nullable=False)                  # DIRECT, DEGREE, DIPLOMA, ITI, VOCATIONAL, POSTGRADUATE, CERTIFICATION_SUPPORTED, BRIDGE, CAREER_TRANSITION, ADJACENT_SKILL, ALTERNATIVE_ACADEMIC
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    applicable_backgrounds = Column(JSON, default=list)                # ["pcm", "computer-science-engineering", "diploma"]
    duration_estimate = Column(String(50), default="6-12 months")
    difficulty_level = Column(String(50), default="Moderate")
    is_primary = Column(Boolean, default=True)

    career = relationship("Career", back_populates="pathways")
    steps = relationship("PathwayStepDefinition", back_populates="pathway", cascade="all, delete-orphan", order_by="PathwayStepDefinition.step_number")


class PathwayStepDefinition(Base):
    __tablename__ = "career_pathway_steps"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    pathway_id = Column(String(36), ForeignKey("career_pathways.id", ondelete="CASCADE"), nullable=False, index=True)
    step_number = Column(Integer, nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    step_type = Column(String(50), nullable=False)                     # academic_prerequisite, foundational_skill, core_competency, capstone_evidence, industry_entry, licensure_exam
    skills_to_acquire = Column(JSON, default=list)
    estimated_weeks = Column(Integer, default=4)
    prerequisites = Column(JSON, default=list)

    pathway = relationship("CareerPathwayDefinition", back_populates="steps")


class CareerMarketSignal(Base):
    __tablename__ = "career_market_signals"
    __table_args__ = (
        Index("idx_market_signal_lookup", "career_slug", "signal_type", "country_code"),
        Index("idx_market_signal_region", "career_slug", "region_code"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    career_slug = Column(String(100), nullable=False, index=True)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True)
    skill_slug = Column(String(100), nullable=True, index=True)

    # Signal taxonomy: DEMAND, DEMAND_TREND, SKILL_DEMAND, EMERGING_SKILL, DECLINING_SKILL,
    # SALARY, SALARY_RANGE, JOB_COUNT, HIRING_TREND, ROLE_TREND, TECHNOLOGY_TREND,
    # INDUSTRY_TREND, REGIONAL_DEMAND, QUALIFICATION_TREND, LEARNING_DEMAND
    signal_type = Column(String(50), nullable=False, index=True)
    signal_value = Column(String(200), nullable=False)
    numeric_value = Column(Float, nullable=True)
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    currency = Column(String(10), default="INR")
    period = Column(String(20), default="ANNUAL")                      # ANNUAL, MONTHLY, HOURLY
    experience_level = Column(String(30), default="ALL", index=True)   # ENTRY, MID, SENIOR, ALL
    data_quality = Column(String(30), default="REPORTED")              # REPORTED, ESTIMATED, RANGE, UNKNOWN
    unit = Column(String(50), default="INDEX")                         # INDEX, INR_PER_YEAR, PERCENTAGE, JOB_POSTINGS, RATING

    # Regional & Industrial Focus
    country_code = Column(String(10), default="IN", index=True)        # IN, US, GLOBAL
    region_code = Column(String(50), default="National", index=True)   # Bengaluru, Mumbai, Delhi NCR, Hyderabad, Chennai, Pune, National
    industry = Column(String(100), nullable=True)

    # Source Governance & Provenance
    source_tier = Column(Integer, default=1, index=True)               # Tier 1: official/gov, Tier 2: approved job APIs/reputable sources, Tier 3: secondary
    source_name = Column(String(200), nullable=False)
    source_url = Column(String(300), nullable=True)
    provider = Column(String(100), default="PathFinder Market Intelligence")
    confidence = Column(Float, default=0.90)                           # 0.0 to 1.0

    time_window = Column(String(50), default="2026-Q1")
    observed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    ttl_days = Column(Integer, default=30)
    is_active = Column(Boolean, default=True, index=True)
    metadata_json = Column(JSON, default=dict)

    # Relationships
    career = relationship("Career", back_populates="market_signals")
    skill = relationship("Skill")


class CareerTranslation(Base):
    """
    Phase 11 Stage 10: Language Overlay on Canonical Careers.
    Preserves language-neutral canonical career IDs and slugs,
    while providing native localized titles, descriptions,
    specializations, and multilingual search terms.
    """
    __tablename__ = "career_translations"
    __table_args__ = (
        UniqueConstraint("career_id", "language_code", name="uq_career_translation_lang"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=False, index=True)
    career_slug = Column(String(100), nullable=False, index=True)
    language_code = Column(String(10), nullable=False, index=True)  # en, hi, ta, te, kn, ml, mr, bn, gu, pa, or, ur

    # Localized canonical fields
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    family_name = Column(String(150), nullable=True)
    domain_name = Column(String(150), nullable=True)
    specialization_names = Column(JSON, default=list)

    # Multilingual search & alias discovery
    search_terms = Column(JSON, default=list)

    # Localized explanatory notes
    requirement_notes = Column(JSON, default=dict)
    pathway_notes = Column(JSON, default=dict)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    career = relationship("Career", back_populates="translations")

