import re
from typing import Dict, Any, List

class IntentDetector:
    @staticmethod
    def detect_intent(query: str) -> str:
        """
        Deterministic intent classifier for learner educational queries.
        """
        q = (query or "").lower().strip()

        # 1. Preparation & Interview Intelligence
        if any(phrase in q for phrase in ["mock interview", "interview prep", "interview practice", "interview question", "practice interview"]):
            return "MOCK_INTERVIEW"
        if any(phrase in q for phrase in ["resume audit", "ats score", "ats check", "resume keywords", "resume feedback", "ats audit"]):
            return "RESUME_ATS"
        if any(phrase in q for phrase in ["preparation readiness", "prep score", "am i application ready", "application readiness", "overall readiness"]):
            return "PREPARATION_READINESS"
        if any(phrase in q for phrase in ["preparation gaps", "prep gaps", "what is blocking my application", "what prep do i need"]):
            return "PREPARATION_GAPS"

        # 2. Readiness
        if any(phrase in q for phrase in ["how ready", "readiness", "am i ready", "job ready", "career ready", "qualify", "qualification"]):
            return "READINESS_QUERY"

        # 2. Skill Gaps
        if any(phrase in q for phrase in ["skill gap", "skill gaps", "skills am i missing", "skills to focus", "what skills do i lack", "skill deficit", "blocker", "blockers"]):
            return "SKILL_GAP_QUERY"

        # 3. Market Intelligence
        if any(phrase in q for phrase in ["market demand", "job market", "industry trends", "emerging skills", "market intelligence", "market signal"]):
            return "MARKET_QUERY"

        # 4. Review / Decay
        if any(phrase in q for phrase in ["skill decay", "decayed skill", "need review", "refresh", "forgetting", "review needed"]):
            return "REVIEW_NEEDED"

        # 5. Prerequisite & Blocking
        if any(w in q for w in ["prerequisite", "prereq", "why is this blocked", "blocked", "unlock", "why can't i access", "why cant i access"]):
            return "PREREQUISITE"

        # 6. Recommendation Explanation
        if "why" in q and ("recommend" in q or "suggested" in q or "picked" in q or "chosen" in q):
            return "RECOMMENDATION_EXPLANATION"

        # 7. Next Learning Step
        if any(phrase in q for phrase in ["what should i learn next", "what to learn next", "next step", "where should i start", "what next", "next topic", "next course", "what to study", "start learning"]):
            return "NEXT_LEARNING_STEP"

        # 8. Roadmap Explanation
        if any(phrase in q for phrase in ["explain my roadmap", "how is my path structured", "explain my curriculum", "explain roadmap", "my roadmap", "what are the phases", "roadmap structure", "roadmap phases"]):
            return "ROADMAP_EXPLANATION"

        # 9. Progress & Velocity
        if any(phrase in q for phrase in ["how am i progressing", "my progress", "what have i completed", "completion rate", "learning velocity"]):
            return "PROGRESS"

        # 10. Practice / Project Suggestion
        if any(phrase in q for phrase in ["practice", "project", "portfolio", "hands-on", "build something", "exercise"]):
            return "PRACTICE_SUGGESTION"

        # 11. Resource Search & Free/Paid Discovery
        if any(w in q for w in ["find free", "free course", "free courses", "free resource", "tamil course", "hindi course", "telugu course", "find course", "search course", "free tamil", "free hindi"]):
            return "RESOURCE_SEARCH"

        # 12. Free vs Paid Classification Inquiries
        if any(w in q for w in ["is this free", "is it free", "is nptel free", "pricing model", "paid course", "how much does it cost", "audit free"]):
            return "PRICE_CLASSIFICATION"

        # 13. Planner Inquiries (Today / Week)
        if any(w in q for w in ["today plan", "today's focus", "plan today", "what to do today", "daily plan"]):
            return "PLANNER_TODAY"
        if any(w in q for w in ["weekly plan", "this week's plan", "schedule matrix", "weekly schedule", "week plan"]):
            return "PLANNER_WEEK"

        # 14. Opportunity & Internship Inquiries
        if any(w in q for w in ["internship", "internships", "jobs", "find jobs", "chennai", "bangalore", "current opportunities", "entry level", "fresher jobs"]):
            return "OPPORTUNITIES_QUERY"

        # 15. General Educational Concepts
        if any(q.startswith(prefix) for prefix in ["what is ", "what are ", "explain ", "how does ", "difference between "]) or any(concept in q for concept in ["gradient descent", "transformer", "backpropagation", "loss function", "overfitting", "regularization", "attention"]):
            return "GENERAL_LEARNING_QUESTION"

        return "UNKNOWN"
