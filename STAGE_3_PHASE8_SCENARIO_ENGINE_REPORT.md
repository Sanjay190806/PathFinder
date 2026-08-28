# STAGE 3 ? ENGINEERING SCENARIO & SIMULATION ENGINE REPORT

## 1. Objective
Present learners with production incident responses, architecture decisions, and debugging scenarios evaluating tradeoff choices and reasoning.

## 2. Architecture & Rubric
- **Evaluation Dimensions**: Technical Correctness (30%), Reasoning Depth (20%), Risk Awareness (15%), Tradeoff Quality (15%), Prioritization (10%), Communication (10%).
- **Attempt History**: Immutable attempts capturing choices and written rationale.

## 3. Files & Endpoints
- Models: `backend/app/models/scenario.py` (`EngineeringScenario`, `ScenarioAttempt`)
- Engine: `backend/app/scenarios/scenario_engine.py`
- Registry: `backend/app/scenarios/scenario_registry.py`
- Router: `backend/app/api/v1/scenarios.py` (`GET /scenarios`, `POST /{id}/submit`, `GET /attempts`)
- Tests: `backend/tests/test_phase8_stage3_scenarios.py` (2/2 passing)
