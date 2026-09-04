# 🗺️ Phase 9 Stage 3: Career Eligibility & Pathway Intelligence Report

**Module**: Career Eligibility & Pathway Intelligence Engine (Phase 9 - Stage 3)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 3 established the **Career Eligibility & Pathway Intelligence Engine**, transforming high-level career discovery into structured, actionable, and personalized multi-route roadmaps tailored to the Indian education ecosystem.

- **Divergent Purpose**: While Stage 2 identifies *which* careers fit a learner's strengths, Stage 3 provides the exact *blueprint of how to get there*—accounting for academic milestones, vocational entry routes, lateral entry options, and bridge transitions.
- **Deep Integration with Phase 7 `SkillGapEngine`**: Reuses the certified Phase 7 skill gap analysis to evaluate missing competencies against career role prerequisites and dynamically synthesizes the highest-priority immediate next step (`derive_next_step`).
- **Domain Agnostic & Multi-Route Architecture**: Never locks out non-traditional students. Every career offers:
  1. **Standard Academic Route**: Traditional Higher Secondary -> Undergraduate -> Entry-level career path.
  2. **Diploma / Lateral / Vocational Route**: Polytechnic / ITI -> Lateral Entry B.Tech / BCA -> Career.
  3. **Self-Taught / Transition Bridge Route**: For students transitioning from humanities, commerce, or non-CS engineering degrees with prerequisite bridges.

---

## 2. Architecture & Components

### 2.1 Pathway Registry & Requirements Catalog
- **File**: `backend/app/core/pathway_catalog.py`
- Models:
  - `CareerRequirements`: Required degrees, accepted streams/specializations, minimum academic criteria, prerequisite skills, and certification recommendations.
  - `CareerPathway`: Pathway type (`standard_academic`, `diploma_lateral`, `vocational_direct`, `degree_alternative`), target background conditions, and sequential milestones.
  - `PathwayMilestone`: Title, description, duration, stage, key outcomes, and recommended actions.
- Supported Roles: `software-engineer`, `ai-ml-engineer`, `data-scientist`, `cloud-devops-engineer`, `vlsi-hardware-engineer`, `cybersecurity-analyst`.

### 2.2 Pathway Engine
- **File**: `backend/app/career_discovery/pathway_engine.py`
- Core Capabilities:
  - `evaluate_eligibility(profile, career_slug)`: Evaluates academic level, stream, and prerequisites. Returns transparent `status` (`fully_eligible`, `partially_eligible`, `ineligible`), criteria checklist, and actionable guidance.
  - `get_career_pathways(profile, career_slug)`: Evaluates all pathways for the career, uses exact and background matching to mark `is_recommended_for_learner`, and calculates total duration.
  - `derive_next_step(profile, career_slug)`: Integrates `SkillGapEngine` to identify missing competencies, selecting the highest-priority missing skill and generating structured guidance:
    - `immediate_action`: Concrete action item (e.g. "Master foundational Python").
    - `target_skill`: Identifier of the skill.
    - `rationale`: Why this step unlocks the pathway.
    - `eta_days`: Realistic estimation of time required.

### 2.3 API Layer
- **File**: `backend/app/api/v1/pathways.py`
- Registered with prefix `/api/v1/careers` in `backend/app/main.py`:
  - `GET /api/v1/careers/{career_slug}/requirements`: Prerequisites & eligibility criteria.
  - `GET /api/v1/careers/{career_slug}/pathways`: Available multi-route pathways with personalized recommendation flags.
  - `GET /api/v1/careers/{career_slug}/fit`: Quick fit diagnostics for the pathway view.
  - `GET /api/v1/careers/{career_slug}/gaps`: Phase 7 skill gap analysis for the specific career role.
  - `GET /api/v1/careers/{career_slug}/next-step`: Actionable next-step recommendation.

### 2.4 Frontend Visualizer
- **File**: `frontend/src/app/career-pathways/[slug]/page.tsx`
- Features:
  - Route tabs: Switch dynamically between Standard Academic, Diploma / Lateral, and Transition / Bridge pathways.
  - Interactive Milestone Timeline: Visual step-by-step progress cards showing stages, durations, outcomes, and checklists.
  - Eligibility Badge & Criteria Drawer: Displays current eligibility status and prerequisite checks.
  - Dynamic Next-Step Action Widget: Highlights the immediate next milestone with estimated days and action button.
- **Client API**: `frontend/src/lib/api.ts` expanded with dedicated pathway endpoints.

---

## 3. Verification & Test Results

- **Automated Test Suite**: `backend/tests/test_phase9_stage3_pathway.py`
  - `test_get_career_requirements`: Verified requirement catalog retrieval and minimum criteria.
  - `test_evaluate_eligibility`: Verified full eligibility for aligned B.Tech and partial eligibility for transitioning backgrounds.
  - `test_get_career_pathways_recommendations`: Verified accurate pathway recommendation flags for both CSE degrees and Polytechnic diplomas.
  - `test_derive_next_step`: Verified Phase 7 `SkillGapEngine` integration and dynamic next-step synthesis.
  - `test_api_endpoints`: Verified 200 responses from `/requirements`, `/pathways`, and `/next-step`.
  - **Result**: **5 passed / 5 tests** (100%).

- **Frontend Verification**:
  - `npx tsc --noEmit`: 0 errors.
  - Production build: Passing.
