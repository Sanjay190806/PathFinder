from typing import List, Dict
from backend.app.engine.scorer import ScoredCandidate

class DiversitySelector:
    def __init__(self, max_per_provider: int = 3, max_per_format: int = 4):
        self.max_per_provider = max_per_provider
        self.max_per_format = max_per_format

    def select(
        self,
        ranked_candidates: List[ScoredCandidate],
        top_k: int = 10
    ) -> List[ScoredCandidate]:
        """
        Applies deterministic diversity selection across providers and formats.
        Preserves top-quality items while penalizing excessive provider monopoly.
        """
        selected: List[ScoredCandidate] = []
        provider_counts: Dict[str, int] = {}
        format_counts: Dict[str, int] = {}

        for cand in ranked_candidates:
            provider = cand.resource.provider
            fmt = cand.resource.format
            
            p_count = provider_counts.get(provider, 0)
            f_count = format_counts.get(fmt, 0)

            # High priority inclusion if within diversity caps or early slots
            if (p_count < self.max_per_provider and f_count < self.max_per_format) or len(selected) < 4:
                selected.append(cand)
                provider_counts[provider] = p_count + 1
                format_counts[fmt] = f_count + 1
            else:
                # Apply slight diversity decay penalty to candidate
                cand.diversity_score = 0.60
                cand.composite_score = round(cand.composite_score - 0.015, 4)
                selected.append(cand)
                provider_counts[provider] = p_count + 1
                format_counts[fmt] = f_count + 1

            if len(selected) >= top_k * 2:
                break

        # Re-sort with adjusted diversity scores
        return selected[:top_k]

# Backward-compatible function wrapper
def apply_diversity_selection(ranked_candidates: List[ScoredCandidate], max_per_provider: int = 3) -> List[ScoredCandidate]:
    selector = DiversitySelector(max_per_provider=max_per_provider)
    return selector.select(ranked_candidates, top_k=len(ranked_candidates))
