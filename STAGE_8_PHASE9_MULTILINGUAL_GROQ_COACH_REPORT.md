# 🌐 Phase 9 Stage 8: Multilingual AI Career & Learning Coach Report

**Module**: Multilingual AI Career & Learning Coach with Real-Time Web Intelligence (Phase 9 - Stage 8)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 8 delivered the **Multilingual AI Career & Learning Coach**, integrating the Groq LLM inference provider (using `llama-3.3-70b-versatile` or configurable models) alongside existing Gemini and Deterministic fallback providers. The coach is grounded dynamically in live learner state: active curriculum milestones, skill gap analytics, decay alerts, daily/weekly planner schedules, and real-time market intelligence.

Key capabilities delivered:
- **Groq LLM Provider**: OpenAI-compatible REST API integration via `GroqProvider` with sub-second inference, configurable models, structured JSON responses, and zero-downtime deterministic fallback.
- **Multilingual Intelligence with Technical Integrity**: Native support across Indian regional languages including Tamil, Hindi, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, and Urdu. Technical terminology (e.g. `Python`, `SQL`, `Machine Learning`, `API`, `Docker`, `Git`, `Loss Function`) is preserved in Latin/English script to maintain clarity while explanations flow naturally in the learner's chosen language.
- **Freshness-Aware Query Routing**: Powered by `FreshnessClassifier`, queries are split into `STATIC` (foundational theory, e.g. "What is gradient descent?") and `FRESH` (current market trends, 2026 course availability, active cohorts, pricing changes).
- **Safe Web Research & Citation Pipeline**: `WebResearchService` performs targeted, SSRF-protected, and rate-bounded web lookups. Snippets pass through `PromptGuard.validate_external_content` to defuse potential indirect prompt injections. Responses return structured citations with clickable URLs, verification status, and retrieval timestamps.
- **Strict Free vs. Paid Explainability**: The coach explicitly differentiates between `100% Genuinely Free`, `Free to Enroll (Paid Certificate)`, `YouTube Free Content`, and `Paid / Subscription Required`, preventing misleading claims.
- **Safe Action Proposals**: Suggested actions (`RECOMMEND_RESOURCE`, `ADD_TO_PLAN`, `SUGGEST_PRACTICE`, `SUGGEST_REVIEW`, `VIEW_OPPORTUNITY`) are strictly validated against catalog existence and prerequisite DAG rules via `ActionValidator`.
- **Global AI Drawer Enhancement**: Live language selector and verified source citation badges integrated directly into `AIAssistantDrawer.tsx` and `CoachMessage.tsx`.

---

## 2. Architecture & Components

### 2.1 Provider & AI Core
- **Groq Provider**: `backend/app/ai/groq_provider.py`
  - Manages API communication with Groq (`llama-3.3-70b-versatile`), injects multilingual and accuracy directives, and parses structured output schema.
- **Deterministic Provider**: `backend/app/ai/deterministic_provider.py`
  - High-availability zero-downtime offline fallback engine supporting multilingual responses in Tamil, Hindi, and Telugu with preserved technical terminology, free/paid pricing explanations, planner grounding, and current-data failure handling.
- **AI Coach Orchestrator**: `backend/app/ai/coach.py`
  - Coordinates input validation (`PromptGuard`), context construction (`ContextBuilder`), freshness routing, provider execution, web citation attachment, and action proposal validation (`ActionValidator`).
