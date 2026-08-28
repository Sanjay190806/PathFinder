from sqlalchemy import Column, String, Float, Integer, Boolean, JSON, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid

from backend.app.database import Base

class BehaviorEvent(Base):
    __tablename__ = "behavior_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    event_type = Column(String(64), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="SET NULL"), nullable=True, index=True)
    skill_slug = Column(String(64), nullable=True, index=True)
    session_id = Column(String(64), nullable=True, index=True)
    source = Column(String(32), default="frontend", nullable=False)
    payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="behavior_events")
    resource = relationship("LearningResource")
