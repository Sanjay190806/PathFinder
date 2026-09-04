from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Index, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    slug = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(200), nullable=False)
    company_name = Column(String(100), nullable=False)
    role_category = Column(String(100), nullable=False, index=True)  # AI/ML Engineer, Cybersecurity, Data Scientist, etc.
    required_skills = Column(JSON, default=list)  # ["python", "pytorch", "docker"]
    preferred_skills = Column(JSON, default=list)  # ["transformers", "mlops"]
    min_experience_level = Column(String(50), default="Entry Level")  # Entry Level, Mid, Senior, Internship
    location_type = Column(String(50), default="Remote")  # Remote, Hybrid, Onsite
    salary_range = Column(String(50), default="₹6 LPA - ₹12 LPA")
    description = Column(String(1000), nullable=False)
    opportunity_type = Column(String(50), default="Job")  # Job, Internship, Open Source, Fellowship, Competition, Apprenticeship
    is_active = Column(Boolean, default=True)

    # Phase 9 Stage 9 Extended Opportunity Attributes
    country = Column(String(50), default="India")
    state = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    min_education_stage = Column(String(100), default="Undergraduate") # School, Higher Secondary, Undergraduate, Postgraduate
    eligible_streams = Column(JSON, default=list) # ["Computer Science", "ECE", "Commerce", "Any"]
    application_url = Column(String(500), nullable=True)
    source = Column(String(100), default="JanSahay Verified Portal")
    provider = Column(String(100), default="Direct Employer")
    retrieved_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=True)
    verification_status = Column(String(50), default="VERIFIED") # VERIFIED, PARTIALLY_VERIFIED, UNVERIFIED, UNAVAILABLE, EXPIRED
    freshness = Column(String(50), default="FRESH") # FRESH, RECENT, AGING, STALE, EXPIRED

class LearnerOpportunityMatch(Base):
    __tablename__ = "learner_opportunity_matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(String(36), ForeignKey("opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    match_score = Column(Float, default=0.0)  # [0.0, 100.0]
    match_level = Column(String(50), default="Strong Fit")  # Strong Fit, Competitive Fit, Developing Fit, Early Prerequisite
    factor_breakdown = Column(JSON, default=dict)  # {"theoretical_readiness": 0.85, "practical_competency": 0.80, "portfolio_fit": 0.75}
    missing_skills = Column(JSON, default=list)
    match_reasons = Column(JSON, default=list)
    calculated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="opportunity_matches")
    opportunity = relationship("Opportunity")
