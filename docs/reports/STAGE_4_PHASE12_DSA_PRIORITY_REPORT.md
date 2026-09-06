# Phase 12 — Stage 4 Engineering Report: Role-Specific DSA Priority Engine

## Executive Summary
Stage 4 of Phase 12 establishes the role-aware and company-aware Data Structures & Algorithms (DSA) Priority Intelligence layer for PathFinder. Rather than imposing a monolithic, one-size-fits-all DSA curriculum across technical careers, PathFinder now dynamically evaluates the specific relevance, expected mastery depth (`FOUNDATIONAL`, `WORKING`, `PROFICIENT`, `ADVANCED`, `EXPERT`), target difficulties (`EASY`, `MEDIUM`, `HARD`), and prerequisite chains for any professional role across enterprise employers and canonical careers.

Crucially, the system enforces a strict 4-tier provenance hierarchy (`COMPANY_ROLE` $\succ$ `ROLE` $\succ$ `CAREER` $\succ$ `INDUSTRY`), renders non-software professions (e.g. Graphic Designer, Nurse, Accountant, Civil Engineer) deterministically as `NOT_APPLICABLE` with zero DSA requirement, leaves unverified signals as `UNKNOWN`, and explains every priority assignment via `UniversalDecisionTrace`.

---

## 1. Architectural Implementation

### A. Model & Data Structures
- **File**: [`backend/app/models/dsa_priority.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/models/dsa_priority.py)
- **Class**: `DSAPriorityProfile`
  - Captures `priority_level` (`VERY_HIGH`, `HIGH`, `MEDIUM`, `LOW`, `MINIMAL`, `NOT_APPLICABLE`, `UNKNOWN`).
  - Captures `expected_level` (`FOUNDATIONAL`, `WORKING`, `PROFICIENT`, `ADVANCED`, `EXPERT`).
  - Stores difficulty expectations: `minimum_difficulty`, `recommended_difficulty`, and `interview_difficulty`.
  - Records provenance: `source_level`, `confidence`, `source`, `verification_status`.
  - Links to `CompanyRole`, `Company`, and `Career`.

### B. Priority Intelligence Service
- **File**: [`backend/app/dsa/dsa_priority_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/dsa/dsa_priority_service.py)
- **Class**: `DSAPriorityService`
  - **4-Tier Provenance Hierarchy**:
    1. **Tier 1 (`COMPANY_ROLE`)**: Verified specific company-role evidence (e.g. Google SWE L3 blueprint) where `verification_status == "VERIFIED"` and confidence is 1.0.
    2. **Tier 2 (`ROLE`)**: Canonical role benchmark intelligence derived from industry role standards (confidence 0.85).
    3. **Tier 3 (`CAREER`)**: Canonical career taxonomy fallback when role specifics are unindexed (confidence 0.70).
    4. **Tier 4 (`INDUSTRY`)**: Fallback with `UNKNOWN` flags.
  - **Non-Software Domain Guardrails**: Roles such as Graphic Designer, Video Editor, Nurse, Accountant, Civil Engineer, and Product Designer are classified as `NOT_APPLICABLE` without generating artificial DSA burdens.
  - **Prerequisite Awareness**: Connects with Stage 2 `DSATopic` graph to identify prerequisite dependencies (e.g. Dynamic Programming requires Recursion/Memoization).
  - **Explainability**: Emits a `decision_trace` with structured factors, weights, and rationale.

### C. API Endpoints
- **Endpoints in `backend/app/api/v1/companies.py`**:
  - `GET /api/v1/companies/{company_slug}/roles/{role_slug}/dsa`
  - `GET /api/v1/companies/{company_slug}/roles/{role_slug}/dsa-profile`
  - `GET /api/v1/companies/roles/{role_id}/dsa-priority`

### D. Frontend Components
- **Files**:
  - [`frontend/src/components/dsa/DSAPriorityBadge.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/dsa/DSAPriorityBadge.tsx): Color-coded priority badges with semantic styling.
  - [`frontend/src/components/dsa/CompanyDSAProfile.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/dsa/CompanyDSAProfile.tsx): Comprehensive UI widget showing target difficulties, core vs secondary topic splits, prerequisite links, and algorithmic DecisionTrace.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage4_role_dsa_priority.py`
- **Result**: **10 passed out of 10 tests (100%) in 0.47s**.
- **Coverage**:
  - `test_software_engineer_benchmark_priority`: Passed (VERY_HIGH, ADVANCED, HARD interview target).
  - `test_backend_engineer_priority`: Passed (HIGH, PROFICIENT, MEDIUM target).
  - `test_frontend_engineer_priority`: Passed (MEDIUM, WORKING).
  - `test_devops_and_cloud_low_priority`: Passed (LOW, FOUNDATIONAL).
  - `test_vlsi_minimal_priority`: Passed (MINIMAL, bit manipulation focus).
  - `test_non_software_roles_not_applicable`: Passed (6 non-software roles checked).
  - `test_company_role_verified_tier1`: Passed (Google SWE resolved with Tier 1 evidence).
  - `test_unknown_role_handling`: Passed (UNKNOWN returned cleanly).
  - `test_prerequisites_attached_to_topics`: Passed (Prerequisites attached).
  - `test_api_endpoint_dsa_profile`: Passed (200 OK with full profile).
