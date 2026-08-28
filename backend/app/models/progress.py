import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Progress(Base):
    __tablename__ = "progress_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="not_started") # not_started, in_progress, completed, skipped
    time_spent_minutes = Column(Integer, default=0)
    completion_percentage = Column(Float, default=0.0)
    last_accessed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="progress_records")
    resource = relationship("LearningResource", back_populates="progress_records")
