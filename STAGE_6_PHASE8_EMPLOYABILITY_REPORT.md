# STAGE 6 ? EMPLOYABILITY & PRACTICAL READINESS ENGINE REPORT

## 1. Objective
Unify Phase 7 theoretical career readiness with Phase 8 practical engineering competency and verified portfolio evidence.

## 2. Architecture & Composite Model
- **Employability Formula**:
  $$\text{Employability} = 0.35 \cdot \text{CareerReadiness} + 0.35 \cdot \text{PracticalReadiness} + 0.15 \cdot \text{PortfolioEvidence} + 0.10 \cdot \text{MarketAlignment} + 0.05 \cdot \text{Freshness}$$
- **Readiness Tiers**: Strongly Demonstrated (90+), Job-Ready Track (75+), Interview Preparation (60+), Developing (40+), Early Development (20+), Foundation Required (0+).
- **High-Impact Action Priorities**: Deterministically generated actions targeting missing projects, assessments, or portfolio artifacts.

## 3. Files & Endpoints
- Engine: `backend/app/employability/employability_engine.py`
- Schemas: `backend/app/schemas/employability.py`
- Router: `backend/app/api/v1/employability.py` (`GET /employability`)
- Tests: `backend/tests/test_phase8_stage6_employability.py` (3/3 passing)
