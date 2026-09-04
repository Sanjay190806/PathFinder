from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.planner import LearnerPlan
from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.intelligence.decay_engine import SkillDecayEngine
from backend.app.resources.resource_discovery_engine import ResourceDiscoveryEngine
from backend.app.planner.priority_engine import PriorityEngine
from backend.app.planner.schedule_allocator import ScheduleAllocator
from backend.app.planner.daily_planner import DailyPlanner
from backend.app.planner.weekly_planner import WeeklyPlanner
from backend.app.planner.milestone_planner import MilestonePlanner
from backend.app.schemas.planner import (
    FullPlannerResponse, DailyPlanOut, WeeklyPlanOut, MilestoneOut, MonthlyPlanOut, PlanHistoryOut
)

class PlannerEngine:
    """
    Principal orchestrator for Phase 9 Stage 7 Personalized Learning Planning.
    Integrates verified resources, skill gaps, decay, velocity, and time allocation.
    """

    def __init__(self, db: Session):
        self.db = db

    def generate_plan(
        self,
        profile_id: str,
        reason: str = "Automated tactical schedule calculation",
        force_recalculate: bool = False
    ) -> FullPlannerResponse:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Learner profile '{profile_id}' not found.")

        # Check existing active plan
        existing_plan = (
            self.db.query(LearnerPlan)
            .filter(LearnerPlan.profile_id == profile_id)
            .order_by(LearnerPlan.plan_version.desc())
            .first()
        )

        if existing_plan and not force_recalculate:
            return FullPlannerResponse(
                plan_version=existing_plan.plan_version,
                today=DailyPlanOut(**existing_plan.daily_plan),
                weekly=WeeklyPlanOut(**existing_plan.weekly_plan),
                next_milestone=MilestoneOut(**existing_plan.milestone_plan),
                monthly=MonthlyPlanOut(**existing_plan.monthly_plan) if existing_plan.monthly_plan else MilestonePlanner.generate_monthly_plan("Software Engineer", [], 10.0),
                why_this_order=existing_plan.source_signals.get("why_this_order", [])
            )

        # 1. Target Role & Goals
        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Software Engineer"

        # 2. Identify Skill Gaps
        gap_engine = CareerSkillGapEngine(self.db)
        gap_report = gap_engine.calculate_skill_gaps(profile_id=profile_id)
        active_gaps = [g["skill_slug"] for g in gap_report.get("gaps", [])]
        if not active_gaps:
            active_gaps = ["python", "sql", "git"]

        # 3. Check for Decaying Skills
        decay_engine = SkillDecayEngine(self.db)
        decaying_skills = []
        for s_slug in ("python", "sql", "linear-algebra", "statistics"):
            try:
                decay_res = decay_engine.calculate_skill_decay(profile_id, s_slug)
                if decay_res.get("freshness_state") in ("Aging", "Stale"):
                    decaying_skills.append(s_slug)
            except Exception:
                pass

        # 4. Discover Verified Resources Matching Preferences
        res_engine = ResourceDiscoveryEngine(self.db)
        discovered_resources = res_engine.discover_resources(
            career_slug=target_role.lower().replace(" ", "-"),
            language=profile.preferred_language or "English",
            learner_profile=profile
        )

        # 5. Assemble Candidate Tasks
        candidate_tasks: List[Dict[str, Any]] = []

        # Add decay reviews if any
        for d_slug in decaying_skills:
            candidate_tasks.append({
                "title": f"{d_slug.capitalize()} Retention Review",
                "skill_slug": d_slug,
                "estimated_minutes": 30,
                "priority": "Critical",
                "category": "Review",
                "resource_id": None,
                "resource_url": None,
                "resource_title": f"{d_slug.capitalize()} Quick Revision",
                "price_type": "GENUINELY_FREE",
                "language": profile.preferred_language or "English",
                "reason": PriorityEngine.generate_priority_reason(d_slug, "Critical", False, True, False, target_role)
            })

        # Add primary skill gap tasks with attached verified resources
        for gap_slug in active_gaps[:4]:
            matched_res = next((r for r in discovered_resources if gap_slug.lower() in [s.lower() for s in r.skills]), None)
            res_id = matched_res.id if matched_res else None
            res_url = matched_res.url if matched_res else None
            res_title = matched_res.title if matched_res else f"Foundational {gap_slug.capitalize()}"
            p_type = matched_res.price_type if matched_res else "GENUINELY_FREE"
            lang = matched_res.language if matched_res else (profile.preferred_language or "English")

            priority = PriorityEngine.calculate_task_priority(
                skill_slug=gap_slug,
                is_prerequisite_blocker=(gap_slug in ("python", "digital-logic")),
                is_decaying=False,
                is_critical_gap=True,
                career_relevance_score=0.95
            )

            candidate_tasks.append({
                "title": f"Master {gap_slug.capitalize()}: {res_title}",
                "skill_slug": gap_slug,
                "estimated_minutes": 45,
                "priority": priority,
                "category": "Learning",
                "resource_id": res_id,
                "resource_url": res_url,
                "resource_title": res_title,
                "price_type": p_type,
                "language": lang,
                "reason": PriorityEngine.generate_priority_reason(gap_slug, priority, (gap_slug in ("python", "digital-logic")), False, True, target_role)
            })

        # Add hands-on project task
        candidate_tasks.append({
            "title": f"{target_role} Practical Portfolio Milestone",
            "skill_slug": active_gaps[0] if active_gaps else "python",
            "estimated_minutes": 90,
            "priority": "High",
            "category": "Project",
            "resource_id": None,
            "resource_url": None,
            "resource_title": "End-to-end Mini Project",
            "price_type": "GENUINELY_FREE",
            "language": profile.preferred_language or "English",
            "reason": f"Synthesize theoretical concepts into verified practical portfolio evidence for {target_role}."
        })

        # 6. Allocate Schedule with Weekly Budget & Overflow
        weekly_budget = float(profile.weekly_hours or 10.0)
        allocated_tasks, overflow_hours, overflow_exp = ScheduleAllocator.allocate_workload(
            weekly_hours_budget=weekly_budget,
            candidate_tasks=candidate_tasks
        )

        # 7. Synthesize Sub-Plans
        today_plan = DailyPlanner.generate_today_plan(
            allocated_tasks=allocated_tasks,
            learner_name=profile.user.full_name if profile.user and profile.user.full_name else "Learner"
        )

        weekly_plan = WeeklyPlanner.generate_weekly_plan(
            allocated_tasks=allocated_tasks,
            weekly_budget=weekly_budget,
            overflow_hours=overflow_hours,
            overflow_explanation=overflow_exp
        )

        velocity = float(profile.velocity_score or 1.0)
        next_milestone = MilestonePlanner.generate_next_milestone(
            career_role=target_role,
            active_skill_gaps=active_gaps,
            velocity_score=velocity
        )

        monthly_plan = MilestonePlanner.generate_monthly_plan(
            career_role=target_role,
            active_skill_gaps=active_gaps,
            weekly_budget=weekly_budget,
            velocity_score=velocity
        )

        # 8. Explainability
        why_this_order = [
            f"Mandatory foundational skill '{active_gaps[0]}' scheduled first to satisfy downstream prerequisites.",
            f"Prioritized verified resources matching your preferred language: {profile.preferred_language or 'English'}.",
            f"Workload calibrated strictly to your declared {weekly_budget} hours/week commitment.",
            "Included proactive retention reviews for decaying competencies to safeguard mastery."
        ]

        # 9. Persist Versioned Plan
        next_ver = (existing_plan.plan_version + 1) if existing_plan else 1
        new_plan = LearnerPlan(
            profile_id=profile_id,
            plan_version=next_ver,
            daily_plan=today_plan.model_dump(),
            weekly_plan=weekly_plan.model_dump(),
            monthly_plan=monthly_plan.model_dump(),
            milestone_plan=next_milestone.model_dump(),
            overflow_hours=overflow_hours,
            reason=reason,
            source_signals={"why_this_order": why_this_order}
        )
        self.db.add(new_plan)
        self.db.commit()

        return FullPlannerResponse(
            plan_version=next_ver,
            today=today_plan,
            weekly=weekly_plan,
            next_milestone=next_milestone,
            monthly=monthly_plan,
            why_this_order=why_this_order
        )

    def get_plan_history(self, profile_id: str) -> List[PlanHistoryOut]:
        plans = (
            self.db.query(LearnerPlan)
            .filter(LearnerPlan.profile_id == profile_id)
            .order_by(LearnerPlan.plan_version.desc())
            .all()
        )
        return [
            PlanHistoryOut(
                plan_version=p.plan_version,
                created_at=p.created_at,
                reason=p.reason or "Schedule update",
                overflow_hours=float(p.overflow_hours or 0.0)
            )
            for p in plans
        ]
