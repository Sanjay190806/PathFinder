from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.project import ProjectTemplate, LearnerProject, LearnerProjectMilestone
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.projects import ProjectTemplateOut, LearnerProjectOut, MilestoneOut
from backend.app.projects.project_registry import CURATED_PROJECTS
from backend.app.practical.competency_engine import PracticalCompetencyEngine
from backend.app.schemas.practical import PracticalEvidenceCreate

class ProjectEngine:
    def __init__(self, db: Session):
        self.db = db
        self._ensure_templates()

    def _ensure_templates(self):
        for p in CURATED_PROJECTS:
            existing = self.db.query(ProjectTemplate).filter(ProjectTemplate.slug == p["slug"]).first()
            if not existing:
                template = ProjectTemplate(
                    slug=p["slug"],
                    title=p["title"],
                    description=p["description"],
                    career_roles=p["career_roles"],
                    difficulty=p["difficulty"],
                    project_level=p["project_level"],
                    estimated_hours=p["estimated_hours"],
                    skills=p["skills"],
                    prerequisites=p["prerequisites"],
                    deliverables=p["deliverables"],
                    tools=p["tools"],
                    portfolio_value=p["portfolio_value"],
                    is_active=True
                )
                self.db.add(template)
        self.db.commit()

    def get_projects_for_role(self, role: Optional[str] = None) -> List[ProjectTemplateOut]:
        query = self.db.query(ProjectTemplate).filter(ProjectTemplate.is_active == True)
        templates = query.all()
        if role:
            templates = [t for t in templates if any(role.lower() in str(r).lower() for r in t.career_roles)]

        return [
            ProjectTemplateOut(
                id=t.id,
                slug=t.slug,
                title=t.title,
                description=t.description,
                career_roles=t.career_roles or [],
                difficulty=t.difficulty,
                project_level=t.project_level,
                estimated_hours=t.estimated_hours,
                skills=t.skills or [],
                prerequisites=t.prerequisites or [],
                deliverables=t.deliverables or [],
                tools=t.tools or [],
                portfolio_value=t.portfolio_value
            )
            for t in templates
        ]

    def start_project(self, profile_id: str, template_id: str) -> LearnerProjectOut:
        template = self.db.query(ProjectTemplate).filter(ProjectTemplate.id == template_id).first()
        if not template:
            raise ValueError(f"Project template {template_id} not found")

        existing = (
            self.db.query(LearnerProject)
            .filter(
                LearnerProject.profile_id == profile_id,
                LearnerProject.project_template_id == template_id
            )
            .first()
        )
        if existing:
            return self._format_learner_project(existing)

        # Create learner project
        learner_proj = LearnerProject(
            profile_id=profile_id,
            project_template_id=template.id,
            status="in_progress",
            started_at=datetime.now(timezone.utc),
            score=0.0
        )
        self.db.add(learner_proj)
        self.db.flush()

        # Seed milestones from curated template definition
        curated_def = next((p for p in CURATED_PROJECTS if p["slug"] == template.slug), None)
        milestones = curated_def["milestones"] if curated_def else [("Milestone 1", "Implementation")]
        for idx, (m_title, m_desc) in enumerate(milestones, start=1):
            m_record = LearnerProjectMilestone(
                learner_project_id=learner_proj.id,
                milestone_number=idx,
                title=m_title,
                description=m_desc,
                status="pending"
            )
            self.db.add(m_record)

        self.db.commit()
        self.db.refresh(learner_proj)
        return self._format_learner_project(learner_proj)

    def complete_milestone(
        self,
        profile_id: str,
        learner_project_id: str,
        milestone_id: str,
        artifact: str
    ) -> LearnerProjectOut:
        learner_proj = (
            self.db.query(LearnerProject)
            .filter(
                LearnerProject.id == learner_project_id,
                LearnerProject.profile_id == profile_id
            )
            .first()
        )
        if not learner_proj:
            raise ValueError("Learner project not found")

        milestone = (
            self.db.query(LearnerProjectMilestone)
            .filter(
                LearnerProjectMilestone.id == milestone_id,
                LearnerProjectMilestone.learner_project_id == learner_proj.id
            )
            .first()
        )
        if not milestone:
            raise ValueError("Milestone not found")

        milestone.status = "completed"
        milestone.submission_artifact = artifact
        milestone.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(learner_proj)
        return self._format_learner_project(learner_proj)

    def submit_project(
        self,
        profile_id: str,
        learner_project_id: str,
        submission_url: str
    ) -> LearnerProjectOut:
        learner_proj = (
            self.db.query(LearnerProject)
            .filter(
                LearnerProject.id == learner_project_id,
                LearnerProject.profile_id == profile_id
            )
            .first()
        )
        if not learner_proj:
            raise ValueError("Learner project not found")

        # Evaluate project: score based on milestone completion and artifact submission
        total_m = len(learner_proj.milestones)
        completed_m = sum(1 for m in learner_proj.milestones if m.status == "completed")
        completion_ratio = (completed_m / max(1, total_m))
        final_score = round(0.70 * completion_ratio + 0.30 * (1.0 if submission_url else 0.0), 2)

        learner_proj.status = "completed" if final_score >= 0.70 else "submitted"
        learner_proj.completed_at = datetime.now(timezone.utc) if final_score >= 0.70 else None
        learner_proj.score = final_score
        learner_proj.evaluation_feedback = f"Verified completion with {completed_m}/{total_m} milestones and submitted artifact."
        learner_proj.submission_metadata = {"submission_url": submission_url}
        self.db.flush()

        # Emit practical evidence for each project skill
        if final_score >= 0.70:
            comp_engine = PracticalCompetencyEngine(self.db)
            for skill in learner_proj.template.skills or []:
                comp_engine.record_evidence(
                    profile_id=profile_id,
                    evidence_in=PracticalEvidenceCreate(
                        skill_slug=skill,
                        evidence_type="project",
                        source_id=learner_proj.id,
                        score=final_score,
                        confidence=0.90,
                        evaluator="project_engine",
                        metadata_payload={"project_slug": learner_proj.template.slug, "score": final_score}
                    )
                )

        self.db.commit()
        self.db.refresh(learner_proj)
        return self._format_learner_project(learner_proj)

    def _format_learner_project(self, lp: LearnerProject) -> LearnerProjectOut:
        return LearnerProjectOut(
            id=lp.id,
            profile_id=lp.profile_id,
            project_template_id=lp.project_template_id,
            title=lp.template.title if lp.template else "Project",
            status=lp.status,
            current_milestone_index=lp.current_milestone_index,
            started_at=lp.started_at,
            completed_at=lp.completed_at,
            score=lp.score,
            evaluation_feedback=lp.evaluation_feedback or "",
            milestones=[
                MilestoneOut(
                    id=m.id,
                    milestone_number=m.milestone_number,
                    title=m.title,
                    description=m.description,
                    status=m.status,
                    submission_artifact=m.submission_artifact or "",
                    completed_at=m.completed_at
                )
                for m in sorted(lp.milestones, key=lambda x: x.milestone_number)
            ]
        )
