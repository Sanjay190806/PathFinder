from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from backend.app.schemas.planner import PlanItemOut, DailyPlanOut

class DailyPlanner:
    """
    Synthesizes today's immediate tactical learning plan.
    Selects 2-3 focused items + decay reviews with verified resources.
    """

    @staticmethod
    def generate_today_plan(
        allocated_tasks: List[Dict[str, Any]],
        learner_name: str
    ) -> DailyPlanOut:
        now = datetime.now(timezone.utc)
        date_str = now.strftime("%Y-%m-%d")
        day_str = now.strftime("%A")

        # Pick top 2-3 tasks for today
        today_tasks = allocated_tasks[:3] if allocated_tasks else []
        items_out: List[PlanItemOut] = []
        total_mins = 0
        decay_count = 0

        for t in today_tasks:
            total_mins += t.get("estimated_minutes", 45)
            if t.get("category") == "Review":
                decay_count += 1

            items_out.append(PlanItemOut(
                title=t.get("title", "Foundational Exercise"),
                skill_slug=t.get("skill_slug", "python"),
                estimated_minutes=t.get("estimated_minutes", 45),
                priority=t.get("priority", "High"),
                category=t.get("category", "Learning"),
                resource_id=t.get("resource_id"),
                resource_url=t.get("resource_url"),
                resource_title=t.get("resource_title"),
                price_type=t.get("price_type", "GENUINELY_FREE"),
                language=t.get("language", "English"),
                reason=t.get("reason", "Top priority learning item for today")
            ))

        hrs = total_mins // 60
        mins = total_mins % 60
        time_str = f"{hrs}h {mins}m" if hrs > 0 else f"{mins}m"

        summary = (
            f"Hello {learner_name}! Today's focus includes {len(items_out)} tasks totaling {time_str}. "
            f"Completing these directly drives progress toward your target role."
        )

        return DailyPlanOut(
            date=date_str,
            day_of_week=day_str,
            total_planned_minutes=total_mins,
            items=items_out,
            decay_reviews_count=decay_count,
            summary=summary
        )
