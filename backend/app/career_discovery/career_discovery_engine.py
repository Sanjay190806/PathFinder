"""
Career Discovery Engine (Phase 9 Stage 2)
Authoritative discovery service that evaluates a learner's Indian education profile,
skills, practical evidence, and interests against the career domain catalog.
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.core.career_catalog import CAREER_ROLES_CATALOG, CareerRoleDefinition
from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import LearnerSkill
from backend.app.career_discovery.career_fit_scorer import CareerFitScorer, CareerFitScore

class CareerDiscoveryReport(BaseModel := type('BaseModel', (), {})):
    pass

class CareerDiscoveryEngine:
    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def discover_careers(
        self,
        profile: LearnerProfile,
        interest_query: Optional[str] = None
    ) -> List[CareerFitScore]:
        """
        Discovers all catalog careers ranked by transparent multi-signal fit scores.
        Handles incomplete profiles gracefully.
        """
        # 1. Extract learner skills
        skill_map: Dict[str, float] = {}
        if profile.skill_confidence_map:
            skill_map.update(profile.skill_confidence_map)

        if self.db and profile.id:
            db_skills = self.db.query(LearnerSkill).filter(LearnerSkill.profile_id == profile.id).all()
            for ls in db_skills:
                if ls.skill:
                    skill_map[ls.skill.slug] = max(skill_map.get(ls.skill.slug, 0.0), ls.assessed_confidence or 0.3)

        # 2. Extract practical evidence count if available
        evidence_count = 0
        if hasattr(profile, "practical_evidence_records") and profile.practical_evidence_records:
            evidence_count = len(profile.practical_evidence_records)
        elif hasattr(profile, "projects") and profile.projects:
            evidence_count = len(profile.projects)

        # 3. Interests
        interests = []
        if interest_query:
            interests.append(interest_query)
        if profile.learning_objective:
            interests.append(profile.learning_objective)
        if profile.work_domain:
            interests.append(profile.work_domain)

        # 4. Score all registered catalog roles
        results: List[CareerFitScore] = []
        for role_def in CAREER_ROLES_CATALOG.values():
            fit = CareerFitScorer.score_career_fit(
                role_def=role_def,
                education_stage=profile.education_stage or profile.education_level,
                education_domain=profile.education_domain or profile.field_of_study,
                education_stream=profile.education_stream,
                specialization=profile.specialization,
                subjects=profile.subjects,
                learner_skills=skill_map,
                interests=interests,
                practical_evidence_count=evidence_count
            )
            results.append(fit)

        # 5. Deterministic sorting: overall_score descending, then career_role alphabetically
        results.sort(key=lambda x: (-x.overall_score, x.career_role))
        return results

    def get_discovery_by_slug(
        self,
        profile: LearnerProfile,
        career_slug: str
    ) -> Optional[CareerFitScore]:
        """Returns fit evaluation for a specific career slug."""
        all_careers = self.discover_careers(profile)
        for c in all_careers:
            if c.career_slug == career_slug:
                return c
        return None
