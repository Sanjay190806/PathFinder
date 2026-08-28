from typing import List, Set, Optional
from sqlalchemy.orm import Session, joinedload
from backend.app.models.resource import LearningResource
from backend.app.models.goal import Goal
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.skill_gap import SkillGapReport

class CandidateRetriever:
    def __init__(self, db: Session, skill_dag: SkillDAG):
        self.db = db
        self.skill_dag = skill_dag

    def retrieve(
        self,
        goal: Goal,
        gap_report: Optional[SkillGapReport] = None,
        min_candidates: int = 10
    ) -> List[LearningResource]:
        """
        Retrieves candidate resources using multiple signals:
        1. Resources teaching priority gap skills
        2. Resources teaching goal target skills and their recursive prerequisites
        3. Resources tagged with target career role
        4. Valid active status resources
        """
        target_skills: List[str] = goal.target_skills or []
        priority_skills: List[str] = gap_report.priority_skills if gap_report else target_skills
        
        # Expand target skills to include all recursive prerequisites
        relevant_skill_slugs: Set[str] = set(target_skills).union(set(priority_skills))
        to_expand = list(target_skills)
        
        while to_expand:
            current_slug = to_expand.pop()
            prereqs = self.skill_dag.get_prerequisites(current_slug)
            for p_slug, _ in prereqs:
                if p_slug not in relevant_skill_slugs:
                    relevant_skill_slugs.add(p_slug)
                    to_expand.append(p_slug)

        # Query all active resources with pre-loaded relations for performance
        all_resources = (
            self.db.query(LearningResource)
            .filter(LearningResource.status == "active")
            .options(
                joinedload(LearningResource.resource_skills),
                joinedload(LearningResource.prerequisite_skills)
            )
            .all()
        )

        candidates = []
        role_slug = goal.target_role.lower().replace(' ', '-').replace('/', '-')

        for r in all_resources:
            teaches_relevant = any(rs.skill.slug in relevant_skill_slugs for rs in r.resource_skills)
            matches_role = any(role_slug in str(cr).lower() for cr in (r.career_relevance or []))
            
            if teaches_relevant or matches_role:
                candidates.append(r)

        # Ensure enough candidates are available for downstream ranking and filtering
        if len(candidates) < min_candidates:
            return all_resources

        return candidates

# Backward-compatible function wrapper
def retrieve_candidate_resources(goal: Goal, skill_dag: SkillDAG, db: Session) -> List[LearningResource]:
    retriever = CandidateRetriever(db, skill_dag)
    return retriever.retrieve(goal)
