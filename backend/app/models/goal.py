import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Goal(Base):
    __tablename__ = "goals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False) # e.g. AI/ML Engineer
    description = Column(String(500), nullable=True)
    target_role = Column(String(100), nullable=False)
    target_skills = Column(JSON, default=list) # ["python", "machine-learning", "deep-learning"]
    is_primary = Column(Boolean, default=True)
    status = Column(String(50), default="active") # active, completed, paused
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="goals")
    learning_paths = relationship("LearningPath", back_populates="goal")