- **Context Builder**: `backend/app/ai/context_builder.py`
  - Grounds prompts in learner profile, education stage, stream, specialization, target role, skill gaps, decay alerts, and active `LearnerPlan` (today's tasks and weekly matrix).

### 2.2 Security & Guardrails
- **Prompt Injection Defense**: `backend/app/ai/prompt_guard.py`
  - `validate_user_input`: Blocks jailbreak patterns, secret exfiltration, and system instruction overrides.
  - `validate_external_content`: Neutralizes prompt injection strings and scripts in untrusted third-party web search snippets before injecting into model context.
- **Action Validation**: `backend/app/ai/action_validator.py`
  - Enforces that no database mutations occur without explicit confirmation and ensures recommended resources exist in the active catalog and satisfy prerequisite mastery thresholds.
- **SSRF Defenses**: `backend/app/resources/resource_verifier.py`
  - Blocks loopback, private IPv4/IPv6, and cloud metadata endpoints from web research crawler.

### 2.3 Web Research Service
- **Service**: `backend/app/ai/web_research.py`
  - Performs bounded web searches, validates link safety, verifies reachability, and returns `WebSearchResult` structures.
  - When external connectivity fails or search yields unverified sources, the system safely reports: `"Current information could not be verified."`

### 2.4 API Integration
- **Router**: `backend/app/api/v1/ai_chat.py`
  - `POST /api/v1/ai/chat`: Interactive grounded chat supporting `preferred_language` override, structured sources, and validated action suggestions.
  - `GET /api/v1/ai/languages`: Returns supported Indian regional languages (code, name, native script).
  - `GET /api/v1/ai/capabilities`: Returns configured provider, model, web search availability, and freshness routing status.
  - `GET /api/v1/ai/context`: Returns authenticated learner's live coaching snapshot.

### 2.5 Frontend Interactive Interface
- **Drawer**: `frontend/src/components/AIAssistantDrawer.tsx`
  - Global drawer with language switcher dropdown (English, Tamil, Hindi, Telugu, etc.).
- **Message Cards**: `frontend/src/components/coach/CoachMessage.tsx`
  - High-contrast message bubbles displaying verified web citations, external links, and actionable buttons.
- **Header**: `frontend/src/components/coach/CoachHeader.tsx`
  - Live Grounded and Fresh Web Intel status indicators.

---

## 3. Verification & Test Results

- **Targeted Test Suite**: `backend/tests/test_phase9_stage8_multilingual_coach.py`
  1. `test_stage8_01_groq_provider_initialization`: Confirmed API key and model config.
  2. `test_stage8_02_03_provider_failure_and_fallback`: Verified zero-downtime deterministic fallback.
  3. `test_stage8_04_stable_question`: Verified STATIC classification for conceptual queries.
  4. `test_stage8_05_fresh_question`: Verified FRESH classification for time-sensitive queries.
  5. `test_stage8_06_07_web_search_routing_and_citations`: Verified structured web search results.
  6. `test_stage8_08_current_data_failure`: Verified safe failure message when current data cannot be verified.
  7. `test_stage8_09_prompt_injection`: Verified prompt injection rejection.
  8. `test_stage8_10_malicious_web_content`: Verified neutralization of external prompt injections.
  9. `test_stage8_11_12_free_and_paid_classification`: Verified free/audit/paid taxonomy distinction.
  10. `test_stage8_13_resource_search`: Verified resource catalog lookup and recommendation proposal.
  11. `test_stage8_14_tamil_response_preserving_terms`: Verified Tamil output with technical terms in Latin script.
  12. `test_stage8_15_hindi_response_preserving_terms`: Verified Hindi output with technical terms in Latin script.
  13. `test_stage8_16_english_response`: Verified standard English output.
  14. `test_stage8_17_unsupported_language_fallback`: Verified clean fallback to English for unsupported languages.
  15. `test_stage8_18_19_user_isolation_and_context`: Verified authenticated user context isolation.
  16. `test_stage8_20_planner_grounding`: Verified today's focus and weekly schedule grounding.
  17. `test_stage8_21_skill_gap_grounding`: Verified skill gap awareness.
  18. `test_stage8_22_market_grounding`: Verified market trend signal grounding.
  19. `test_stage8_23_opportunity_grounding`: Verified opportunity and internship grounding.
  20. `test_stage8_24_action_validator_and_api`: Verified `/ai/capabilities`, `/ai/languages`, and action proposals.
- **Results**: **20/20 passing** tests in 2.72s.
- **TypeScript Verification**: Zero compilation errors across all frontend files.
