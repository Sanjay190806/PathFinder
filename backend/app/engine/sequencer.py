from typing import List, Dict, Set, Optional
from backend.app.engine.scorer import ScoredCandidate
from backend.app.engine.skill_graph import SkillDAG

class PhaseDefinition:
    def __init__(self, number: int, name: str, description: str):
        self.number = number
        self.name = name
        self.description = description
        self.items: List[ScoredCandidate] = []

class PathSequencer:
    def __init__(self, skill_dag: SkillDAG):
        self.skill_dag = skill_dag

    def sequence(
        self,
        selected_candidates: List[ScoredCandidate]
    ) -> List[PhaseDefinition]:
        """
        Sequences candidates into a pedagogically sound 5-phase curriculum:
        Phase 1: Strengthen Foundations (Prerequisites & Core syntax)
        Phase 2: Core Competencies (Fundamental algorithms & tooling)
        Phase 3: Deep Specialization (Advanced architectures & specialized domain frameworks)
        Phase 4: Engineering & Deployment (Production tooling, pipelines & integration)
        Phase 5: Capstone & Portfolio (Real-world end-to-end projects & portfolio preparation)
        
        Purely derived from:
        - Skill DAG topological depth
        - Prerequisite hierarchy
        - Resource difficulty level
        - Explicit resource type metadata (project / tooling / course)
        """
        phases = [
            PhaseDefinition(1, "Strengthen Foundations", "Core prerequisites, syntax & fundamental foundations"),
            PhaseDefinition(2, "Core Competencies", "Core algorithms, domain tooling & essential competencies"),
            PhaseDefinition(3, "Deep Specialization", "Advanced architectures, deep specialization & frameworks"),
            PhaseDefinition(4, "Engineering & Deployment", "Production tooling, pipelines, testing & deployment"),
            PhaseDefinition(5, "Capstone & Portfolio", "Real-world end-to-end projects & portfolio preparation")
        ]

        # 1. Classify candidate items into appropriate phase buckets using structural data
        for cand in selected_candidates:
            res = cand.resource
            diff = (res.difficulty or "beginner").lower()
            r_type = (res.resource_type or "course").lower()
            prereq_depth = self._get_min_prereq_depth(cand)

            if r_type in ("project", "capstone", "portfolio"):
                phases[4].items.append(cand)  # Phase 5: Capstone
            elif r_type in ("tooling", "system", "infrastructure", "devops"):
                phases[3].items.append(cand)  # Phase 4: Engineering & Tooling
            elif prereq_depth >= 2 or diff == "advanced":
                phases[2].items.append(cand)  # Phase 3: Deep Specialization
            elif prereq_depth == 1 or diff == "intermediate":
                phases[1].items.append(cand)  # Phase 2: Core Competencies
            else:
                phases[0].items.append(cand)  # Phase 1: Foundations

        # 2. Sort items within each phase respecting DAG topological depth and recommendation score
        for phase in phases:
            phase.items.sort(
                key=lambda c: (
                    self._get_min_prereq_depth(c),
                    -c.composite_score,
                    c.resource.id
                )
            )

        return phases

    def _get_min_prereq_depth(self, cand: ScoredCandidate) -> int:
        """Calculates topological prerequisite depth (0 for foundation skills)."""
        if not hasattr(cand.resource, 'resource_skills') or not cand.resource.resource_skills:
            return 0
        depths = []
        for rs in cand.resource.resource_skills:
            prereqs = self.skill_dag.get_transitive_prerequisites(rs.skill.slug)
            depths.append(len(prereqs))
        return min(depths) if depths else 0

# Backward-compatible function wrapper
def sequence_learning_path(
    selected_candidates: List[ScoredCandidate],
    skill_dag: SkillDAG
) -> List[PhaseDefinition]:
    sequencer = PathSequencer(skill_dag)
    return sequencer.sequence(selected_candidates)
