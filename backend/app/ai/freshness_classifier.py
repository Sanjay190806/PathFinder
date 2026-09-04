import re
from typing import Dict, Any, Tuple

class FreshnessClassifier:
    """
    Deterministic query freshness classifier.
    Categorizes learner queries into:
    - 'FRESH' / 'CURRENT': Inquires about current offerings, availability, pricing, market trends, active cohorts.
    - 'STATIC' / 'STABLE': Conceptual questions, timeless theoretical explanations, standard fundamentals.
    """

    FRESH_KEYWORDS = [
        "current", "currently", "latest", "today", "now", "2026", "this year",
        "active", "offering", "available", "availability", "deadline", "enrollment",
        "hiring", "job market", "market trend", "demand trend", "salary", "internship",
        "price", "pricing", "cost", "fee", "free courses", "paid courses",
        "is nptel offering", "newest", "recently"
    ]

    STATIC_PATTERNS = [
        r"^what is ",
        r"^what are ",
        r"^explain ",
        r"^how does .* work",
        r"^difference between ",
        r"^define ",
        r"^concept of "
    ]

    STATIC_CONCEPTS = [
        "gradient descent", "transformer", "backpropagation", "loss function",
        "overfitting", "regularization", "attention mechanism", "bubble sort",
        "binary search", "tcp/ip", "osi model", "relational database", "acid properties"
    ]

    @classmethod
    def classify(cls, query: str) -> Tuple[str, float, str]:
        """
        Returns (classification, confidence, rationale)
        classification: 'FRESH' or 'STATIC'
        confidence: 0.0 to 1.0
        """
        q = (query or "").lower().strip()
        if not q:
            return ("STATIC", 1.0, "Empty query defaults to static knowledge")

        # Check explicit fresh triggers
        matched_fresh = [kw for kw in cls.FRESH_KEYWORDS if kw in q]
        matched_static = [sc for sc in cls.STATIC_CONCEPTS if sc in q]
        has_static_pattern = any(re.search(pat, q) for pat in cls.STATIC_PATTERNS)

        if matched_fresh and not matched_static:
            return ("FRESH", 0.95, f"Contains time-sensitive indicators: {', '.join(matched_fresh[:3])}")
        
        if matched_fresh and matched_static:
            # e.g., "Explain gradient descent in current 2026 practice" or "Find current courses on gradient descent"
            if any(w in q for w in ["course", "offering", "job", "hiring", "demand", "price", "cost", "enroll"]):
                return ("FRESH", 0.85, f"Combines concept with fresh availability/offering search: {matched_fresh[0]}")
            return ("STATIC", 0.80, f"Primarily conceptual explanation despite temporal qualifier")

        if has_static_pattern or matched_static:
            return ("STATIC", 0.95, "Matches core theoretical and conceptual educational patterns")

        # Default fallback for general advice
        return ("STATIC", 0.75, "Standard curriculum inquiry without temporal constraints")
