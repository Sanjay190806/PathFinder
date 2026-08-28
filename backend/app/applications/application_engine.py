from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.career_action import LearnerApplication
from backend.app.models.opportunity import Opportunity
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.applications import ApplicationCreate, ApplicationUpdate, ApplicationOut

class ApplicationEngine:
    def __init__(self, db: Session):
        self.db = db

    def save_or_apply(self, profile_id: str, app_in: ApplicationCreate) -> ApplicationOut:
        opp = self.db.query(Opportunity).filter(Opportunity.id == app_in.opportunity_id).first()
        if not opp:
            raise ValueError(f"Opportunity {app_in.opportunity_id} not found")

        existing = (
            self.db.query(LearnerApplication)
            .filter(
                LearnerApplication.profile_id == profile_id,
                LearnerApplication.opportunity_id == app_in.opportunity_id
            )
            .first()
        )
        if existing:
            existing.status = app_in.status
            existing.notes = app_in.notes or existing.notes
            self.db.commit()
            self.db.refresh(existing)
            return self._format_app(existing)

        # Generate default prep actions
        prep_actions = [
            {"title": f"Review core skills ({', '.join(opp.required_skills[:3])})", "completed": False},
            {"title": "Verify GitHub portfolio link in application", "completed": True},
            {"title": f"Run ATS keyword audit for {opp.company_name}", "completed": False}
        ]

        app_record = LearnerApplication(
            profile_id=profile_id,
            opportunity_id=opp.id,
            status=app_in.status,
            notes=app_in.notes or "",
            prep_actions=prep_actions
        )
        self.db.add(app_record)
        self.db.commit()
        self.db.refresh(app_record)
        return self._format_app(app_record)

    def update_application(self, profile_id: str, app_id: str, app_up: ApplicationUpdate) -> ApplicationOut:
        app_record = (
            self.db.query(LearnerApplication)
            .filter(
                LearnerApplication.id == app_id,
                LearnerApplication.profile_id == profile_id
            )
            .first()
        )
        if not app_record:
            raise ValueError(f"Application {app_id} not found")

        if app_up.status is not None:
            app_record.status = app_up.status
        if app_up.notes is not None:
            app_record.notes = app_up.notes
        if app_up.prep_actions is not None:
            app_record.prep_actions = app_up.prep_actions

        self.db.commit()
        self.db.refresh(app_record)
        return self._format_app(app_record)

    def list_applications(self, profile_id: str) -> List[ApplicationOut]:
        records = (
            self.db.query(LearnerApplication)
            .filter(LearnerApplication.profile_id == profile_id)
            .order_by(LearnerApplication.updated_at.desc())
            .all()
        )
        return [self._format_app(r) for r in records]

    def _format_app(self, app: LearnerApplication) -> ApplicationOut:
        return ApplicationOut(
            id=app.id,
            profile_id=app.profile_id,
            opportunity_id=app.opportunity_id,
            opportunity_title=app.opportunity.title if app.opportunity else "Opportunity",
            company_name=app.opportunity.company_name if app.opportunity else "Company",
            status=app.status,
            target_deadline=app.target_deadline,
            notes=app.notes or "",
            prep_actions=app.prep_actions or [],
            created_at=app.created_at,
            updated_at=app.updated_at
        )
