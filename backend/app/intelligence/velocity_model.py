from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.progress import Progress
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.assessment import AssessmentResponse
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.schemas.intelligence import LearningVelocityOut

PHASE7_VELOCITY_MODEL_VERSION = "phase7.velocity.v1"

# Centralized deterministic scoring weights & thresholds
VELOCITY_WEIGHTS = {
    "completion_rate": 0.35,
    "consistency": 0.25,
    "assessment_accuracy": 0.20,
    "pacing": 0.20,
    "abandonment_penalty": 0.15,
}

class LearningVelocityEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_velocity(self, profile_id: str, days_window: int = 28) -> LearningVelocityOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        now = datetime.now(timezone.utc)
        window_start = now - timedelta(days=days_window)

        # 1. Fetch Authoritative Progress
        all_progress = self.db.query(Progress).filter(Progress.profile_id == profile_id).all()
        completed_items = [p for p in all_progress if p.status == "completed"]
        in_progress_items = [p for p in all_progress if p.status == "in_progress"]
        abandoned_events = (
            self.db.query(BehaviorEvent)
            .filter(BehaviorEvent.profile_id == profile_id, BehaviorEvent.event_type == "resource_abandoned")
            .count()
        )

        # 2. Completion Rate
        # Check active learning path items
        path = self.db.query(LearningPath).filter(LearningPath.profile_id == profile_id, LearningPath.is_active == True).first()
        total_eligible = 1
        if path:
            active_version = self.db.query(LearningPathVersion).filter(
                LearningPathVersion.learning_path_id == path.id,
                LearningPathVersion.is_active == True
            ).first()
            if active_version and active_version.items:
                total_eligible = max(1, len(active_version.items))

        completion_rate = min(1.0, max(0.0, len(completed_items) / total_eligible))

        # 3. Study Hours / Week (Authoritative verified minutes)
        total_minutes = sum(p.time_spent_minutes or 0 for p in all_progress)
        weeks = max(1.0, days_window / 7.0)
        study_hours_per_week = round((total_minutes / 60.0) / weeks, 2)

        # 4. Assessment Accuracy
        responses = (
            self.db.query(AssessmentResponse)
            .join(LearnerProfile, AssessmentResponse.profile_id == profile_id)
            .all()
        )
        if responses:
            correct_count = sum(1 for r in responses if r.is_correct)
            assessment_accuracy = round(correct_count / max(1, len(responses)), 4)
        else:
            assessment_accuracy = 0.80 if completed_items else 0.50

        # 5. Study Consistency
        # Aggregate distinct active days from behavior events and progress
        events = self.db.query(BehaviorEvent).filter(
            BehaviorEvent.profile_id == profile_id,
            BehaviorEvent.timestamp >= window_start
        ).all()
        active_days = set()
        for ev in events:
            ev_ts = ev.timestamp
            if ev_ts.tzinfo is None:
                ev_ts = ev_ts.replace(tzinfo=timezone.utc)
            active_days.add(ev_ts.date())

        expected_study_days = max(1, int(days_window * (profile.weekly_hours or 10) / 20.0))
        consistency_score = min(1.0, max(0.0, round(len(active_days) / expected_study_days, 4)))

        # 6. Abandonment Rate
        total_started = len(completed_items) + len(in_progress_items) + abandoned_events
        abandonment_rate = round(abandoned_events / max(1, total_started), 4) if total_started > 0 else 0.0

        # 7. Pacing Classification
        target_weekly_hours = float(profile.weekly_hours or 10)
        if len(events) == 0 and len(all_progress) == 0:
            pacing_state = "inactive"
            pacing_factor = 0.0
            engagement_state = "insufficient_data"
            confidence = "insufficient_data"
        elif study_hours_per_week >= target_weekly_hours * 1.30:
            pacing_state = "accelerated"
            pacing_factor = 1.0
            engagement_state = "highly_engaged"
            confidence = "high"
        elif study_hours_per_week >= target_weekly_hours * 0.70:
            pacing_state = "on_track"
            pacing_factor = 0.80
            engagement_state = "engaged"
            confidence = "high" if len(all_progress) >= 2 else "medium"
        elif study_hours_per_week > 0.1:
            pacing_state = "behind_schedule"
            pacing_factor = 0.40
            engagement_state = "inconsistent" if consistency_score < 0.40 else "low_engagement"
            confidence = "medium"
        else:
            pacing_state = "inactive"
            pacing_factor = 0.10
            engagement_state = "inactive"
            confidence = "low"

        # 8. Composite Deterministic Velocity Score
        raw_velocity = (
            VELOCITY_WEIGHTS["completion_rate"] * completion_rate
            + VELOCITY_WEIGHTS["consistency"] * consistency_score
            + VELOCITY_WEIGHTS["assessment_accuracy"] * assessment_accuracy
            + VELOCITY_WEIGHTS["pacing"] * pacing_factor
            - VELOCITY_WEIGHTS["abandonment_penalty"] * abandonment_rate
        )
        velocity_score = max(0.0, min(1.0, round(raw_velocity, 4)))

        # 9. Human Explanation
        explanation = (
            f"Velocity is {pacing_state.replace('_', ' ')} with a consistency score of {int(consistency_score*100)}% "
            f"and {study_hours_per_week} study hours/week across {len(completed_items)} completed modules."
        )

        return LearningVelocityOut(
            profile_id=profile_id,
            completion_rate=round(completion_rate, 4),
            study_hours_per_week=study_hours_per_week,
            assessment_accuracy=round(assessment_accuracy, 4),
            consistency_score=consistency_score,
            abandonment_rate=abandonment_rate,
            pacing_state=pacing_state,
            velocity_score=velocity_score,
            engagement_state=engagement_state,
            confidence=confidence,
            explanation=explanation,
            factors={
                "completion_component": round(VELOCITY_WEIGHTS["completion_rate"] * completion_rate, 4),
                "consistency_component": round(VELOCITY_WEIGHTS["consistency"] * consistency_score, 4),
                "assessment_component": round(VELOCITY_WEIGHTS["assessment_accuracy"] * assessment_accuracy, 4),
                "pacing_component": round(VELOCITY_WEIGHTS["pacing"] * pacing_factor, 4),
                "abandonment_penalty": round(VELOCITY_WEIGHTS["abandonment_penalty"] * abandonment_rate, 4),
            },
            model_version=PHASE7_VELOCITY_MODEL_VERSION
        )
