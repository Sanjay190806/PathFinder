from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.skill import Skill
from backend.app.schemas.analytics import AnalyticsSummaryOut, SkillMasteryPoint, PhaseProgressOut

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("", response_model=AnalyticsSummaryOut)
def get_analytics(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    path = db.query(LearningPath).filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True).first()
    total_resources = 0
    completed_resources = 0
    in_progress = 0
    active_phase = "Phase 1: Foundations"
    total_hours = 0.0
    hours_done = 0.0
    phase_map: Dict[int, dict] = {}

    if path:
        active_version = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == path.id,
            LearningPathVersion.is_active == True
        ).first()
        if active_version:
            total_resources = len(active_version.items)
            for it in active_version.items:
                total_hours += it.resource.estimated_hours
                if it.is_completed:
                    completed_resources += 1
                    hours_done += it.resource.estimated_hours

                # Track per-phase metrics
                p_num = it.phase_number
                if p_num not in phase_map:
                    phase_map[p_num] = {
                        "phase_number": p_num,
                        "phase_name": it.phase_name,
                        "total_modules": 0,
                        "completed_modules": 0,
                        "total_hours": 0.0,
                        "completed_hours": 0.0
                    }
                p_data = phase_map[p_num]
                p_data["total_modules"] += 1
                p_data["total_hours"] += it.resource.estimated_hours
                if it.is_completed:
                    p_data["completed_modules"] += 1
                    p_data["completed_hours"] += it.resource.estimated_hours

            # Determine true active phase (first incomplete phase, or last phase)
            incomplete_item = next((it for it in active_version.items if not it.is_completed), None)
            if incomplete_item:
                active_phase = f"Phase {incomplete_item.phase_number}: {incomplete_item.phase_name}"
            elif active_version.items:
                active_phase = f"Phase {active_version.items[-1].phase_number}: {active_version.items[-1].phase_name}"

    phase_progress_list = []
    for p_num in sorted(phase_map.keys()):
        d = phase_map[p_num]
        pct = (d["completed_modules"] / d["total_modules"] * 100) if d["total_modules"] > 0 else 0.0
        phase_progress_list.append(PhaseProgressOut(
            phase_number=d["phase_number"],
            phase_name=d["phase_name"],
            total_modules=d["total_modules"],
            completed_modules=d["completed_modules"],
            completion_percentage=round(pct, 1),
            total_hours=round(d["total_hours"], 1),
            completed_hours=round(d["completed_hours"], 1)
        ))

    progress_records = db.query(Progress).filter(Progress.profile_id == profile.id).all()
    completed_from_progress = len([p for p in progress_records if p.status == "completed"])
    in_progress = len([p for p in progress_records if p.status == "in_progress"])
    completed_resources = max(completed_resources, completed_from_progress)
    hours_from_progress = sum((p.time_spent_minutes or 0) / 60.0 for p in progress_records if p.status == "completed")
    hours_done = max(hours_done, hours_from_progress)

    conf_map = dict(profile.skill_confidence_map or {})
    all_skills = db.query(Skill).all()
    skill_points = []
    strengths = []
    weaknesses = []

    for s in all_skills:
        conf = conf_map.get(s.slug, 0.0)
        if conf > 0.0:
            skill_points.append(SkillMasteryPoint(
                skill=s.name,
                category=s.category,
                confidence=conf,
                target_confidence=0.85
            ))
            if conf >= 0.65:
                strengths.append(s.name)
            elif conf < 0.40:
                weaknesses.append(s.name)

    feedbacks = db.query(Feedback).filter(Feedback.profile_id == profile.id).all()
    acceptance_rate = (len([f for f in feedbacks if f.feedback_type in ["helpful", "too_easy"]]) / len(feedbacks) * 100) if feedbacks else 92.0

    pct = (completed_resources / total_resources * 100) if total_resources > 0 else 0.0

    return AnalyticsSummaryOut(
        total_resources=total_resources,
        completed_resources=completed_resources,
        in_progress_resources=in_progress,
        total_learning_hours=round(total_hours, 1),
        hours_completed=round(hours_done, 1),
        current_streak_days=5 if current_user.is_demo else 1,
        active_phase=active_phase,
        overall_progress_percentage=round(pct, 1),
        skill_mastery=skill_points[:8],
        strengths=strengths[:4] if strengths else [],
        weaknesses=weaknesses[:4] if weaknesses else [],
        acceptance_rate=round(acceptance_rate, 1),
        weekly_velocity=profile.velocity_score or 1.0,
        phase_progress=phase_progress_list
    )
