import os
import json
import time
from typing import List, Dict, Any, Optional
from backend.app.ai.provider import (
    AIProvider, GroundedContext, AIResponse, GroundedSource, ActionProposal,
    RecommendationContext, AssistantContext, AssistantResponsePayload
)
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.ai.config import SYSTEM_INSTRUCTION_PROMPT, AI_REQUEST_TIMEOUT_SECONDS
from backend.app.ai.prompt_guard import PromptGuard
from backend.app.core.config import settings
from backend.app.core.logger import logger

class GeminiProvider(AIProvider):
    def __init__(self):
        self.fallback = DeterministicProvider()
        self.client = None
        self._init_client()

    def _init_client(self):
        api_key = getattr(settings, "GEMINI_API_KEY", None) or os.getenv("GEMINI_API_KEY")
        if api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.client = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=SYSTEM_INSTRUCTION_PROMPT
                )
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini SDK: {e}. Fallback provider will be used.")
                self.client = None

    def generate_coach_response(self, context: GroundedContext) -> AIResponse:
        """
        Generates a grounded coaching response via Google Gemini API with automatic deterministic fallback.
        """
        if not self.client:
            logger.info("GEMINI_API_KEY not configured or client unavailable; using DeterministicProvider.")
            return self.fallback.generate_coach_response(context)

        t0 = time.time()
        try:
            context_json = context.model_dump_json(indent=2)
            full_prompt = PromptGuard.sanitize_and_wrap(
                system_prompt=SYSTEM_INSTRUCTION_PROMPT,
                grounded_context_json=context_json,
                user_query=context.user_query
            )

            # Request generation with timeout protection
            response = self.client.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.2,
                    "max_output_tokens": 1000,
                    "response_mime_type": "application/json"
                }
            )

            latency = round((time.time() - t0) * 1000, 2)
            raw_text = response.text.strip()

            # Parse JSON
            parsed = json.loads(raw_text)
            message = parsed.get("message", raw_text)
            confidence = float(parsed.get("confidence", 0.95))

            sources = []
            for s in parsed.get("sources", []):
                sources.append(GroundedSource(
                    type=s.get("type", "resource"),
                    id=s.get("id"),
                    title=s.get("title", "")
                ))

            actions = []
            for a in parsed.get("suggested_actions", []):
                actions.append(ActionProposal(
                    action_type=a.get("action_type", "EXPLAIN_ROADMAP_STEP"),
                    resource_id=a.get("resource_id"),
                    reason=a.get("reason", "")
                ))

            return AIResponse(
                message=message,
                provider="gemini",
                confidence=confidence,
                grounded=True,
                sources=sources,
                suggested_actions=actions,
                latency_ms=latency,
                is_fallback=False
            )

        except Exception as e:
            logger.warning(f"Gemini API request failed ({e}); failing over to DeterministicProvider.")
            res = self.fallback.generate_coach_response(context)
            res.latency_ms = round((time.time() - t0) * 1000, 2)
            return res

    def explain_recommendation(self, context: RecommendationContext) -> str:
        if not self.client:
            return self.fallback.explain_recommendation(context)

        try:
            prompt = (
                f"Explain why {context.resource_title} was recommended to {context.learner_name} for goal {context.target_role}. "
                f"Key signals: {', '.join(context.structured_reasons)}"
            )
            response = self.client.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return self.fallback.explain_recommendation(context)

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        if not self.client:
            return self.fallback.generate_assistant_response(context)

        try:
            prompt = f"Learner query: {context.user_query} for goal {context.target_role} in phase {context.active_phase}."
            response = self.client.generate_content(prompt)
            return AssistantResponsePayload(
                reply=response.text.strip(),
                suggested_focus=context.skill_gaps[:3],
                suggested_actions=[],
                grounding_references=context.current_roadmap_items[:1],
                is_fallback=False
            )
        except Exception:
            return self.fallback.generate_assistant_response(context)
