import json
import hashlib
from typing import Dict, Any, List, Optional
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.core.weights import RECOMMENDATION_ALGO_VERSION
from backend.app.core.config import settings

class StateFingerprinter:
    @staticmethod
    def generate_fingerprint(
        profile: LearnerProfile,
        goal: Goal,
        completed_resource_ids: Optional[List[str]] = None,
        feedback_hashes: Optional[List[str]] = None
    ) -> str:
        """
        Generates a canonical SHA-256 state fingerprint from the complete learner state.
        """
        # Canonical representation of skill confidences
        skills_sorted = sorted((profile.skill_confidence_map or {}).items())
        
        state_dict: Dict[str, Any] = {
            "profile_id": str(profile.id),
            "goal_id": str(goal.id),
            "goal_role": str(goal.target_role),
            "goal_skills": sorted(goal.target_skills or []),
            "education": str(profile.education_level or ""),
            "experience": str(profile.experience_level or ""),
            "weekly_hours": int(profile.weekly_hours or 10),
            "preferred_formats": sorted(profile.preferred_formats or []),
            "difficulty_tolerance": round(float(profile.difficulty_tolerance or 0.5), 2),
            "skills": skills_sorted,
            "completed_resources": sorted(completed_resource_ids or []),
            "feedback_hashes": sorted(feedback_hashes or []),
            "algo_version": RECOMMENDATION_ALGO_VERSION,
            "embedding_model": settings.EMBEDDING_MODEL,
            "embedding_model_version": settings.EMBEDDING_MODEL_VERSION
        }

        canonical_json = json.dumps(state_dict, sort_keys=True)
        return hashlib.sha256(canonical_json.encode('utf-8')).hexdigest()
