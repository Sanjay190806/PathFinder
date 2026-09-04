from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import uuid
from sqlalchemy.orm import Session

from backend.app.models.preparation import PreparationHistoryRecord


class PreparationHistoryTracker:
    """
    Records immutable historical readiness snapshots and provides
    time-series tracking for preparation progression.
    """

    def __init__(self, db: Session):
        self.db = db

    def record_snapshot(
        self,
        learner_id: str,
        overall_score: float,
        dimension_scores: Dict[str, float],
        identified_gaps: List[Dict[str, Any]],
        recommended_actions: List[Dict[str, Any]],
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
    ) -> PreparationHistoryRecord:
        record = PreparationHistoryRecord(
            id=str(uuid.uuid4()),
            learner_id=learner_id,
            career_id=career_id,
            opportunity_id=opportunity_id,
            overall_score=overall_score,
            dimension_scores=dimension_scores,
            identified_gaps=identified_gaps,
            recommended_actions=recommended_actions,
            recorded_at=datetime.now(timezone.utc),
        )
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_learner_history(
        self,
        learner_id: str,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        records = (
            self.db.query(PreparationHistoryRecord)
            .filter(PreparationHistoryRecord.learner_id == learner_id)
            .order_by(PreparationHistoryRecord.recorded_at.desc())
            .limit(limit)
            .all()
        )
        return [r.to_dict() for r in records]
