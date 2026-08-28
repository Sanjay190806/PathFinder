import math
import numpy as np
from typing import List, Tuple, Dict, Optional, Any
from backend.app.models.resource import LearningResource

def cosine_similarity_safe(vec_a: Any, vec_b: Any) -> float:
    """
    Computes normalized cosine similarity in [0.0, 1.0].
    Returns neutral 0.50 if vectors are empty, mismatched, or zero.
    """
    if vec_a is None or vec_b is None:
        return 0.50

    try:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
    except Exception:
        return 0.50

    if len(a) == 0 or len(b) == 0 or len(a) != len(b):
        return 0.50

    norm_a = float(np.linalg.norm(a))
    norm_b = float(np.linalg.norm(b))

    if norm_a == 0.0 or norm_b == 0.0:
        return 0.50

    dot = float(np.dot(a, b))
    sim = dot / (norm_a * norm_b)
    # Scale from [-1.0, 1.0] to [0.0, 1.0]
    return max(0.0, min(1.0, (sim + 1.0) / 2.0))

def keyword_categorical_similarity(resource_text: str, query_text: str) -> float:
    """Deterministic heuristic similarity fallback when embeddings are absent."""
    if not resource_text or not query_text:
        return 0.50
    words_res = set(resource_text.lower().replace('-', ' ').replace('/', ' ').split())
    words_q = set(query_text.lower().replace('-', ' ').replace('/', ' ').split())
    
    if not words_q:
        return 0.50
        
    overlap = len(words_res.intersection(words_q))
    score = overlap / len(words_q)
    return min(1.0, 0.40 + score * 0.60)

class SemanticMatcher:
    def __init__(self):
        pass

    def match(
        self,
        learner_vector: Optional[List[float]],
        resource: LearningResource,
        query_text: Optional[str] = None
    ) -> float:
        """
        Computes semantic similarity for a candidate resource.
        Uses vector embedding if present; otherwise falls back to keyword/categorical matching.
        """
        res_vector = resource.embedding
        if learner_vector is not None and res_vector is not None:
            return cosine_similarity_safe(learner_vector, res_vector)
        
        if query_text:
            res_text = f"{resource.title} {resource.description} {' '.join(str(cr) for cr in (resource.career_relevance or []))}"
            return keyword_categorical_similarity(res_text, query_text)
            
        return 0.50
