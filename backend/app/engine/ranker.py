from typing import List
from backend.app.engine.scorer import ScoredCandidate

class DeterministicRanker:
    @staticmethod
    def rank(candidates: List[ScoredCandidate]) -> List[ScoredCandidate]:
        """
        Ranks scored candidates deterministically using a 4-level tie-breaking policy:
        1. Descending composite score (-composite_score)
        2. Descending goal relevance (-goal_relevance_score)
        3. Descending skill gap coverage (-skill_gap_score)
        4. Stable resource ID (resource.id)
        """
        return sorted(
            candidates,
            key=lambda c: (
                -c.composite_score,
                -c.goal_relevance_score,
                -c.skill_gap_score,
                str(c.resource.id)
            )
        )
