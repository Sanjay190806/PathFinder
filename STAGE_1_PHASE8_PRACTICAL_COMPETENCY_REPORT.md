# STAGE 1 ? PRACTICAL COMPETENCY FOUNDATION REPORT

## 1. Objective
Establish a backend-authoritative practical competency model measuring real-world engineering application separately from theoretical learning state.

## 2. Architecture & Scoring
- **Competency Tiers**: Mastery (0.90+), Strong (0.75+), Competent (0.60+), Developing (0.40+), Beginner (0.20+), Unknown (0.00+).
- **Dimensions**: Concept Application (30%), Problem Solving (20%), Implementation (15%), Debugging (15%), Decision Making (10%), Tools & Discipline (10%).
- **Evidence Abstraction**: `PracticalEvidenceRecord` supporting projects, practical assessments, debugging tasks, scenarios, simulations, and portfolio artifacts.

## 3. Files & Endpoints
- Models: `backend/app/models/practical_competency.py`
- Engine: `backend/app/practical/competency_engine.py`
- Schemas: `backend/app/schemas/practical.py`
- Router: `backend/app/api/v1/practical.py` (`GET /competencies`, `GET /competencies/{slug}`, `POST /evidence`, `GET /evidence`)
- Tests: `backend/tests/test_phase8_stage1_practical_competency.py` (3/3 passing)
