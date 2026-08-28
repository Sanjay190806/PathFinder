from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.progress import Progress
from backend.app.models.resource import LearningResource
from backend.app.models.skill import Skill
from backend.app.ai.provider import GroundedContext
from backend.app.ai.intent_detector import IntentDetector
from backend.app.ai.config import AI_MAX_CONTEXT_ITEMS, AI_MAX_HISTORY_MESSAGES
from backend.app.intelligence.velocity_model import LearningVelocityEngine
from backend.app.intelligence.readiness_engine import OpportunityReadinessEngine
from backend.app.intelligence.market_intelligence import MarketIntelligenceService
from backend.app.intelligence.decay_engine import SkillDecayEngine

class ContextBuilder:
    def __init__(self, db: Session):
        self.db = db

    def build_context(
        self,
        profile: LearnerProfile,
        goal: Goal,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> GroundedContext:
        """
        Constructs bounded, privacy-safe, grounded context for AI reasoning.
        """
        # 1. Learner Skills & Gaps
        conf_map = dict(profile.skill_confidence_map or {})
        skills_summary = []
        for slug, conf in list(conf_map.items())[:AI_MAX_CONTEXT_ITEMS]:
            status = "mastered" if conf >= 0.75 else "proficient" if conf >= 0.50 else "learning" if conf >= 0.25 else "novice"
            skills_summary.append({
                "slug": slug,
                "confidence": round(conf, 2),
                "status": status
            })

        target_skills = goal.target_skills or []
        gaps = [s for s in target_skills if conf_map.get(s, 0.0) < 0.60]

        # 2. Active Roadmap State
        active_path = (
            self.db.query(LearningPath)
            .filter(LearningPath.profile_id == profile.id, LearningPath.is_active == True)
            .first()
        )
        if not active_path:
            from backend.app.engine.adaptive import generate_or_adapt_roadmap
            active_path, _, _ = generate_or_adapt_roadmap(
                profile=profile,
                goal=goal,
                trigger="ai_context_initialization",
                change_reason="Initial curriculum generated for AI coaching.",
                db=self.db
            )

        current_items = []
        rec_explanations = []
        active_phase = "Phase 1: Strengthen Foundations"

        if active_path:
            active_version = (
                self.db.query(LearningPathVersion)
                .filter(
                    LearningPathVersion.learning_path_id == active_path.id,
                    LearningPathVersion.is_active == True
                )
                .first()
            )
            if active_version and active_version.items:
                sorted_items = sorted(active_version.items, key=lambda it: it.sequence_order)
                for it in sorted_items[:AI_MAX_CONTEXT_ITEMS]:
                    current_items.append({
                        "resource_id": it.resource_id,
                        "title": it.resource.title if it.resource else "Untitled",
                        "provider": it.resource.provider if it.resource else "Unknown",
                        "phase_number": it.phase_number,
                        "phase_name": it.phase_name,
                        "sequence_order": it.sequence_order,
                        "difficulty": it.resource.difficulty if it.resource else "Beginner",
                        "is_completed": it.is_completed,
                        "is_locked": it.is_locked
                    })
                    if it.explanation:
                        rec_explanations.append({
                            "resource_title": it.resource.title if it.resource else "",
                            "composite_score": it.explanation.composite_score,
                            "explanation": it.explanation.human_readable_explanation
                        })
                if sorted_items:
                    active_phase = f"Phase {sorted_items[0].phase_number}: {sorted_items[0].phase_name}"

        # 3. Completed Progress
        completed_records = (
            self.db.query(Progress)
            .filter(Progress.profile_id == profile.id, Progress.status == "completed")
            .limit(AI_MAX_CONTEXT_ITEMS)
            .all()
        )
        completed_titles = [p.resource.title for p in completed_records if p.resource]

        # 4. Catalog Sample (Bounded)
        catalog_sample_objs = (
            self.db.query(LearningResource)
            .filter(LearningResource.status == "active")
            .limit(6)
            .all()
        )
        catalog_sample = [
            {"id": r.id, "title": r.title, "difficulty": r.difficulty, "provider": r.provider}
            for r in catalog_sample_objs
        ]

        # 5. Intent Detection
        intent = IntentDetector.detect_intent(query)

        # 6. Extended Intelligence (Readiness, Velocity, Decay, Market)
        velocity_engine = LearningVelocityEngine(self.db)
        vel = velocity_engine.calculate_velocity(profile_id=profile.id)

        readiness_engine = OpportunityReadinessEngine(self.db)
        readiness_data = readiness_engine.calculate_readiness(profile_id=profile.id)

        decay_engine = SkillDecayEngine(self.db)
        decay_summary = decay_engine.get_mastery_and_decay_summary(profile_id=profile.id)
        decay_alerts = [d.skill_slug for d in decay_summary.decay if d.decay_state in ("Review Recommended", "Decay Risk")]

        market_service = MarketIntelligenceService()
        market_res = market_service.get_market_signals(role=goal.target_role)

        # 7. Bounded Conversation History
        history = (conversation_history or [])[-AI_MAX_HISTORY_MESSAGES:]

        return GroundedContext(
            learner_id=profile.id,
            learner_name=profile.user.full_name if profile.user else "Learner",
            target_role=goal.target_role,
            weekly_hours=profile.weekly_hours or 10,
            difficulty_tolerance=float(profile.difficulty_tolerance or 0.50),
            skills=skills_summary,
            skill_gaps=gaps,
            active_phase=active_phase,
            current_roadmap_items=current_items,
            completed_items=completed_titles,
            recommendation_explanations=rec_explanations,
            catalog_sample=catalog_sample,
            user_query=query,
            intent=intent,
            conversation_history=history,
            velocity_score=vel.velocity_score,
            pacing_state=vel.pacing_state,
            readiness_score=readiness_data["readiness_score"],
            readiness_level=readiness_data["readiness_level"],
            critical_blockers=readiness_data["critical_blockers"],
            decay_alerts=decay_alerts,
            market_signals=market_res["signals"][:4]
        )
