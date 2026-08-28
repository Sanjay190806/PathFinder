import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Feedback(Base):
    __tablename__ = "feedback_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback_type = Column(String(50), nullable=False) # helpful, too_difficult, too_easy, not_relevant, outdated
    rating = Column(Integer, default=5) # 1 to 5 stars
    comment = Column(String(500), nullable=True)
    idempotency_key = Column(String(100), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    profile = relationship("LearnerProfile", back_populates="feedbacks")
    resource = relationship("LearningResource", back_populates="feedbacks")
