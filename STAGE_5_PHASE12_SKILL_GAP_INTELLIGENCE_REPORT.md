# Phase 12 — Stage 5 Engineering Report: Learner Skill Gap → DSA & Skill Topic Intelligence

## Executive Summary
Stage 5 of Phase 12 bridges company/role expectations with real learner mastery, transforming static enterprise requirements into an individualized, topic-by-topic diagnostic engine. Rather than producing superficial percentage scores, the system evaluates:
1. Target Role & Employer Expectations (from Stages 1–4 verified data).
2. Learner Real-World Evidence (`LearnerSkill`, self-ratings, assessed confidence, and assessment recency).
3. Topic-by-Topic DSA Readiness with prerequisite graph dependency checks.
4. Prerequisite Blockers (e.g. blocking advanced dynamic programming if recursion and tree foundations are weak).
5. Deterministic Selection of the Single Best Next Learning Topic.
6. Differential Company Comparison (e.g., comparing skill gaps between Google and Amazon or Zerodha for the same canonical role).

---

## 1. Architectural Implementation

### A. Intelligence Engine
- **File**: [`backend/app/dsa/learner_dsa_gap_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/dsa/learner_dsa_gap_service.py)
- **Class**: `LearnerDSAGapService`
  - Evaluates both general/domain skills and granular DSA topics.
  - Classifies each requirement into authoritative statuses: `SATISFIED` ($\ge 75\%$), `DEVELOPING` ($40\%-74\%$), `GAP` ($<40\%$), `CRITICAL_GAP` (high-importance required skill $<40\%$), or `UNKNOWN`.
  - Analyzes prerequisite DAG chains: When a learner has a gap in a topic (e.g. `dynamic-programming`), it inspects whether its prerequisites (`recursion`, `arrays`) are also weak. If so, it flags the topic as `is_blocked_by_prerequisite` and emits an unblock recommendation.
  - Ranks candidate unblocked topics to nominate the single highest-yield `next_recommended_topic`.
  - Detects skill decay risk if evidence is older than 180 days.
  - Implements `compare_company_gaps` to inspect differential readiness when changing target employers.

### B. API Endpoints
- **Endpoints in `backend/app/api/v1/companies.py`**:
  - `GET /api/v1/companies/{company_slug}/roles/{role_slug}/learner-gaps?learner_id=...`
  - `GET /api/v1/companies/{company_slug}/roles/{role_slug}/next-topic?learner_id=...`
  - `GET /api/v1/companies/compare/company-gaps?role_slug=...&company_a=...&company_b=...&learner_id=...`

### C. Frontend Components
- **File**: [`frontend/src/components/dsa/SkillGapOverview.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/dsa/SkillGapOverview.tsx)
  - Displays overall alignment percentage and readiness tier.
  - Shows critical skill gap counts and satisfied skill metrics.
  - Features an "Immediate Next Milestone" banner guiding the learner directly to their unblocked next topic.
  - Visualizes prerequisite dependency warnings.
  - Renders topic-by-topic DSA mastery bars with difficulty targets.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage5_skill_gap_mapping.py`
- **Result**: **8 passed out of 8 tests (100%) in 0.73s**.
- **Coverage**:
  - `test_evaluate_learner_gaps_success`: Evaluates learner against Google SWE with full gap breakdown.
  - `test_dsa_satisfaction_and_critical_gaps`: Confirms Arrays (85%) is SATISFIED and Graphs (30%) is CRITICAL_GAP.
  - `test_prerequisite_blocking_detection`: Confirms DP is blocked when Recursion is weak.
  - `test_next_recommended_topic_selection`: Confirms next topic is prerequisite-safe and unblocked.
  - `test_skill_decay_flagging`: Confirms skills assessed > 180 days ago are flagged.
  - `test_compare_company_gaps`: Confirms differential requirements between employers.
  - `test_api_learner_gaps`: HTTP 200 with full learner gap schema.
  - `test_api_next_topic`: HTTP 200 with recommended next topic and blockers.
