from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.opportunity import Opportunity
from backend.app.models.profile import LearnerProfile
from backend.app.models.user import User
from backend.app.models.career_action import LearnerApplication
from backend.app.models.practical_competency import PracticalEvidenceRecord
from backend.app.models.project import LearnerProject
from backend.app.intelligence.gap_engine import CareerSkillGapEngine
from backend.app.preparation.question_engine import QuestionEngine


APPLICATION_STATES = [
    "DISCOVERY",
    "PREPARING",
    "READY_TO_APPLY",
    "APPLIED",
    "INTERVIEWING",
    "REJECTED",
    "OFFER",
]


class ApplicationReadinessEngine:
    """
    Evaluates opportunity-specific application readiness, generates
    requirement-to-evidence matrix, and manages lifecycle transitions.
    """

    def __init__(self, db: Session):
        self.db = db
        self.gap_engine = CareerSkillGapEngine(db)
        self.question_engine = QuestionEngine(db)

    def evaluate_opportunity_prep(
        self,
        learner_id: str,
        opportunity_id: str,
    ) -> Dict[str, Any]:
        opp = self.db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
        if not opp:
            raise ValueError(f"Opportunity {opportunity_id} not found")

        profile = self.db.query(LearnerProfile).filter(LearnerProfile.user_id == learner_id).first()
        profile_id = profile.id if profile else learner_id

        # Existing application record if any
        existing_app = (
            self.db.query(LearnerApplication)
            .filter(
                LearnerApplication.profile_id == profile_id,
                LearnerApplication.opportunity_id == opportunity_id,
            )
            .first()
        )

        required_skills = opp.required_skills or ["Python", "Problem Solving", "System Design"]

        # Gather learner evidence
        evidence_records = (
            self.db.query(PracticalEvidenceRecord)
            .filter(PracticalEvidenceRecord.profile_id == profile_id)
            .all()
        )
        evidence_slugs = {e.skill_slug.lower(): e for e in evidence_records}

        projects = (
            self.db.query(LearnerProject)
            .filter(LearnerProject.profile_id == profile_id)
            .all()
        )

        gaps_data = {}
        try:
            if profile:
                gaps_data = self.gap_engine.calculate_skill_gaps(profile_id=profile.id)
        except Exception:
            pass
        gap_slugs = {g.get("skill_slug", "").lower() for g in gaps_data.get("gaps", [])}

        matrix = []
        met_count = 0
        for req in required_skills:
            req_lower = req.lower()
            if req_lower in evidence_slugs:
                status = "MET"
                met_count += 1
                source = f"Verified Practical Evidence ({evidence_slugs[req_lower].evidence_type})"
            elif any(req_lower in p.title.lower() for p in projects):
                status = "MET"
                met_count += 1
                source = "Demonstrated in Learner Project"
            elif req_lower in gap_slugs:
                status = "MISSING"
                source = "Active Skill Gap detected in profile"
            else:
                status = "PARTIAL"
                met_count += 0.5
                source = "Foundational familiarity established"

            matrix.append({
                "requirement": req,
                "status": status,
                "evidence_found": status != "MISSING",
                "source": source,
            })

        readiness_pct = (met_count / max(1, len(required_skills))) * 100.0

        # Determine application state
        if existing_app and existing_app.status:
            current_state = existing_app.status.upper()
        else:
            if readiness_pct >= 75.0:
                current_state = "READY_TO_APPLY"
            elif readiness_pct >= 40.0:
                current_state = "PREPARING"
            else:
                current_state = "DISCOVERY"

        # Company prep brief
        company_name = opp.company_name or "Target Enterprise"
        company_prep_brief = {
            "company_name": company_name,
            "domain": getattr(opp, "role_category", None) or getattr(opp, "role_domain", "Technology"),
            "work_mode": getattr(opp, "work_mode", "Hybrid / Bangalore, IN"),
            "engineering_focus": f"Building scalable systems with strong emphasis on {', '.join(required_skills[:3])}.",
            "interview_rounds": [
                {"round": 1, "name": "Online Technical Screening & DSA", "focus": "Problem solving & time complexity"},
                {"round": 2, "name": "Deep Dive Systems & Architecture", "focus": "Scalability, caching, DB design"},
                {"round": 3, "name": "Hiring Manager & Culture Alignment", "focus": "Ownership, conflict resolution, India market context"},
            ],
            "key_values": ["High Ownership", "Rigorous Engineering", "Customer Empathy", "Frugality"],
        }

        # Tailored resume tips
        tailored_resume_tips = [
            f"Explicitly highlight experience with {', '.join(required_skills[:3])} in your headline and top 2 project bullets.",
            f"Quantify outcomes relevant to {company_name}'s scale (e.g. TPS throughput, API response time).",
            "Attach live demo links directly under the primary project section.",
        ]

        # Targeted interview questions
        targeted_questions = self.question_engine.generate_questions(
            learner_id=learner_id,
            category="TECHNICAL",
            opportunity_id=opportunity_id,
            count=3,
        ).get("questions", [])

        return {
            "opportunity_id": opportunity_id,
            "title": opp.title,
            "company": company_name,
            "application_state": current_state,
            "requirement_evidence_matrix": matrix,
            "company_prep_brief": company_prep_brief,
            "tailored_resume_tips": tailored_resume_tips,
            "targeted_interview_questions": targeted_questions,
        }
