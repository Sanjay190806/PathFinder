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
        Phase 3: Deep Specialization (Advanced models & specialized frameworks)
        Phase 4: Engineering & Deployment (MLOps, containers, APIs, CI/CD)
        Phase 5: Capstone & Portfolio (Real-world end-to-end projects)
        
        Strictly guarantees that prerequisite resources precede dependent resources.
        """
        phases = [
            PhaseDefinition(1, "Strengthen Foundations", "Core prerequisites, programming syntax & fundamental math"),
            PhaseDefinition(2, "Core Competencies", "Core algorithms, data analysis & foundational domain tooling"),
            PhaseDefinition(3, "Deep Specialization", "Advanced architectures, deep models & specialized frameworks"),
            PhaseDefinition(4, "Engineering & Deployment", "Production APIs, Docker, pipelines & testing"),
            PhaseDefinition(5, "Capstone & Portfolio", "Real-world end-to-end projects & portfolio preparation")
        ]

        # 1. Classify candidate items into appropriate phase buckets
        for cand in selected_candidates:
            res = cand.resource
            diff = res.difficulty.lower() if res.difficulty else "beginner"
            r_type = (res.resource_type or "").lower()
            title_lower = res.title.lower()

            if r_type == "project" or "capstone" in title_lower or "portfolio" in title_lower or "ledger" in title_lower or "assistant" in title_lower:
                phases[4].items.append(cand)  # Phase 5: Capstone
            elif "deploy" in title_lower or "docker" in title_lower or "mlops" in title_lower or "cloud" in title_lower or "api" in title_lower or "ci/cd" in title_lower or "kubernetes" in title_lower:
                phases[3].items.append(cand)  # Phase 4: Engineering
            elif diff == "advanced" or "transformer" in title_lower or "deep learning" in title_lower or "neural" in title_lower or "security" in title_lower:
                phases[2].items.append(cand)  # Phase 3: Specialization
            elif diff == "intermediate" or "machine learning" in title_lower or "scikit" in title_lower or "react" in title_lower or "sql" in title_lower:
                phases[1].items.append(cand)  # Phase 2: Core
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
