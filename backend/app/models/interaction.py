import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Interaction(Base):
    __tablename__ = "interaction_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=True, index=True)
    event_type = Column(String(50), nullable=False) # view, start, complete, skip, search, chat, rate
    meta_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="interactions")
    resource = relationship("LearningResource", back_populates="interactions")
