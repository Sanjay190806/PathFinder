import os
import json
import time
import httpx
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

class GroqProvider(AIProvider):
    """
    Groq LLM Provider using OpenAI-compatible HTTP REST endpoint.
    Includes zero-downtime deterministic fallback when unconfigured, offline, or upon API error.
    """
    GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.fallback = DeterministicProvider()
        self.api_key = api_key or getattr(settings, "GROQ_API_KEY", None) or os.getenv("GROQ_API_KEY")
        self.model = model or getattr(settings, "GROQ_MODEL", "llama-3.3-70b-versatile")

    def generate_coach_response(self, context: GroundedContext) -> AIResponse:
        """
        Generates a grounded coaching response via Groq API or falls back cleanly to deterministic response.
        """
        if not self.api_key:
            logger.info("GROQ_API_KEY not configured; using DeterministicProvider fallback.")
            return self.fallback.generate_coach_response(context)

        t0 = time.time()
        try:
            lang = context.preferred_language or "English"
            multilingual_system_prompt = (
                f"{SYSTEM_INSTRUCTION_PROMPT}\n\n"
                f"MULTILINGUAL & ACCURACY DIRECTIVES:\n"
                f"1. Preferred Language: {lang}. Provide your response primarily in {lang}.\n"
                f"2. Technical Terms Preservation: Keep technical concepts and tools (e.g. Python, SQL, Docker, Machine Learning, API, Data Science, Git) "
                f"in English/Latin script when communicating in Indian regional languages (such as Tamil, Hindi, Telugu, Kannada, Marathi) to ensure clarity.\n"
                f"3. Fresh Information & Citations: If web citations are provided in grounded context, refer to them truthfully and include their source titles and URLs. "
                f"If current data could not be verified, state: 'Current information could not be verified.'\n"
                f"4. Free vs Paid Precision: Explicitly distinguish Genuinely Free, Free to Enroll (Audit), and Paid courses. Never claim a resource is free if it requires a paid subscription."
            )

            context_json = context.model_dump_json(indent=2)
            full_prompt = PromptGuard.sanitize_and_wrap(
                system_prompt=multilingual_system_prompt,
                grounded_context_json=context_json,
                user_query=context.user_query
            )

            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": multilingual_system_prompt},
                    {"role": "user", "content": full_prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 1000,
                "response_format": {"type": "json_object"}
            }

            with httpx.Client(timeout=AI_REQUEST_TIMEOUT_SECONDS) as client:
                resp = client.post(self.GROQ_API_ENDPOINT, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                raw_text = data["choices"][0]["message"]["content"]
                parsed = json.loads(raw_text)

                sources = [GroundedSource(**s) for s in parsed.get("sources", [])]
                actions = [ActionProposal(**a) for a in parsed.get("suggested_actions", [])]

                latency = (time.time() - t0) * 1000.0
                return AIResponse(
                    message=parsed.get("message", "Here is your coaching response."),
                    provider="groq",
                    confidence=float(parsed.get("confidence", 0.9)),
                    grounded=True,
                    sources=sources,
                    suggested_actions=actions,
                    latency_ms=latency,
                    is_fallback=False
                )

        except Exception as e:
            logger.warning(f"Groq API invocation failed: {e}. Falling back to DeterministicProvider.")
            fallback_res = self.fallback.generate_coach_response(context)
            fallback_res.is_fallback = True
            fallback_res.latency_ms = (time.time() - t0) * 1000.0
            return fallback_res

    def explain_recommendation(self, context: RecommendationContext) -> str:
        if not self.api_key:
            return self.fallback.explain_recommendation(context)
        try:
            prompt = (
                f"Explain concisely why {context.resource_title} by {context.resource_provider} is recommended "
                f"for learner {context.learner_name} aiming for {context.target_role}. "
                f"Missing skills: {', '.join(context.missing_skills)}. Taught skills: {', '.join(context.skills_taught)}."
            )
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 200
            }
            with httpx.Client(timeout=AI_REQUEST_TIMEOUT_SECONDS) as client:
                resp = client.post(self.GROQ_API_ENDPOINT, headers=headers, json=payload)
                resp.raise_for_status()
                return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.warning(f"Groq explain_recommendation failed: {e}. Using fallback.")
            return self.fallback.explain_recommendation(context)

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        if not self.api_key:
            return self.fallback.generate_assistant_response(context)
        try:
            prompt = f"Learner: {context.learner_name}, Goal: {context.target_role}, Query: {context.user_query}"
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            payload = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 300
            }
            with httpx.Client(timeout=AI_REQUEST_TIMEOUT_SECONDS) as client:
                resp = client.post(self.GROQ_API_ENDPOINT, headers=headers, json=payload)
                resp.raise_for_status()
                reply = resp.json()["choices"][0]["message"]["content"].strip()
                return AssistantResponsePayload(reply=reply, grounding_references=[], is_fallback=False)
        except Exception as e:
            logger.warning(f"Groq generate_assistant_response failed: {e}. Using fallback.")
            return self.fallback.generate_assistant_response(context)
