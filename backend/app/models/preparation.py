from datetime import datetime
import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from backend.app.database import Base


class PreparationHistoryRecord(Base):
    __tablename__ = "preparation_history_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    learner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    career_id = Column(String(64), nullable=True, index=True)
    opportunity_id = Column(String(36), nullable=True, index=True)
    overall_score = Column(Float, nullable=False, default=0.0)
    dimension_scores = Column(JSON, nullable=False, default=dict)
    identified_gaps = Column(JSON, nullable=False, default=list)
    recommended_actions = Column(JSON, nullable=False, default=list)
    recorded_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    learner = relationship("User", foreign_keys=[learner_id])

    def to_dict(self):
        return {
            "id": self.id,
            "learner_id": self.learner_id,
            "career_id": self.career_id,
            "opportunity_id": self.opportunity_id,
            "overall_score": round(self.overall_score, 1),
            "dimension_scores": self.dimension_scores or {},
            "identified_gaps": self.identified_gaps or [],
            "recommended_actions": self.recommended_actions or [],
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }
