from typing import Dict, List, Any
from backend.app.schemas.planner import WeeklyDayPlanOut, WeeklyPlanOut, PlanItemOut

class WeeklyPlanner:
    """
    Distributes allocated tasks across a 7-day cycle.
    Balances conceptual learning, hands-on coding, reviews, and checkpoints.
    """

    DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    @classmethod
    def generate_weekly_plan(
        cls,
        allocated_tasks: List[Dict[str, Any]],
        weekly_budget: float,
        overflow_hours: float,
        overflow_explanation: str
    ) -> WeeklyPlanOut:
        total_allocated_minutes = sum(t.get("estimated_minutes", 45) for t in allocated_tasks)
        total_allocated_hours = round(total_allocated_minutes / 60.0, 1)

        days_out: List[WeeklyDayPlanOut] = []
        task_count = len(allocated_tasks)

        for i, day in enumerate(cls.DAYS):
            # Assign tasks in round-robin fashion or schedule rest days
            day_tasks: List[PlanItemOut] = []
            day_minutes = 0

            # Pick 1-2 tasks per day if available
            indices = [idx for idx in range(task_count) if idx % 7 == i]
            focus_skill = "Consolidation & Rest"

            for idx in indices:
                t = allocated_tasks[idx]
                focus_skill = t.get("skill_slug", "general").capitalize()
                mins = t.get("estimated_minutes", 45)
                day_minutes += mins
                day_tasks.append(PlanItemOut(
                    title=t.get("title", f"{focus_skill} Module"),
                    skill_slug=t.get("skill_slug", "general"),
                    estimated_minutes=mins,
                    priority=t.get("priority", "Medium"),
                    category=t.get("category", "Learning"),
                    resource_id=t.get("resource_id"),
                    resource_url=t.get("resource_url"),
                    resource_title=t.get("resource_title"),
                    price_type=t.get("price_type", "GENUINELY_FREE"),
                    language=t.get("language", "English"),
                    reason=t.get("reason", "Scheduled weekly progression item")
                ))

            if not day_tasks and i in (5, 6): # Weekend default
                focus_skill = "Weekly Review & Rest"

            days_out.append(WeeklyDayPlanOut(
                day_name=day,
                focus_skill=focus_skill,
                planned_minutes=day_minutes,
                items=day_tasks
            ))

        return WeeklyPlanOut(
            week_number=1,
            weekly_hours_budget=weekly_budget,
            total_allocated_hours=total_allocated_hours,
            overflow_hours=overflow_hours,
            overflow_explanation=overflow_explanation,
            days=days_out
        )
