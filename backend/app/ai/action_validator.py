from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.resource import LearningResource
from backend.app.models.profile import LearnerProfile
from backend.app.ai.provider import ActionProposal
from backend.app.ai.config import ALLOWED_ACTION_TYPES
from backend.app.engine.skill_graph import SkillDAG

class ActionValidator:
    def __init__(self, db: Session):
        self.db = db
        self.skill_dag = SkillDAG(db)

    def validate_action(
        self,
        proposal: ActionProposal,
        profile: LearnerProfile
    ) -> Optional[ActionProposal]:
        """
        Validates action proposal against database catalog, visibility, and prerequisites.
        Returns validated ActionProposal or None if invalid.
        """
        if proposal.action_type not in ALLOWED_ACTION_TYPES:
            return None

        if proposal.resource_id:
            res = self.db.query(LearningResource).filter(
                LearningResource.id == proposal.resource_id,
                LearningResource.status == "active"
            ).first()

            if not res:
                # Resource does not exist or is inactive; reject proposal
                return None

            proposal.resource_title = res.title

            # Prerequisite Check for RECOMMEND_RESOURCE action
            if proposal.action_type == "RECOMMEND_RESOURCE":
                conf_map = dict(profile.skill_confidence_map or {})
                for rs in (res.resource_skills or []):
                    prereqs = self.skill_dag.get_prerequisites(rs.skill.slug)
                    for prereq_slug, is_mand in prereqs:
                        if is_mand and conf_map.get(prereq_slug, 0.0) < 0.40:
                            # Prerequisite not met; cannot recommend direct enrollment
                            return None

        return proposal

    def validate_actions(
        self,
        proposals: List[ActionProposal],
        profile: LearnerProfile
    ) -> List[ActionProposal]:
        valid = []
        for prop in proposals:
            v = self.validate_action(prop, profile)
            if v:
                valid.append(v)
        return valid
