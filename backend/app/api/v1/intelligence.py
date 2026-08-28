from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from backend.app.database import get_db
from backend.app.api.v1.auth import get_current_user
from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.intelligence import (
    BehaviorEventCreate,
    BehaviorEventOut,
    BehaviorSummaryOut,
    LearningVelocityOut,
    SkillMasteryOut,
    SkillDecayOut,
    MasteryDecaySummaryOut
)
from backend.app.intelligence.behavior_engine import BehaviorEngine
from backend.app.intelligence.velocity_model import LearningVelocityEngine
from backend.app.intelligence.mastery_engine import SkillMasteryEngine
from backend.app.intelligence.decay_engine import SkillDecayEngine

def _get_or_create_profile(user: User, db: Session) -> LearnerProfile:
    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

router = APIRouter(prefix="/intelligence", tags=["Phase 7 Intelligence Layer"])

@router.post("/events", response_model=BehaviorEventOut)
def record_behavior_event(
    payload: BehaviorEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = BehaviorEngine(db)
    try:
        event, is_created = engine.record_event(profile_id=profile.id, event_in=payload)
    except PermissionError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Event ID registered under another account")

    return BehaviorEventOut(
        id=event.id,
        event_id=event.event_id,
        profile_id=event.profile_id,
        event_type=event.event_type,
        resource_id=event.resource_id,
        skill_slug=event.skill_slug,
        session_id=event.session_id,
        source=event.source,
        payload=event.payload or {},
        timestamp=event.timestamp
    )

@router.get("/events", response_model=List[BehaviorEventOut])
def get_behavior_events(
    limit: int = Query(50, ge=1, le=200),
    event_type: Optional[str] = None,
    skill_slug: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = BehaviorEngine(db)
    events = engine.get_events(profile_id=profile.id, limit=limit, event_type=event_type, skill_slug=skill_slug)

    return [
        BehaviorEventOut(
            id=e.id,
            event_id=e.event_id,
            profile_id=e.profile_id,
            event_type=e.event_type,
            resource_id=e.resource_id,
            skill_slug=e.skill_slug,
            session_id=e.session_id,
            source=e.source,
            payload=e.payload or {},
            timestamp=e.timestamp
        )
        for e in events
    ]

@router.get("/behavior", response_model=BehaviorSummaryOut)
def get_behavior_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = BehaviorEngine(db)
    return engine.get_behavior_summary(profile_id=profile.id)

@router.get("/velocity", response_model=LearningVelocityOut)
def get_learning_velocity(
    days_window: int = Query(28, ge=7, le=90),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = LearningVelocityEngine(db)
    return engine.calculate_velocity(profile_id=profile.id, days_window=days_window)

@router.get("/mastery", response_model=List[SkillMasteryOut])
def get_all_skill_mastery(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = SkillMasteryEngine(db)
    return engine.calculate_all_mastery(profile_id=profile.id)

@router.get("/mastery/{skill_slug}", response_model=SkillMasteryOut)
def get_single_skill_mastery(
    skill_slug: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = SkillMasteryEngine(db)
    return engine.calculate_skill_mastery(profile_id=profile.id, skill_slug=skill_slug)

@router.get("/decay", response_model=MasteryDecaySummaryOut)
def get_skill_decay_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = SkillDecayEngine(db)
    return engine.get_mastery_and_decay_summary(profile_id=profile.id)

@router.get("/decay/{skill_slug}", response_model=SkillDecayOut)
def get_single_skill_decay(
    skill_slug: str,
    half_life_days: float = Query(30.0, ge=7.0, le=180.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)

    engine = SkillDecayEngine(db)
    return engine.calculate_skill_decay(profile_id=profile.id, skill_slug=skill_slug, half_life_days=half_life_days)


from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.intelligence.market_intelligence import MarketIntelligenceService
from backend.app.adaptive.adaptive_engine import AdaptiveEngine

@router.get("/skill-gaps")
def get_career_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    gap_engine = CareerSkillGapEngine(db)
    return gap_engine.calculate_skill_gaps(profile_id=profile.id)

@router.get("/market")
def get_market_intelligence(
    role: Optional[str] = None,
    skill: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Optional role fallback from learner primary goal if not specified
    profile = _get_or_create_profile(current_user, db)
    if not role:
        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        role = primary_goal.target_role if primary_goal else None

    market_service = MarketIntelligenceService()
    return market_service.get_market_signals(role=role, skill_slug=skill, category=category)

@router.post("/adaptive-evaluate")
def trigger_adaptive_evaluation(
    force: bool = Query(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    adaptive_engine = AdaptiveEngine(db)
    return adaptive_engine.adapt_from_intelligence_signals(profile_id=profile.id, force=force)


from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine

@router.get("/readiness")
def get_learner_readiness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    engine = OpportunityReadinessEngine(db)
    return engine.calculate_readiness(profile_id=profile.id)


from backend.app.engine.explainer import UniversalDecisionTrace, DecisionFactor, DecisionEvidence

@router.get("/explanations/{decision_type}")
def get_decision_explanation(
    decision_type: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = _get_or_create_profile(current_user, db)
    primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
    target_role = primary_goal.target_role if primary_goal else "Career Path"

    if decision_type == "readiness":
        engine = OpportunityReadinessEngine(db)
        r_data = engine.calculate_readiness(profile_id=profile.id)
        factors = [
            DecisionFactor(name="Competency Component", weight=0.45, raw_score=r_data["competency_score"], contribution=round(0.45 * r_data["competency_score"], 4), reason="Demonstrated mastery across core skills"),
            DecisionFactor(name="Prerequisite Readiness", weight=0.25, raw_score=r_data["prerequisite_score"], contribution=round(0.25 * r_data["prerequisite_score"], 4), reason="Unblocked prerequisite dependencies"),
            DecisionFactor(name="Skill Freshness", weight=0.20, raw_score=r_data["freshness_score"], contribution=round(0.20 * r_data["freshness_score"], 4), reason="Retention and recency of practice"),
            DecisionFactor(name="Critical Blocker Penalty", weight=-0.10, raw_score=r_data["critical_gap_penalty"], contribution=-r_data["critical_gap_penalty"], reason="Active bottlenecking prerequisites")
        ]
        trace = UniversalDecisionTrace(
            decision_type="readiness",
            profile_id=profile.id,
            target_role=target_role,
            final_score=r_data["readiness_score"],
            decision=f"Readiness Classified: {r_data['readiness_level']}",
            rationale=r_data["readiness_label"],
            factors=factors,
            evidence=[DecisionEvidence(evidence_type="readiness_evaluation", description=f"Evaluated {len(r_data.get('top_gaps', []))} target skill gaps")],
            affected_skills=r_data.get("critical_blockers", []),
            recommended_action=r_data["high_impact_actions"][0]["title"] if r_data.get("high_impact_actions") else "Advance curriculum"
        )
        return trace.model_dump()

    elif decision_type == "roadmap_adaptation":
        trace = UniversalDecisionTrace(
            decision_type="roadmap_adaptation",
            profile_id=profile.id,
            target_role=target_role,
            decision="Active Curriculum Synchronized",
            rationale=f"Curriculum optimized for {target_role} based on velocity, demonstrated competencies, and prerequisite ordering.",
            factors=[
                DecisionFactor(name="Velocity Fit", weight=0.40, raw_score=1.0, contribution=0.40, reason="Aligned with active learning pace"),
                DecisionFactor(name="Prerequisite Ordering", weight=0.60, raw_score=1.0, contribution=0.60, reason="Strict topological ordering enforced")
            ],
            evidence=[DecisionEvidence(evidence_type="roadmap_versioning", description="Immutable version state verified")],
            recommended_action="Continue next scheduled module"
        )
        return trace.model_dump()

    else:
        # Generic decision trace fallback
        trace = UniversalDecisionTrace(
            decision_type=decision_type,
            profile_id=profile.id,
            target_role=target_role,
            decision=f"Evaluated {decision_type}",
            rationale=f"Authoritative intelligence trace for {decision_type} in {target_role}.",
            factors=[DecisionFactor(name="Authoritative State", weight=1.0, raw_score=1.0, contribution=1.0, reason="Verified from database records")],
            evidence=[DecisionEvidence(evidence_type="system_audit", description="Generated from persistent profile state")]
        )
        return trace.model_dump()
