import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    JSON,
    ForeignKey,
    DateTime,
    Index,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


class DSAPriorityProfile(Base):
    __tablename__ = "dsa_priority_profiles"
    __table_args__ = (
        Index("idx_dsa_priority_role", "role_id"),
        Index("idx_dsa_priority_canonical", "canonical_role_name"),
        Index("idx_dsa_priority_career", "career_id"),
    )

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    role_id = Column(String(36), ForeignKey("company_roles.id", ondelete="CASCADE"), nullable=True, index=True)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    career_id = Column(String(36), ForeignKey("careers.id", ondelete="CASCADE"), nullable=True, index=True)
    canonical_role_name = Column(String(150), nullable=True, index=True)

    # Priority levels: VERY_HIGH, HIGH, MEDIUM, LOW, MINIMAL, NOT_APPLICABLE, UNKNOWN
    priority_level = Column(String(30), default="MEDIUM", nullable=False)

    # Expected level: FOUNDATIONAL, WORKING, PROFICIENT, ADVANCED, EXPERT
    expected_level = Column(String(30), default="WORKING", nullable=False)

    # Target difficulties: EASY, MEDIUM, HARD
    minimum_difficulty = Column(String(20), default="EASY")
    recommended_difficulty = Column(String(20), default="MEDIUM")
    interview_difficulty = Column(String(20), default="MEDIUM")

    # Source hierarchy: COMPANY_ROLE, ROLE, CAREER, INDUSTRY
    source_level = Column(String(30), default="ROLE", nullable=False)
    confidence = Column(Float, default=0.8)
    source = Column(String(200), default="Role Benchmark Intelligence")
    source_url = Column(String(300), nullable=True)

    # Verification: VERIFIED, PARTIALLY_VERIFIED, BENCHMARK, UNKNOWN
    verification_status = Column(String(30), default="BENCHMARK")

    # Granular topic configurations: [{topic_slug, priority, importance, min_diff, target_diff, is_core}]
    topic_breakdown = Column(JSON, default=list)

    version = Column(Integer, default=1)
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    last_verified_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    role = relationship("CompanyRole")
    company = relationship("Company")
    career = relationship("Career")
