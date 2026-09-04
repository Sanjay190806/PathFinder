from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.learning_path import LearningPath
from backend.app.preparation.preparation_scorer import PreparationScorer


class PreparationPlanEngine:
    """
    Transforms preparation gaps and readiness assessments into structured,
    actionable daily/weekly learning tasks integrated with Stage 7 planner.
    """

    def __init__(self, db: Session):
        self.db = db
        self.scorer = PreparationScorer(db)

    def generate_preparation_plan(
        self,
        learner_id: str,
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        score_data = self.scorer.calculate_preparation_score(
            learner_id=learner_id,
            career_id=career_id,
            opportunity_id=opportunity_id,
        )
        dims = score_data["dimension_scores"]

        tasks = []
        task_id = 1

        # 1. Resume task if ATS score < 70
        if dims.get("resume_ats", 0) < 70.0:
            tasks.append({
                "id": f"prep-task-{task_id}",
                "category": "RESUME",
                "priority": "HIGH",
                "title": "Optimize Resume ATS Keyword Density",
                "description": "Integrate verified project technical keywords and quantify performance metrics (latency, throughput).",
                "estimated_hours": 3,
                "target_dimension": "resume_ats",
                "status": "PENDING",
            })
            task_id += 1

        # 2. Portfolio task if score < 70
        if dims.get("portfolio_readiness", 0) < 70.0:
            tasks.append({
                "id": f"prep-task-{task_id}",
                "category": "PORTFOLIO",
                "priority": "HIGH",
                "title": "Deploy Live Demo & Update Architecture README",
                "description": "Deploy capstone project on cloud infrastructure and link live demo in portfolio.",
                "estimated_hours": 6,
                "target_dimension": "portfolio_readiness",
                "status": "PENDING",
            })
            task_id += 1

        # 3. Technical & practical tasks
        if dims.get("technical_readiness", 0) < 75.0 or dims.get("practical_competency", 0) < 70.0:
            tasks.append({
                "id": f"prep-task-{task_id}",
                "category": "PRACTICAL_SKILL",
                "priority": "CRITICAL",
                "title": "Complete Practical System Design Scenario",
                "description": "Tackle an engineering simulation lab focusing on caching, database indexing, and fault tolerance.",
                "estimated_hours": 8,
                "target_dimension": "practical_competency",
                "status": "PENDING",
            })
            task_id += 1

        # 4. Mock interview tasks
        if dims.get("interview_readiness", 0) < 75.0:
            tasks.append({
                "id": f"prep-task-{task_id}",
                "category": "INTERVIEW",
                "priority": "MEDIUM",
                "title": "Complete 2 Adaptive Mock Interview Sessions",
                "description": "Practice answering technical tradeoff and behavioral STAR questions with real-time feedback.",
                "estimated_hours": 4,
                "target_dimension": "interview_readiness",
                "status": "PENDING",
            })
            task_id += 1

        # Always have at least 2 structured tasks
        if len(tasks) < 2:
            tasks.append({
                "id": f"prep-task-{task_id}",
                "category": "APPLICATION",
                "priority": "MEDIUM",
                "title": "Review Opportunity-Specific Requirement Matrix",
                "description": "Verify that all job requirements have matching evidence before submitting target applications.",
                "estimated_hours": 2,
                "target_dimension": "opportunity_specific",
                "status": "PENDING",
            })

        total_hours = sum(t["estimated_hours"] for t in tasks)
        # Assume 2 hours of study/prep per day
        estimated_days = max(3, round(total_hours / 2.0))

        # Find primary focus area
        lowest_dim = min(dims.items(), key=lambda x: x[1])
        priority_focus = f"Remediate {lowest_dim[0].replace('_', ' ').title()} (Current: {lowest_dim[1]}%)"

        return {
            "plan_items": tasks,
            "estimated_days_to_ready": estimated_days,
            "priority_focus": priority_focus,
        }
