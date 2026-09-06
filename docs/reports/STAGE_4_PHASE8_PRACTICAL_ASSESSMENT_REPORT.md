# STAGE 4 ? PRACTICAL ASSESSMENT ENGINE REPORT

## 1. Objective
Evaluate applied engineering implementations via rubric-based practical assessments.

## 2. Architecture & Grading
- **Rubric Dimensions**: Correctness (40%), Engineering Quality (25%), Robustness (20%), Documentation (15%).
- **Verification**: Passing threshold validation with automatic evidence generation.

## 3. Files & Endpoints
- Models: `backend/app/models/practical_assessment.py` (`PracticalAssessment`, `PracticalAssessmentAttempt`)
- Engine: `backend/app/assessment/practical_assessment_engine.py`
- Schemas: `backend/app/schemas/practical_assessment.py`
- Router: `backend/app/api/v1/practical_assessment.py` (`GET /practical-assessments`, `POST /{id}/submit`, `GET /attempts`)
- Tests: `backend/tests/test_phase8_stage4_practical_assessment.py` (2/2 passing)
