# STAGE 8 ? ADVANCED AI CAREER COACH REPORT

## 1. Objective
Upgrade the AI Career Coach into a grounded Career Intelligence Coach reasoning over behavior, velocity, mastery, decay, skill gaps, market signals, and readiness.

## 2. Architecture & Grounding
- **Context Builder**: Ingests authoritative upstream intelligence (velocity, readiness estimate, critical blockers, decay alerts, market demand).
- **Intent Detector**: Expanded with `READINESS_QUERY`, `SKILL_GAP_QUERY`, `MARKET_QUERY`, `REVIEW_NEEDED`.
- **Security Invariants**: `PromptGuard` defense against system prompt extraction and jailbreaks; `ActionValidator` preventing unauthorized state mutation; deterministic offline fallback via `DeterministicProvider`.

## 3. Files & Endpoints
- `backend/app/ai/provider.py`: Extended `GroundedContext`.
- `backend/app/ai/context_builder.py`: Context enrichment with intelligence signals.
- `backend/app/ai/intent_detector.py`: Deterministic intent classification.
- `backend/app/ai/deterministic_provider.py`: Grounded intent handlers.
- `backend/tests/test_phase7_stage8_coach.py`: 3/3 tests passing.
