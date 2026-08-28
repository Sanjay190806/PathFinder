import os
from typing import List, Dict, Any, Optional
from backend.app.ai.provider import AIProvider, RecommendationContext, AssistantContext, AssistantResponsePayload
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.core.config import settings

class GeminiProvider(AIProvider):
    def __init__(self):
        self.fallback = DeterministicProvider()
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.client = genai.GenerativeModel('gemini-1.5-flash')
            except Exception:
                self.client = None

    def explain_recommendation(self, context: RecommendationContext) -> str:
        if not self.client:
            return self.fallback.explain_recommendation(context)

        try:
            prompt = (
                f"You are the PathFinder AI Learning Coach. Provide a concise, motivating, and transparent explanation "
                f"for why the following learning resource was recommended to {context.learner_name}:\n"
                f"Resource: {context.resource_title} (by {context.resource_provider})\n"
                f"Target Career Goal: {context.target_role}\n"
                f"Skills Taught: {', '.join(context.skills_taught)}\n"
                f"Weekly Hours: {context.weekly_hours}h\n"
                f"Key Recommendation Signals: {', '.join(context.structured_reasons)}\n\n"
                f"Output 2-3 concise bullet points followed by a 1-sentence wrap-up."
            )
            response = self.client.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return self.fallback.explain_recommendation(context)

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        if not self.client:
            return self.fallback.generate_assistant_response(context)

        try:
            prompt = (
                f"You are the PathFinder AI Tutor & Learning Coach for {context.learner_name}.\n"
                f"Learner Profile:\n"
                f"- Target Career Goal: {context.target_role}\n"
                f"- Available Time: {context.weekly_hours} hours/week\n"
                f"- Current Skills: {', '.join(context.skills_known)}\n"
                f"- Priority Skill Gaps: {', '.join(context.skill_gaps)}\n"
                f"- Active Roadmap Phase: {context.active_phase}\n"
                f"- Current Path Items: {', '.join(context.current_roadmap_items)}\n"
                f"- Completed Items: {', '.join(context.completed_items)}\n\n"
                f"Learner Query: \"{context.user_query}\"\n\n"
                f"Respond directly, supportively, and grounded strictly in their actual roadmap and catalog. "
                f"Keep your response under 150 words."
            )
            response = self.client.generate_content(prompt)
            
            # Grounding references from current roadmap
            grounding = [item for item in context.current_roadmap_items if item.lower() in response.text.lower()]
            if not grounding and context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

            return AssistantResponsePayload(
                reply=response.text.strip(),
                suggested_focus=context.skill_gaps[:3],
                suggested_actions=[],
                grounding_references=grounding,
                is_fallback=False
            )
        except Exception:
            return self.fallback.generate_assistant_response(context)
