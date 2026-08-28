from typing import List, Dict, Set, Tuple, Any, Optional
from backend.app.models.resource import LearningResource
from backend.app.engine.skill_graph import SkillDAG

class FilterRejection:
    def __init__(self, resource_id: str, resource_slug: str, reason: str, missing_skills: Optional[List[str]] = None):
        self.resource_id = resource_id
        self.resource_slug = resource_slug
        self.reason = reason
        self.missing_skills = missing_skills or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "resource_id": self.resource_id,
            "resource_slug": self.resource_slug,
            "eligible": False,
            "reason": self.reason,
            "missing_skills": self.missing_skills
        }

class HardConstraintFilter:
    def __init__(self, skill_dag: SkillDAG):
        self.skill_dag = skill_dag

    def filter_candidates(
        self,
        candidates: List[LearningResource],
        learner_confidence_map: Dict[str, float],
        completed_resource_ids: Optional[Set[str]] = None,
        excluded_resource_ids: Optional[Set[str]] = None,
        max_session_hours: float = 0.0,  # 0.0 = soft time constraint (default)
        allowed_difficulties: Optional[Set[str]] = None
    ) -> Tuple[List[LearningResource], List[FilterRejection]]:
        """
        Applies hard constraint filtering strictly BEFORE semantic matching and scoring.
        
        Hard Constraints:
        1. Mandatory prerequisite not satisfied (confidence < 0.40 on any mandatory prereq)
        2. Resource already completed by learner
        3. Explicit learner exclusion
        4. Inactive resource status
        5. Hard difficulty constraint (if explicitly set)
        6. Hard time constraint (if explicitly set)
        
        Returns:
            (eligible_resources, rejection_records)
        """
        completed_ids = completed_resource_ids or set()
        excluded_ids = excluded_resource_ids or set()
        eligible: List[LearningResource] = []
        rejections: List[FilterRejection] = []

        for res in candidates:
            # 1. Check active status
            if res.status != "active":
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="resource_status_not_active"
                ))
                continue

            # 2. Check already completed
            if res.id in completed_ids:
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="resource_already_completed"
                ))
                continue

            # 3. Check explicit exclusions
            if res.id in excluded_ids:
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="resource_explicitly_excluded"
                ))
                continue

            # 4. Check explicit hard difficulty constraint
            if allowed_difficulties and res.difficulty not in allowed_difficulties:
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="difficulty_exceeds_strict_filter"
                ))
                continue

            # 5. Check explicit hard time constraint
            if max_session_hours > 0.0 and res.estimated_hours > max_session_hours:
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="exceeds_strict_time_limit"
                ))
                continue

            # 6. Check explicit ResourcePrerequisite records
            missing_mandatory_prereqs: List[str] = []
            if hasattr(res, 'prerequisite_skills') and res.prerequisite_skills:
                for rp in res.prerequisite_skills:
                    if rp.is_mandatory:
                        skill_slug = rp.skill.slug
                        conf = float(learner_confidence_map.get(skill_slug, 0.0))
                        if conf < 0.40:
                            missing_mandatory_prereqs.append(skill_slug)

            # 7. Check Skill DAG mandatory prerequisites for each skill taught
            if hasattr(res, 'resource_skills') and res.resource_skills:
                for rs in res.resource_skills:
                    is_satisfied, _, missing_slugs = self.skill_dag.evaluate_prerequisite_readiness(
                        rs.skill.slug, learner_confidence_map
                    )
                    if not is_satisfied:
                        for m_slug in missing_slugs:
                            if m_slug not in missing_mandatory_prereqs:
                                missing_mandatory_prereqs.append(m_slug)

            if missing_mandatory_prereqs:
                rejections.append(FilterRejection(
                    resource_id=res.id,
                    resource_slug=res.slug,
                    reason="mandatory_prerequisite_not_met",
                    missing_skills=missing_mandatory_prereqs
                ))
                continue

            eligible.append(res)

        return eligible, rejections
