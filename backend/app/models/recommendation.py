import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    profile_id = Column(String(36), ForeignKey("learner_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    resource_id = Column(String(36), ForeignKey("learning_resources.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Float, nullable=False, default=0.0)
    rank = Column(Integer, nullable=False, default=1)
    algorithm_version = Column(String(50), default="v1.2.0")
    embedding_model_version = Column(String(50), default="v1.0")
    recommendation_state_fingerprint = Column(String(64), nullable=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    profile = relationship("LearnerProfile", back_populates="recommendations")
    resource = relationship("LearningResource", back_populates="recommendations")
