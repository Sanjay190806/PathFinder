from typing import Dict, List, Any
from datetime import datetime, timezone
from backend.app.schemas.planner import MilestoneOut, MonthlyPlanOut

class MilestonePlanner:
    """
    Computes upcoming target milestone and monthly projected trajectory.
    """

    @staticmethod
    def generate_next_milestone(
        career_role: str,
        active_skill_gaps: List[str],
        velocity_score: float = 1.0
    ) -> MilestoneOut:
        first_gap = active_skill_gaps[0] if active_skill_gaps else "core-algorithms"
        first_gap_title = first_gap.replace("-", " ").capitalize()

        base_eta = 21 # 3 weeks default
        adjusted_eta = max(7, int(base_eta / max(0.5, velocity_score)))

        return MilestoneOut(
            milestone_id=f"milestone-{first_gap}",
            title=f"Master {first_gap_title} & Complete Practical Mini-Project",
            target_career=career_role,
            progress_percent=35,
            key_deliverable=f"Production-ready {first_gap_title} code repository with verified tests",
            target_eta_days=adjusted_eta,
            prerequisites_completed=True
        )

    @staticmethod
    def generate_monthly_plan(
        career_role: str,
        active_skill_gaps: List[str],
        weekly_budget: float,
        velocity_score: float = 1.0
    ) -> MonthlyPlanOut:
        projected = active_skill_gaps[:3] if active_skill_gaps else ["foundations", "core-data-structures"]
        now = datetime.now(timezone.utc)
        month_name = now.strftime("%B %Y")
        total_monthly_hours = round(weekly_budget * 4, 1)

        milestones = [
            MilestonePlanner.generate_next_milestone(career_role, active_skill_gaps, velocity_score)
        ]

        return MonthlyPlanOut(
            month_name=month_name,
            projected_skills=projected,
            milestones=milestones,
            total_study_hours=total_monthly_hours
        )
