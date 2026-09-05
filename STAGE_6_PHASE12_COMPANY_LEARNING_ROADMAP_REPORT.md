# Phase 12 — Stage 6 Engineering Report: Career + Company Learning Roadmap Engine

## Executive Summary
Stage 6 of Phase 12 establishes the Company-Aware Learning Roadmap layer for PathFinder. It unifies target Career, Employer, Role, Verified Requirements, DSA Topic Priorities, Learner Skill Gaps, and Prerequisite Graphs into a personalized, 7-stage learning journey.

Rather than static generic roadmaps, PathFinder now synthesizes distinct roadmaps tailored to the specific hiring expectations of each enterprise (e.g. Google's high-scale algorithmic rigor vs NVIDIA's hardware-oriented concurrency and systems vs Zerodha's Go and high-throughput networking). Prerequisite dependencies are enforced such that unmastered foundational topics mark downstream items as `LOCKED`, already-satisfied topics are marked `COMPLETED`, target difficulty progresses sequentially (`EASY` $\rightarrow$ `MEDIUM` $\rightarrow$ `HARD`), and roadmap versions are incremented on employer switch while preserving completed progress.

---

## 1. Architectural Implementation

### A. Core Engine & Service
- **File**: [`backend/app/roadmap/company_roadmap_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/roadmap/company_roadmap_service.py)
- **Class**: `CompanyRoadmapService`
  - **7 Sequenced Stages**:
    1. `FOUNDATION`: Programming language basics, syntax fluency, and elementary Array/String operations.
    2. `CORE`: Fundamental DSA (Hashing, Trees, Stacks, Queues, Binary Search).
    3. `INTERMEDIATE`: Graph Algorithms, Heaps, and Relational Databases/SQL optimization.
    4. `ADVANCED`: Dynamic Programming, Advanced Graph Optimization, and Distributed System Design.
    5. `ROLE_PREPARATION`: Target company technology stack and frameworks (e.g. PyTorch, Go, Verilog).
    6. `COMPANY_PREPARATION`: Portfolio capstone project milestone mirroring production standards.
    7. `INTERVIEW_PREPARATION`: Full-length timed mock technical interview and leadership principles simulation.
  - **Prerequisite Ordering & Dynamic Locking**:
    - Queries learner mastery from Stage 5 gap intelligence.
    - If a learner has satisfied a skill or topic, it is tagged `COMPLETED`.
    - If an item's prerequisites are not completed, the item is tagged `LOCKED` with an explanation.
    - Otherwise, items are marked `AVAILABLE` or `IN_PROGRESS`.
  - **Company Switching & Versioning**:
    - Incrementing roadmap version (`version = old_version + 1`).
    - Recording transparent `change_reason`.
    - Preserving completed status of all transferable skills.
  - **Planner Integration**:
    - Method `get_planner_handoff` transforms the roadmap into a structured, prioritized schedule payload for the Phase 9 Daily/Weekly Planner.

### B. Schemas & Data Transfer Objects
- **File**: [`backend/app/schemas/company_roadmap.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/schemas/company_roadmap.py)
  - `RoadmapItemResponse`, `RoadmapStageResponse`, `CompanyRoadmapResponse`, `SwitchCompanyRequest`, `PlannerHandoffResponse`.

### C. API Endpoints
- **File**: [`backend/app/api/v1/company_roadmaps.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/api/v1/company_roadmaps.py)
  - `GET /api/v1/company-roadmaps/generate`: Generate/fetch personalized company roadmap.
  - `GET /api/v1/company-roadmaps/{roadmap_id}`: Retrieve roadmap by ID.
  - `POST /api/v1/company-roadmaps/{roadmap_id}/switch-company`: Switch employer and generate new version.
  - `GET /api/v1/company-roadmaps/{roadmap_id}/planner-handoff`: Export to Phase 9 Planner.

### D. Frontend Components & Pages
- **Component**: [`frontend/src/components/roadmap/CompanyAwareRoadmap.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/roadmap/CompanyAwareRoadmap.tsx)
  - Interactive roadmap viewer with progress percentage, version indicator, stage breakdown, prerequisite locks, and filters (All, DSA, Skills & Tech, Projects, Interview Prep).
- **Page**: [`frontend/src/app/roadmaps/company-target/page.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/app/roadmaps/company-target/page.tsx)
  - Explorer page with company/role selectors and live roadmap generation.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage6_company_learning_roadmap.py`
- **Result**: **8 passed out of 8 tests (100%) in 1.00s**.
- **Coverage**:
  - `test_generate_company_roadmap`: Confirms 7 stages, estimated hours, and DecisionTrace.
  - `test_prerequisite_ordering_and_locking`: Confirms Arrays is COMPLETED and Graphs is LOCKED.
  - `test_difficulty_progression`: Confirms EASY $\rightarrow$ MEDIUM $\rightarrow$ HARD progression.
  - `test_switch_target_company`: Confirms switching to Zerodha increments version and tracks change reason.
  - `test_planner_handoff_format`: Confirms conversion to Phase 9 Planner format.
  - `test_api_generate_and_get_roadmap`: Confirms HTTP 200 on generate and get.
  - `test_api_switch_company`: Confirms HTTP 200 on company switch.
  - `test_api_planner_handoff`: Confirms HTTP 200 on planner handoff.
