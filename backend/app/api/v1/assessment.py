from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
import uuid

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.assessment import Assessment, AssessmentQuestion, AssessmentResponse
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.skill import Skill
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.schemas.assessment import (
    AssessmentOut, AssessmentQuestionOut, AssessmentSubmit, AssessmentResultOut,
    SkillGapAnalysis, AdaptedCurriculumModule
)
from backend.app.adaptive.adaptive_engine import AdaptiveEngine
from backend.app.planner.planner_engine import PlannerEngine
from backend.app.core.logger import logger

router = APIRouter(prefix="/assessment", tags=["Skill Assessment"])

@router.get("", response_model=List[AssessmentOut])
def get_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).all()
    out = []
    for a in assessments:
        questions = [
            AssessmentQuestionOut(
                id=q.id,
                skill_id=q.skill_id,
                skill_name=q.skill.name if q.skill else "General",
                question_text=q.question_text,
                options=q.options or []
            )
            for q in a.questions
        ]
        out.append(AssessmentOut(
            id=a.id,
            title=a.title,
            domain=a.domain,
            questions=questions
        ))
    return out

@router.post("/submit", response_model=AssessmentResultOut)
def submit_assessment(
    payload: AssessmentSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    assessment = db.query(Assessment).filter(Assessment.id == payload.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found")

    correct_count = 0
    updates = []
    skill_perf: Dict[str, Dict[str, Any]] = {}
    engine = AdaptiveEngine(db)
    roadmap_adaptation_triggered = False

    for ans in payload.answers:
        q = db.query(AssessmentQuestion).filter(AssessmentQuestion.id == ans.question_id).first()
        if not q:
            continue
        is_correct = (ans.selected_option_index == q.correct_option_index)
        if is_correct:
            correct_count += 1

        skill_slug = q.skill.slug if q.skill else "general"
        skill_name = q.skill.name if q.skill else "General"

        if skill_slug not in skill_perf:
            skill_perf[skill_slug] = {"correct": 0, "total": 0, "name": skill_name, "skill_id": q.skill_id}
        skill_perf[skill_slug]["total"] += 1
        if is_correct:
            skill_perf[skill_slug]["correct"] += 1

        old_conf = float((profile.skill_confidence_map or {}).get(skill_slug, 0.5))
        event_id = str(uuid.uuid4())

        # Process quiz adaptation per skill question via AdaptiveEngine
        try:
            res = engine.process_event(
                event_id=event_id,
                profile_id=profile.id,
                event_type="quiz_answered",
                skill_slug=skill_slug,
                payload={"is_correct": is_correct, "score_ratio": 1.0 if is_correct else 0.0}
            )
            if res.get("roadmap_changed", False):
                roadmap_adaptation_triggered = True
        except Exception as ex:
            logger.warning(f"Adaptive event processing skipped: {ex}")

        db.add(AssessmentResponse(
            profile_id=profile.id,
            question_id=q.id,
            selected_option_index=ans.selected_option_index,
            is_correct=is_correct,
            confidence_delta=0.05 if is_correct else -0.05
        ))

        new_conf = float((profile.skill_confidence_map or {}).get(skill_slug, old_conf))

        updates.append({
            "skill": skill_name,
            "is_correct": is_correct,
            "old_confidence": old_conf,
            "new_confidence": new_conf,
            "delta": round(new_conf - old_conf, 4)
        })

    total_q = len(payload.answers)
    score_pct = (correct_count / total_q * 100) if total_q > 0 else 0.0

    # ─── Closed-Loop Skill Gap Analysis ────────────────────────────────────────
    skill_gaps: List[SkillGapAnalysis] = []
    remedial_slugs: List[str] = []

    for s_slug, stats in skill_perf.items():
        t_q = stats["total"]
        c_q = stats["correct"]
        acc = (c_q / t_q * 100.0) if t_q > 0 else 0.0

        if acc < 60.0:
            status_str = "REMEDIAL_NEEDED"
            priority = "HIGH"
            action = f"Complete foundational review in {stats['name']} to resolve conceptual gaps."
            remedial_slugs.append(s_slug)
        elif acc < 80.0:
            status_str = "DEVELOPING"
            priority = "MEDIUM"
            action = f"Practice applied problem sets and intermediate exercises in {stats['name']}."
        else:
            status_str = "MASTERED"
            priority = "LOW"
            action = f"Competency validated! Ready for advanced topics in {stats['name']}."

        skill_gaps.append(SkillGapAnalysis(
            skill=stats["name"],
            skill_slug=s_slug,
            score_percentage=round(acc, 1),
            status=status_str,
            recommended_action=action,
            priority=priority
        ))

    # Priority sort: REMEDIAL_NEEDED (HIGH) first, then lowest accuracy
    prio_map = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    skill_gaps.sort(key=lambda g: (prio_map.get(g.priority, 3), g.score_percentage))

    # ─── Closed-Loop Study Planner Recalculation ────────────────────────────────
    planner_recalculated = False
    try:
        planner_engine = PlannerEngine(db)
        planner_engine.generate_plan(
            profile_id=profile.id,
            reason="Automated schedule adaptation following assessment calibration",
            force_recalculate=True
        )
        planner_recalculated = True
    except Exception as ex:
        logger.warning(f"Planner recalculation failed: {ex}")

    # ─── Identify Adapted Remedial Modules ──────────────────────────────────────
    adapted_modules: List[AdaptedCurriculumModule] = []
    if remedial_slugs:
        try:
            matched_resources = (
                db.query(LearningResource)
                .join(ResourceSkill, ResourceSkill.resource_id == LearningResource.id)
                .join(Skill, Skill.id == ResourceSkill.skill_id)
                .filter(Skill.slug.in_(remedial_slugs))
                .limit(4)
                .all()
            )
            for r in matched_resources:
                s_name = r.resource_skills[0].skill.name if r.resource_skills else "Target Skill"
                adapted_modules.append(AdaptedCurriculumModule(
                    title=r.title,
                    skill=s_name,
                    estimated_hours=float(r.estimated_hours or 2.5),
                    provider=r.provider or "PathFinder Academy",
                    format=r.format or "Interactive Course",
                    is_remedial=True
                ))
        except Exception as ex:
            logger.warning(f"Failed to query remedial resources: {ex}")

    if not adapted_modules and remedial_slugs:
        for slug in remedial_slugs:
            name = skill_perf[slug]["name"]
            adapted_modules.append(AdaptedCurriculumModule(
                title=f"Core Remedial: {name} Deep-Dive Lab",
                skill=name,
                estimated_hours=3.0,
                provider="PathFinder Intelligence Engine",
                format="Interactive Guided Tutorial",
                is_remedial=True
            ))

    # ─── Active Roadmap Version Check ──────────────────────────────────────────
    new_roadmap_version = None
    try:
        active_path = db.query(LearningPath).filter(
            LearningPath.profile_id == profile.id,
            LearningPath.is_active == True
        ).first()
        if active_path:
            latest_v = db.query(LearningPathVersion).filter(
                LearningPathVersion.learning_path_id == active_path.id,
                LearningPathVersion.is_active == True
            ).order_by(LearningPathVersion.version_number.desc()).first()
            if latest_v:
                new_roadmap_version = latest_v.version_number
    except Exception as ex:
        logger.warning(f"Could not retrieve active roadmap version: {ex}")

    db.commit()

    if remedial_slugs:
        summary_msg = (
            f"Assessment completed with {correct_count}/{total_q} correct ({score_pct:.0f}%). "
            f"Identified {len(remedial_slugs)} critical skill gap(s). Study Planner has been dynamically adapted "
            f"with targeted remedial modules."
        )
    else:
        summary_msg = (
            f"Assessment completed with {correct_count}/{total_q} correct ({score_pct:.0f}%). "
            f"Strong performance across all evaluated skills! Study milestones have been advanced."
        )

    return AssessmentResultOut(
        assessment_id=assessment.id,
        total_questions=total_q,
        correct_count=correct_count,
        score_percentage=score_pct,
        skill_confidence_updates=updates,
        adaptation_triggered=True,
        summary_message=summary_msg,
        skill_gaps=skill_gaps,
        roadmap_adapted=roadmap_adaptation_triggered,
        planner_recalculated=planner_recalculated,
        new_roadmap_version=new_roadmap_version,
        adapted_modules=adapted_modules,
        recommended_next_step="Inspect your updated Study Planner to begin targeted remedial reinforcement."
    )

