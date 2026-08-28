from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.career_action import ResumeAudit, MockInterviewSession
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.career_prep import (
    ResumeAuditRequest,
    ResumeAuditOut,
    MockInterviewRequest,
    MockInterviewSessionOut
)

class CareerPrepEngine:
    def __init__(self, db: Session):
        self.db = db

    def audit_resume(self, profile_id: str, req: ResumeAuditRequest) -> ResumeAuditOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile and profile.goals else None)
        target_role = req.target_role or (primary_goal.target_role if primary_goal else "Software Engineer")

        text = req.resume_text.lower()
        role_keywords = {
            "ai/ml engineer": ["pytorch", "transformers", "deep learning", "python", "docker", "mlops", "vector", "rag", "cuda"],
            "cybersecurity analyst": ["networking", "linux", "web security", "wireshark", "pcap", "siem", "incident response", "firewall"],
            "data scientist": ["python", "sql", "pandas", "machine learning", "statistics", "eda", "visualization"],
            "vlsi hardware engineer": ["verilog", "systemverilog", "linear algebra", "fpga", "synthesis", "rtl", "timing"],
            "full stack developer": ["typescript", "react", "next.js", "docker", "rest api", "sql", "tailwind", "node.js"]
        }

        kws = role_keywords.get(target_role.lower(), ["python", "dsa", "rest api", "docker", "git", "system design"])
        matched = [k for k in kws if k in text]
        missing = [k for k in kws if k not in text]

        ats_score = round((len(matched) / max(1, len(kws))) * 100.0, 1)

        improvements = []
        if missing:
            improvements.append(f"Add explicit technical impact statements mentioning keywords: {', '.join(missing[:3])}.")
        if "quantified" not in text and "%" not in text:
            improvements.append("Quantify business and engineering outcomes using metrics (e.g. 'reduced P99 latency by 35%').")
        if len(text.split()) < 150:
            improvements.append("Expand project bullet points to detail architectural tradeoffs and verified deliverables.")

        audit = ResumeAudit(
            profile_id=profile_id,
            target_role=target_role,
            ats_score=ats_score,
            keyword_coverage={"matched_ratio": len(matched) / max(1, len(kws))},
            missing_keywords=missing,
            bullet_improvements=improvements
        )
        self.db.add(audit)
        self.db.commit()
        self.db.refresh(audit)

        return ResumeAuditOut(
            id=audit.id,
            target_role=audit.target_role,
            ats_score=audit.ats_score,
            keyword_coverage=audit.keyword_coverage or {},
            matched_keywords=matched,
            missing_keywords=missing,
            bullet_improvements=improvements,
            created_at=audit.created_at
        )

    def start_mock_interview(self, profile_id: str, req: MockInterviewRequest) -> MockInterviewSessionOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile and profile.goals else None)
        target_role = req.target_role or (primary_goal.target_role if primary_goal else "Software Engineer")

        questions = [
            {
                "index": 1,
                "question": f"In your role as a {target_role}, how do you evaluate architectural tradeoffs under strict latency and memory constraints?",
                "rubric": "Evaluates tradeoff reasoning, metric awareness, and structured explanation."
            },
            {
                "index": 2,
                "question": "Describe a production failure or debugging bottleneck you investigated. What was your root-cause diagnosis strategy?",
                "rubric": "Evaluates structured debugging methodology and incident containment."
            }
        ]

        session = MockInterviewSession(
            profile_id=profile_id,
            target_role=target_role,
            interview_type=req.interview_type,
            question_transcript=questions,
            overall_score=85.0,
            feedback=f"Interview simulation initialized for {target_role} ({req.interview_type}). Ready for structured responses."
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)

        return MockInterviewSessionOut(
            id=session.id,
            target_role=session.target_role,
            interview_type=session.interview_type,
            questions=questions,
            overall_score=session.overall_score,
            feedback=session.feedback,
            completed_at=session.completed_at
        )
