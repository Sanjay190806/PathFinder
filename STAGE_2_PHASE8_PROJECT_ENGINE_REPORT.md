# STAGE 2 ? REAL-WORLD PROJECT ENGINE REPORT

## 1. Objective
Transform roadmap skills into multi-milestone applied engineering projects validating implementation, architecture, and deliverable quality.

## 2. Architecture & State Machine
- **State Transitions**: `not_started` ? `in_progress` ? `submitted` ? `completed`.
- **Milestone Persistence**: Sequential milestone tracking with artifact verification.
- **Evidence Integration**: Automatically feeds verified completion evidence into Stage 1 `PracticalCompetencyEngine`.

## 3. Files & Endpoints
- Models: `backend/app/models/project.py` (`ProjectTemplate`, `LearnerProject`, `LearnerProjectMilestone`)
- Engine: `backend/app/projects/project_engine.py`
- Registry: `backend/app/projects/project_registry.py`
- Router: `backend/app/api/v1/projects.py` (`GET /projects`, `POST /{id}/start`, `POST /{id}/milestones/{mid}`, `POST /{id}/submit`)
- Tests: `backend/tests/test_phase8_stage2_projects.py` (2/2 passing)
