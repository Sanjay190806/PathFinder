import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.behavior_event import BehaviorEvent
from backend.app.models.profile import LearnerProfile
from backend.app.models.resource import LearningResource
from backend.app.schemas.intelligence import BehaviorEventCreate, BehaviorSummaryOut
from backend.app.core.logger import logger

class BehaviorEngine:
    def __init__(self, db: Session):
        self.db = db

    def record_event(self, profile_id: str, event_in: BehaviorEventCreate) -> Tuple[BehaviorEvent, bool]:
        """
        Idempotent behavior event ingestion.
        Returns (event, is_created).
        """
        existing = (
            self.db.query(BehaviorEvent)
            .filter(BehaviorEvent.event_id == event_in.event_id)
            .first()
        )
        if existing:
            # Enforce user isolation
            if existing.profile_id != profile_id:
                logger.warning(f"IDOR_DETECTED: Event {event_in.event_id} belongs to another profile")
                raise PermissionError("Event identifier already registered under another account")
            return existing, False

        # Validate resource existence if supplied
        if event_in.resource_id:
            res_exists = self.db.query(LearningResource).filter(LearningResource.id == event_in.resource_id).first()
            if not res_exists:
                logger.warning(f"Resource {event_in.resource_id} not found in database; logging event with detached resource")

        ts = event_in.timestamp or datetime.now(timezone.utc)
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)

        new_event = BehaviorEvent(
            id=str(uuid.uuid4()),
            event_id=event_in.event_id,
            profile_id=profile_id,
            event_type=event_in.event_type,
            resource_id=event_in.resource_id,
            skill_slug=event_in.skill_slug,
            session_id=event_in.session_id,
            source=event_in.source,
            payload=event_in.payload or {},
            timestamp=ts
        )
        self.db.add(new_event)
        self.db.commit()
        self.db.refresh(new_event)
        return new_event, True

    def get_events(
        self,
        profile_id: str,
        limit: int = 50,
        event_type: Optional[str] = None,
        skill_slug: Optional[str] = None
    ) -> List[BehaviorEvent]:
        query = self.db.query(BehaviorEvent).filter(BehaviorEvent.profile_id == profile_id)
        if event_type:
            query = query.filter(BehaviorEvent.event_type == event_type)
        if skill_slug:
            query = query.filter(BehaviorEvent.skill_slug == skill_slug)
        return query.order_by(BehaviorEvent.timestamp.desc()).limit(limit).all()

    def get_behavior_summary(self, profile_id: str) -> BehaviorSummaryOut:
        events = self.db.query(BehaviorEvent).filter(BehaviorEvent.profile_id == profile_id).all()
        now = datetime.now(timezone.utc)
        seven_days_ago = now - timedelta(days=7)
        thirty_days_ago = now - timedelta(days=30)

        total_events = len(events)
        sessions = set()
        resources_viewed = 0
        resources_started = 0
        resources_completed = 0
        resources_abandoned = 0
        assessments_completed = 0
        quiz_attempts = 0
        coach_interactions = 0
        recommendations_clicked = 0
        events_7d = 0
        events_30d = 0
        skill_counts: Dict[str, int] = {}

        for ev in events:
            ev_ts = ev.timestamp
            if ev_ts.tzinfo is None:
                ev_ts = ev_ts.replace(tzinfo=timezone.utc)

            if ev_ts >= seven_days_ago:
                events_7d += 1
            if ev_ts >= thirty_days_ago:
                events_30d += 1

            if ev.session_id:
                sessions.add(ev.session_id)

            t = ev.event_type
            if t == "resource_viewed":
                resources_viewed += 1
            elif t == "resource_started":
                resources_started += 1
            elif t == "resource_completed":
                resources_completed += 1
            elif t == "resource_abandoned":
                resources_abandoned += 1
            elif t == "assessment_completed":
                assessments_completed += 1
            elif t in ("quiz_attempted", "quiz_completed"):
                quiz_attempts += 1
            elif t == "ai_coach_interaction":
                coach_interactions += 1
            elif t == "recommendation_clicked":
                recommendations_clicked += 1

            if ev.skill_slug:
                skill_counts[ev.skill_slug] = skill_counts.get(ev.skill_slug, 0) + 1

        return BehaviorSummaryOut(
            profile_id=profile_id,
            total_events=total_events,
            active_sessions=len(sessions),
            resources_viewed=resources_viewed,
            resources_started=resources_started,
            resources_completed=resources_completed,
            resources_abandoned=resources_abandoned,
            assessments_completed=assessments_completed,
            quiz_attempts=quiz_attempts,
            coach_interactions=coach_interactions,
            recommendations_clicked=recommendations_clicked,
            events_last_7_days=events_7d,
            events_last_30_days=events_30d,
            per_skill_counts=skill_counts
        )
