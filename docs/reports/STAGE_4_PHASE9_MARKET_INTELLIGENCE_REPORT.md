# 📈 Phase 9 Stage 4: Live Career / Market Intelligence Report

**Module**: Live Career & Market Intelligence Layer (Phase 9 - Stage 4)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 4 established the **Live Career / Market Intelligence Layer**, enabling PathFinder to distinguish stable educational concepts from fresh, time-sensitive industry signals and enrich career pathways with verified Indian and global market dynamics.

- **Freshness-Aware Architecture**: Implements a deterministic `FreshnessClassifier` separating timeless fundamentals ("What is gradient descent?") from volatile market conditions ("Latest hiring trends for AI/ML in 2026").
- **Provider Abstraction**: Decouples intelligence retrieval into an extensible `CareerMarketProvider` with `LiveCareerMarketProvider`, `WebResearchProvider`, and a production-ready `GroqProvider` (with zero-downtime deterministic fallback).
- **India-First Regional Signals**: Captures technology demand and emerging skill surges across key Indian hubs (Bengaluru, Hyderabad, Chennai, Pune, Delhi NCR, and National) without fabricating claims.
- **Strict Provenance & Trust**: Every market signal stores `source`, `source_type`, `observed_at`, `confidence`, `region`, `country`, and `time_window`.
- **Defensive Engineering**: External web pages and search queries are strictly treated as untrusted **DATA**—sanitized against prompt injection and filtered against SSRF attacks.

---

## 2. Architecture & Components

### 2.1 Freshness Classifier
- **File**: `backend/app/ai/freshness_classifier.py`
- Distinguishes queries into:
  - `STATIC`: Theoretical foundations, computer science concepts, and curriculum inquiries.
  - `FRESH`: Active cohorts, enrollment status, hiring demand, pricing/cost, and technological trends.

### 2.2 Provider Abstraction & Groq Integration
- **Files**:
  - `backend/app/ai/groq_provider.py`: OpenAI-compatible REST integration using `httpx.Client`, reading `settings.GROQ_API_KEY` and `settings.GROQ_MODEL` (`llama-3.3-70b-versatile`). Automatically falls back to `DeterministicProvider` when unconfigured or offline.
  - `backend/app/intelligence/live_market_provider.py`: Base abstract class `CareerMarketProvider` and `LiveCareerMarketProvider` managing structured `MarketSignal` models.
  - `MockWebResearchProvider`: Deterministic research provider for CI/CD and offline test suites.

### 2.3 Bounded Cache with Expiration & Stale Fallback
- `LiveCareerMarketProvider` maintains an in-memory cache keyed by `(role, skill, region, category, query)`.
- Configurable TTL (`settings.MARKET_INTELLIGENCE_CACHE_HOURS = 24`).
- If external research fails or is unavailable, cached signals serve as an explicit stale fallback.

### 2.4 Security & SSRF Defense
- **Prompt Injection Defense**: Strips system command overrides, ignore-instruction directives, and embedded scripts via `sanitize_text()`.
- **SSRF Protection**: `_is_safe_url()` validates scheme (`http`/`https` only) and rejects private IP spaces (`127.0.0.1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `localhost`, `::1`).

### 2.5 API Layer
- **File**: `backend/app/api/v1/market_intelligence.py`
- Endpoints:
  - `GET /api/v1/market-intelligence`: Public query endpoint with freshness classification and regional filtering.
  - `GET /api/v1/market-intelligence/{career_slug}`: Market signals tailored to a specific career role.
  - `GET /api/v1/market-intelligence/{career_slug}/skills`: Breakdown of emerging vs. in-demand skills for a career.
  - `POST /api/v1/market-intelligence/search`: Authenticated endpoint for personalized learner query searches.

---

## 3. Verification & Test Results

- **Targeted Test Suite**: `backend/tests/test_phase9_stage4_market_intelligence.py`
  - `test_freshness_classification_stable_vs_fresh`: Verified static vs fresh query classification.
  - `test_market_provider_interface_and_normalization`: Verified signal normalization and bounded scores.
  - `test_url_safety_and_ssrf_rejection`: Verified rejection of internal/private IPs and safe acceptance of public URLs.
  - `test_prompt_injection_defense_in_web_content`: Verified stripping of malicious prompt override text.
  - `test_caching_and_expiry`: Verified in-memory caching and TTL expiration refresh.
  - `test_api_public_and_authenticated_endpoints`: Verified 200 responses for public endpoints, 404 for invalid slugs, and 401 for unauthenticated POST searches.
  - `test_groq_provider_clean_fallback`: Verified graceful degradation to `DeterministicProvider`.
  - **Result**: **7 passed / 7 tests** (100%).

- **Phase 7 Market Regression**:
  - `backend/tests/test_phase7_stage6_market.py`: **3 passed / 3 tests** (100%).

---

## 4. Limitations & Scope Boundary
- Market signals are observational demand indicators, not deterministic job placement guarantees.
- Regional trends are restricted to verified sources (e.g. NASSCOM, MeitY, India Semiconductor Mission).
- Stages 5 and 6 build directly upon this foundation to discover verified learning resources and validate links and pricing.
