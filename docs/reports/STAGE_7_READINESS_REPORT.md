# STAGE 7 ? OPPORTUNITY & READINESS ENGINE REPORT

## 1. Objective
Implement a multi-signal deterministic readiness estimation engine evaluating career competency, prerequisite completion, skill freshness, and critical blocker penalties.

## 2. Architecture & Algorithms
- **Deterministic Formula**:
  $$\text{readiness\_score} = \text{clamp}(0, 100, (0.45 \cdot \text{competency} + 0.25 \cdot \text{prerequisites} + 0.20 \cdot \text{freshness} - \text{blocker\_penalty}) \times 100)$$
- **Readiness Levels**:
  - $85\text{--}100$: Career Ready
  - $70\text{--}84.9$: Near Ready
  - $50\text{--}69.9$: Developing Readiness
  - $25\text{--}49.9$: Early Preparation
  - $0\text{--}24.9$: Not Ready
- **High-Impact Actions**: Deterministic generation of prioritized next steps (blocker resolution, skill refresh, core advancement).

## 3. Files & Endpoints
- `backend/app/intelligence/readiness_engine.py`: `OpportunityReadinessEngine`.
- `backend/app/api/v1/intelligence.py`: `GET /api/v1/intelligence/readiness`.
- `backend/tests/test_phase7_stage7_readiness.py`: 4/4 tests passing.
