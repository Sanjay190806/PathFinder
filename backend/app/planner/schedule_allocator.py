from typing import Dict, List, Any, Tuple

class ScheduleAllocator:
    """
    Deterministic time and workload budget allocator.
    Aligns study demands with the learner's committed weekly hours and handles overflow gracefully.
    """

    @staticmethod
    def allocate_workload(
        weekly_hours_budget: float,
        candidate_tasks: List[Dict[str, Any]]
    ) -> Tuple[List[Dict[str, Any]], float, str]:
        """
        Sorts candidate tasks by priority: Critical -> High -> Medium -> Low.
        Packs tasks into the budget.
        Returns: (allocated_tasks, overflow_hours, overflow_explanation)
        """
        priority_weight = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
        sorted_tasks = sorted(
            candidate_tasks,
            key=lambda t: priority_weight.get(t.get("priority", "Low"), 1),
            reverse=True
        )

        max_minutes = int(weekly_hours_budget * 60)
        allocated: List[Dict[str, Any]] = []
        current_minutes = 0
        deferred_minutes = 0

        for task in sorted_tasks:
            mins = task.get("estimated_minutes", 45)
            if current_minutes + mins <= max_minutes:
                allocated.append(task)
                current_minutes += mins
            else:
                deferred_minutes += mins

        overflow_hours = round(deferred_minutes / 60.0, 1)
        if overflow_hours > 0:
            overflow_explanation = (
                f"Your planned roadmap tasks required {round((current_minutes + deferred_minutes)/60.0, 1)} hours, "
                f"exceeding your declared {weekly_hours_budget} weekly study hours. "
                f"{overflow_hours} hours of lower-priority activities have been deferred to ensure steady retention without burnout."
            )
        else:
            overflow_explanation = f"All planned learning tasks fit comfortably within your {weekly_hours_budget}-hour weekly commitment."

        return allocated, overflow_hours, overflow_explanation
