from typing import Dict, List, Set, Tuple, Optional
from sqlalchemy.orm import Session
from backend.app.models.skill import Skill, SkillPrerequisite

class SkillDAG:
    def __init__(self, db: Session):
        self.db = db
        self.skills_by_slug: Dict[str, Skill] = {}
        self.skills_by_id: Dict[str, Skill] = {}
        self.prerequisites: Dict[str, List[Tuple[str, bool]]] = {}  # skill_slug -> [(prereq_slug, is_mandatory)]
        self._load_graph()

    def _load_graph(self):
        all_skills = self.db.query(Skill).all()
        for s in all_skills:
            self.skills_by_slug[s.slug] = s
            self.skills_by_id[s.id] = s
            self.prerequisites[s.slug] = []

        all_prereqs = self.db.query(SkillPrerequisite).all()
        for p in all_prereqs:
            s_obj = self.skills_by_id.get(p.skill_id)
            prereq_obj = self.skills_by_id.get(p.prerequisite_skill_id)
            if s_obj and prereq_obj:
                self.prerequisites[s_obj.slug].append((prereq_obj.slug, p.is_mandatory))

    def get_prerequisites(self, skill_slug: str) -> List[Tuple[str, bool]]:
        return self.prerequisites.get(skill_slug, [])

    def get_transitive_prerequisites(self, skill_slug: str) -> Set[str]:
        visited: Set[str] = set()
        stack: List[str] = [skill_slug]

        while stack:
            curr = stack.pop()
            for prereq_slug, _ in self.get_prerequisites(curr):
                if prereq_slug not in visited:
                    visited.add(prereq_slug)
                    stack.append(prereq_slug)

        return visited

    def detect_cycles(self) -> List[List[str]]:
        """
        Detects cycles in the prerequisite graph using 3-color DFS.
        Returns a list of cycles found (empty list if acyclic).
        """
        # 0: unvisited, 1: visiting (in current recursion stack), 2: visited
        state: Dict[str, int] = {slug: 0 for slug in self.prerequisites}
        cycles: List[List[str]] = []
        path: List[str] = []

        def dfs(node: str):
            state[node] = 1
            path.append(node)

            for prereq_slug, _ in self.prerequisites.get(node, []):
                if prereq_slug not in state:
                    continue
                if state[prereq_slug] == 1:
                    # Cycle detected: extract cycle slice
                    idx = path.index(prereq_slug)
                    cycles.append(path[idx:] + [prereq_slug])
                elif state[prereq_slug] == 0:
                    dfs(prereq_slug)

            path.pop()
            state[node] = 2

        for slug in self.prerequisites:
            if state[slug] == 0:
                dfs(slug)

        return cycles

    def validate_acyclic(self) -> bool:
        cycles = self.detect_cycles()
        if cycles:
            cycle_str = " -> ".join(cycles[0])
            raise ValueError(f"Cycle detected in skill graph: {cycle_str}")
        return True

    def topological_sort(self) -> List[str]:
        """
        Returns skills in topological order (foundations before dependents).
        """
        self.validate_acyclic()
        visited: Set[str] = set()
        order: List[str] = []

        def visit(node: str):
            if node not in visited:
                visited.add(node)
                for prereq_slug, _ in self.get_prerequisites(node):
                    visit(prereq_slug)
                order.append(node)

        for slug in self.prerequisites:
            visit(slug)

        return order

    def evaluate_prerequisite_readiness(
        self,
        skill_slug: str,
        learner_confidence_map: Dict[str, float]
    ) -> Tuple[bool, float, List[str]]:
        prereqs = self.get_prerequisites(skill_slug)
        if not prereqs:
            return True, 1.0, []

        missing_mandatory = []
        conf_sum = 0.0

        for p_slug, is_mandatory in prereqs:
            conf = learner_confidence_map.get(p_slug, 0.0)
            conf_sum += conf
            if is_mandatory and conf < 0.40:
                missing_mandatory.append(p_slug)

        avg_conf = conf_sum / len(prereqs)
        is_satisfied = len(missing_mandatory) == 0

        return is_satisfied, avg_conf, missing_mandatory
