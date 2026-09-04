import time
import uuid
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.ai.provider import GroundedContext, AIResponse, ActionProposal, GroundedSource
from backend.app.ai.context_builder import ContextBuilder
from backend.app.ai.prompt_guard import PromptGuard
from backend.app.ai.action_validator import ActionValidator
from backend.app.ai.gemini_provider import GeminiProvider
from backend.app.ai.groq_provider import GroqProvider
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.ai.freshness_classifier import FreshnessClassifier
from backend.app.ai.web_research import WebResearchService
from backend.app.core.config import settings
from backend.app.core.logger import logger

class AICoach:
    def __init__(self, db: Session):
        self.db = db
        self.context_builder = ContextBuilder(db)
        self.action_validator = ActionValidator(db)
        self.gemini_provider = GeminiProvider()
        self.groq_provider = GroqProvider()
        self.deterministic_provider = DeterministicProvider()

    def chat(
        self,
        profile: LearnerProfile,
        goal: Goal,
        query: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        correlation_id: Optional[str] = None
    ) -> AIResponse:
        """
        Top-level grounded AI Coach execution pipeline:
        Input Validation -> PromptGuard -> ContextBuilder -> Freshness Routing / Web Research ->
        Provider Selection (Groq / Gemini / Deterministic) -> ActionValidator -> Safety Grounding -> Return
        """
        corr_id = correlation_id or str(uuid.uuid4())
        t0 = time.time()

        logger.info(f"AI_REQUEST_STARTED [corr_id={corr_id}] learner={profile.id} query='{query[:60]}...'")

        # 1. Prompt Injection Pre-check & Input Validation
        is_safe, refusal_reason = PromptGuard.validate_user_input(query)
        if not is_safe:
            logger.warning(f"AI_PROMPT_INJECTION_DETECTED [corr_id={corr_id}] query='{query}'")
            return AIResponse(
                message=refusal_reason,
                provider="guardrail",
                confidence=1.0,
                grounded=True,
                sources=[],
                suggested_actions=[],
                correlation_id=corr_id,
                latency_ms=round((time.time() - t0) * 1000, 2),
                is_fallback=True
            )

        # 2. Build Grounded Context
        context = self.context_builder.build_context(
            profile=profile,
            goal=goal,
            query=query,
            conversation_history=conversation_history
        )

        # 3. Freshness Routing & Web Research (Stage 8)
        freshness, _, _ = FreshnessClassifier.classify(query)
        if freshness == "FRESH":
            logger.info(f"AI_FRESHNESS_TRIGGERED [corr_id={corr_id}] query='{query[:50]}' -> performing web research")
            web_results = WebResearchService.search(query)
            if web_results:
                for wr in web_results:
                    context.web_citations.append(GroundedSource(
                        type="web",
                        title=wr.title,
                        url=wr.url,
                        source_provider=wr.provider,
                        retrieval_date=wr.retrieval_date,
                        verification_status=wr.verification_status
                    ))

        # 4. Provider Selection
        configured_provider = getattr(settings, "AI_PROVIDER", "gemini").lower()
        if configured_provider == "groq":
            provider = self.groq_provider
            logger.info(f"AI_PROVIDER_SELECTED [corr_id={corr_id}] provider=groq")
        elif configured_provider == "deterministic":
            provider = self.deterministic_provider
            logger.info(f"AI_PROVIDER_SELECTED [corr_id={corr_id}] provider=deterministic")
        else:
            provider = self.gemini_provider
            logger.info(f"AI_PROVIDER_SELECTED [corr_id={corr_id}] provider=gemini")

        # 5. Generate Response with Zero-Downtime Fallback
        try:
            raw_response = provider.generate_coach_response(context)
        except Exception as ex:
            logger.warning(f"AI provider {configured_provider} raised exception: {ex}. Falling back cleanly to deterministic.")
            raw_response = self.deterministic_provider.generate_coach_response(context)
            raw_response.is_fallback = True

        raw_response.correlation_id = corr_id

        # Attach web citations to response sources if not already present
        if context.web_citations:
            existing_urls = {s.url for s in raw_response.sources if s.url}
            for wc in context.web_citations:
                if wc.url not in existing_urls:
                    raw_response.sources.append(wc)

        # 6. Validate Action Proposals
        if raw_response.suggested_actions:
            validated_actions = self.action_validator.validate_actions(
                proposals=raw_response.suggested_actions,
                profile=profile
            )
            raw_response.suggested_actions = validated_actions

        raw_response.latency_ms = round((time.time() - t0) * 1000, 2)
        
        if raw_response.is_fallback:
            logger.info(f"AI_FALLBACK_USED [corr_id={corr_id}] latency={raw_response.latency_ms}ms")
        else:
            logger.info(f"AI_PROVIDER_SUCCESS [corr_id={corr_id}] latency={raw_response.latency_ms}ms")

        return raw_response
