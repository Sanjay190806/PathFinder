import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, JSON, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from backend.app.database import Base

class LearnerPlan(Base):
    __tablename__ = "learner_plans"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    plan_version = Column(Integer, default=1)
    daily_plan = Column(JSON, nullable=False)
    weekly_plan = Column(JSON, nullable=False)
    monthly_plan = Column(JSON, nullable=True)
    milestone_plan = Column(JSON, nullable=False)
    overflow_hours = Column(Float, default=0.0)
    reason = Column(String(500), default="Initial baseline plan generation")
    source_signals = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile")
