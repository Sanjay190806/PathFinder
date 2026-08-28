from typing import List, Dict, Any
from backend.app.ai.provider import AIProvider, RecommendationContext, AssistantContext, AssistantResponsePayload

class DeterministicProvider(AIProvider):
    def explain_recommendation(self, context: RecommendationContext) -> str:
        reasons_text = "\n".join([f"- {r}" for r in context.structured_reasons])
        return (
            f"Why {context.resource_title} is recommended for you:\n"
            f"{reasons_text}\n"
            f"This course prepares you for your target role as a {context.target_role} "
            f"and aligns with your {context.weekly_hours} hours/week study commitment."
        )

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        query_lower = context.user_query.lower()
        actions = []
        grounding = []

        if "5 hours" in query_lower or "adjust" in query_lower or "time" in query_lower or "hours" in query_lower:
            reply = (
                f"Based on your profile, I have tailored a focused plan for {context.learner_name}. "
                f"With limited hours this week, prioritize high-impact foundational concepts in {context.active_phase}. "
                f"Focus on '{context.current_roadmap_items[0] if context.current_roadmap_items else 'core foundations'}' "
                f"to maintain steady velocity without burnout."
            )
            actions.append({
                "action_type": "adjust_weekly_hours",
                "label": "Set Weekly Commitment to 5 Hours",
                "payload": {"weekly_hours": 5}
            })
            if context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

        elif "struggling" in query_lower or "difficult" in query_lower or "neural" in query_lower:
            reply = (
                f"It's completely normal to find advanced topics challenging! "
                f"I recommend reinforcing your math and programming prerequisites. "
                f"You can review Linear Algebra and Python for ML before jumping straight into deep architectures."
            )
            actions.append({
                "action_type": "add_prerequisite_practice",
                "label": "Review Linear Algebra & Fundamentals",
                "payload": {"target_skill": "linear-algebra"}
            })
            grounding.extend(["Python for ML", "Linear Algebra & Probability"])

        elif "what should i learn next" in query_lower or "next" in query_lower:
            next_topic = context.current_roadmap_items[0] if context.current_roadmap_items else "Foundations"
            reply = (
                f"Your immediate priority on your path to {context.target_role} is: **{next_topic}**. "
                f"This covers your identified skill gap in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'core competencies'}."
            )
            if context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

        elif "project" in query_lower or "portfolio" in query_lower or "practice" in query_lower:
            reply = (
                f"For your {context.target_role} portfolio, a strong project is an **End-to-End LLM-Powered Pipeline with FastAPI and Docker**. "
                f"This demonstrates data preprocessing, model inference, API serving, and deployment skills."
            )
            grounding.append("End-to-End LLM Agent Project")

        elif "skip" in query_lower:
            reply = (
                f"You can skip topics if you already feel confident, but be aware that skipping foundational prerequisites "
                f"may make Phase 3 (Deep Specialization) significantly harder. I suggest taking a quick assessment first!"
            )
        else:
            reply = (
                f"Hello {context.learner_name}! I am your PathFinder AI Learning Coach. "
                f"I am actively tracking your goal to become a {context.target_role}, your current phase ({context.active_phase}), "
                f"and your skill gaps in {', '.join(context.skill_gaps[:3]) if context.skill_gaps else 'relevant areas'}. "
                f"How can I help you adjust or accelerate your roadmap today?"
            )

        return AssistantResponsePayload(
            reply=reply,
            suggested_focus=context.skill_gaps[:3] if context.skill_gaps else ["Foundations"],
            suggested_actions=actions,
            grounding_references=grounding,
            is_fallback=True
        )
