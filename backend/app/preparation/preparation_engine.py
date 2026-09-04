from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.preparation.preparation_scorer import PreparationScorer
from backend.app.preparation.question_engine import QuestionEngine
from backend.app.preparation.interview_engine import InterviewEngine
from backend.app.preparation.resume_intelligence import ResumeIntelligence
from backend.app.preparation.portfolio_readiness import PortfolioReadinessAuditor
from backend.app.preparation.application_readiness_engine import ApplicationReadinessEngine
from backend.app.preparation.preparation_plan import PreparationPlanEngine
from backend.app.preparation.preparation_history import PreparationHistoryTracker
from backend.app.preparation.schemas import PreparationGapItem


class PreparationEngine:
    """
    Unified Preparation Intelligence Orchestrator.
    Connects scoring, question generation, mock interview chamber, resume ATS,
    portfolio audit, opportunity requirement matrix, and historical tracking.
    """

    def __init__(self, db: Session):
        self.db = db
        self.scorer = PreparationScorer(db)
        self.question_engine = QuestionEngine(db)
        self.interview_engine = InterviewEngine(db)
        self.resume_intelligence = ResumeIntelligence(db)
        self.portfolio_auditor = PortfolioReadinessAuditor(db)
        self.application_engine = ApplicationReadinessEngine(db)
        self.plan_engine = PreparationPlanEngine(db)
        self.history_tracker = PreparationHistoryTracker(db)

    def get_readiness(
        self,
        learner_id: str,
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
        record_history: bool = True,
    ) -> Dict[str, Any]:
        result = self.scorer.calculate_preparation_score(
            learner_id=learner_id,
            career_id=career_id,
            opportunity_id=opportunity_id,
        )

        if record_history:
            gaps = self.get_gaps(learner_id, career_id, opportunity_id)
            plan = self.plan_engine.generate_preparation_plan(learner_id, career_id, opportunity_id)
            self.history_tracker.record_snapshot(
                learner_id=learner_id,
                overall_score=result["overall_score"],
                dimension_scores=result["dimension_scores"],
                identified_gaps=[g.dict() if hasattr(g, "dict") else g for g in gaps.get("critical_gaps", [])],
                recommended_actions=plan.get("plan_items", []),
                career_id=career_id,
                opportunity_id=opportunity_id,
            )

        return result

    def get_gaps(
        self,
        learner_id: str,
        career_id: Optional[str] = None,
        opportunity_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        readiness = self.scorer.calculate_preparation_score(learner_id, career_id, opportunity_id)
        dims = readiness["dimension_scores"]

        gaps_by_cat: Dict[str, List[Dict[str, Any]]] = {
            "SKILL": [],
            "PROJECT": [],
            "RESUME": [],
            "PORTFOLIO": [],
            "INTERVIEW": [],
            "BEHAVIORAL": [],
        }
        critical_gaps: List[Dict[str, Any]] = []

        # 1. Skill gaps
        if dims.get("technical_readiness", 0) < 70.0:
            gap = {
                "category": "SKILL",
                "title": "Technical Depth in Foundational Core",
                "description": "Demonstrated technical mastery is below target threshold for competitive engineering roles.",
                "severity": "CRITICAL" if dims.get("technical_readiness", 0) < 50.0 else "HIGH",
                "impact": "Reduces technical screening pass rate.",
                "remediation_action": "Complete focused learning modules and pass practical assessments in target skills.",
            }
            gaps_by_cat["SKILL"].append(gap)
            if gap["severity"] == "CRITICAL":
                critical_gaps.append(gap)

        # 2. Project gaps
        if dims.get("project_readiness", 0) < 70.0:
            gap = {
                "category": "PROJECT",
                "title": "Verified End-to-End Capstone Project",
                "description": "Lacks complex full-stack or system design project with milestone verification.",
                "severity": "HIGH",
                "impact": "Weaker technical authority during portfolio review rounds.",
                "remediation_action": "Complete a production-ready project incorporating caching, database design, and automated tests.",
            }
            gaps_by_cat["PROJECT"].append(gap)

        # 3. Resume gaps
        if dims.get("resume_ats", 0) < 70.0:
            gap = {
                "category": "RESUME",
                "title": "ATS Keyword Match & Metric Quantification",
                "description": "Resume missing key domain keywords and quantified engineering impact metrics.",
                "severity": "HIGH" if dims.get("resume_ats", 0) < 50.0 else "MEDIUM",
                "impact": "Risk of automated ATS filtering before human recruiter review.",
                "remediation_action": "Incorporate suggested ATS keywords and benchmarked metrics into resume bullet points.",
            }
            gaps_by_cat["RESUME"].append(gap)
            if gap["severity"] == "HIGH":
                critical_gaps.append(gap)

        # 4. Portfolio gaps
        if dims.get("portfolio_readiness", 0) < 70.0:
            gap = {
                "category": "PORTFOLIO",
                "title": "Live Interactive Demo & Architecture Documentation",
                "description": "Portfolio lacks deployed live URLs and detailed repository README documentation.",
                "severity": "MEDIUM",
                "impact": "Reduces recruiter and hiring manager engagement time.",
                "remediation_action": "Deploy web demo on free cloud hosting and link live application in portfolio.",
            }
            gaps_by_cat["PORTFOLIO"].append(gap)

        # 5. Interview gaps
        if dims.get("interview_readiness", 0) < 70.0:
            gap = {
                "category": "INTERVIEW",
                "title": "Tradeoff Articulation & STAR Structuring",
                "description": "Mock interview answers exhibit informal structure and limited technical depth.",
                "severity": "HIGH",
                "impact": "Sub-optimal interview score in live technical rounds.",
                "remediation_action": "Practice structured answers utilizing STAR framework and explicit operational tradeoffs.",
            }
            gaps_by_cat["INTERVIEW"].append(gap)
            critical_gaps.append(gap)

        # Total gaps count
        total = sum(len(items) for items in gaps_by_cat.values())

        return {
            "learner_id": learner_id,
            "career_id": career_id,
            "opportunity_id": opportunity_id,
            "total_gaps": total,
            "gaps_by_category": gaps_by_cat,
            "critical_gaps": critical_gaps,
        }
