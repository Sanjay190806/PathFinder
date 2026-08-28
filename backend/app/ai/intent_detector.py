import re
from typing import Dict, Any, List

class IntentDetector:
    @staticmethod
    def detect_intent(query: str) -> str:
        """
        Deterministic intent classifier for learner educational queries.
        """
        q = (query or "").lower().strip()

        # 1. Prerequisite & Blocking
        if any(w in q for w in ["prerequisite", "prereq", "why is this blocked", "blocked", "unlock", "why can't i access", "why cant i access"]):
            return "PREREQUISITE"

        # 2. Recommendation Explanation
        if "why" in q and ("recommend" in q or "suggested" in q or "picked" in q or "chosen" in q):
            return "RECOMMENDATION_EXPLANATION"

        # 3. Next Learning Step
        if any(phrase in q for phrase in ["what should i learn next", "what to learn next", "next step", "where should i start", "what next", "next topic", "next course", "what to study", "start learning"]):
            return "NEXT_LEARNING_STEP"

        # 4. Roadmap Explanation
        if any(phrase in q for phrase in ["explain my roadmap", "how is my path structured", "explain my curriculum", "explain roadmap", "my roadmap", "what are the phases", "roadmap structure", "roadmap phases"]):
            return "ROADMAP_EXPLANATION"

        # 5. Skill Gaps
        if any(phrase in q for phrase in ["skill gap", "skills am i missing", "skills to focus", "what skills do i lack", "skill deficit"]):
            return "SKILL_GAP"

        # 6. Progress & Velocity
        if any(phrase in q for phrase in ["how am i progressing", "my progress", "what have i completed", "completion rate", "learning velocity"]):
            return "PROGRESS"

        # 7. Practice / Project Suggestion
        if any(phrase in q for phrase in ["practice", "project", "portfolio", "hands-on", "build something", "exercise"]):
            return "PRACTICE_SUGGESTION"

        # 8. General Educational Concepts
        if any(q.startswith(prefix) for prefix in ["what is ", "what are ", "explain ", "how does ", "difference between "]) or any(concept in q for concept in ["gradient descent", "transformer", "backpropagation", "loss function", "overfitting", "regularization", "attention"]):
            return "GENERAL_LEARNING_QUESTION"

        return "UNKNOWN"
