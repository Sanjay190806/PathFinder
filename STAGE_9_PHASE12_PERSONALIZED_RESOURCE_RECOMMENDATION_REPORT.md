# Phase 12 — Stage 9 Engineering Report: Personalized Company-Aware Course & Resource Recommendation Engine

## Executive Summary
Stage 9 of Phase 12 achieves the ultimate goal of the PathFinder learning intelligence chain: transforming Company Requirements $\rightarrow$ Role Evidence $\rightarrow$ Role DSA Priorities $\rightarrow$ Learner Skill Gaps $\rightarrow$ Prerequisite Graphs $\rightarrow$ Roadmaps into an individual, actionable, multi-format learning recommendation sequence.

Rather than presenting an undifferentiated list of external links, PathFinder produces a structured roadmap milestone bundle for each learner:
1. **Primary Recommended Action**: The single highest-priority, prerequisite-safe milestone.
2. **Verified Free Course**: 100% free learning option (MIT OCW, freeCodeCamp, NPTEL).
3. **Structured Paid Course**: In-depth alternative if paid learning is allowed.
4. **Verified YouTube Educational Series**: High-yield playlist walkthrough (Striver, Abdul Bari, NeetCode, CS50).
5. **Direct Practice Problem Sets**: Easy, Medium, and Hard LeetCode/GFG coding exercises.
6. **Assessment Milestone**: Direct link to Phase 10 adaptive assessment for mastery certification.
7. **Algorithmic Decision Trace**: Factual explanation grounded in role priority and learner evidence.

---

## 1. Architectural Implementation

### A. Recommendation Coordination Service
- **File**: [`backend/app/resources/company_recommendation_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/resources/company_recommendation_service.py)
- **Class**: `CompanyRecommendationService`
  - Extends the existing `RecommendationEngine` and `UniversalDecisionTrace`.
  - Determines the immediate next milestone (`critical_next`) based on unmastered, prerequisite-cleared topics from Stage 5 gap evaluation.
  - Assembles multi-resource alternatives per milestone: Verified Free Course, Paid/Audit Alternative, YouTube Series, and Practice Problem Set.
  - Segregates remaining milestones into `high_priority` and `recommended` queues.
  - Respects budget preferences (`FREE` vs `PAID_ALLOWED`), strictly prioritizing 100% free learning for budget-conscious learners.
  - Filters out already-completed resources (`Progress.status == "completed"`).
  - Emits structured topic-by-topic data for the DSA Readiness Dashboard.

### B. API Endpoints
- **File**: [`backend/app/api/v1/recommendations.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/api/v1/recommendations.py)
  - `GET /api/v1/recommendations/company-role-learning`: Returns multi-resource personalized recommendations for target employer and role.
  - `GET /api/v1/recommendations/dsa-dashboard`: Returns structured topic-by-topic readiness metrics.

### C. Frontend Components
- **File**: [`frontend/src/components/roadmap/CompanyResourceRecommendations.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/roadmap/CompanyResourceRecommendations.tsx)
  - Interactive multi-format tab interface (Verified Free Course, Structured Course, YouTube Playlist, Coding Practice).
  - Visual budget toggle (`100% Free` vs `Paid Allowed`).
  - Highlights the algorithmic DecisionTrace grounding.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage9_personalized_recommendations.py`
- **Result**: **6 passed out of 6 tests (100%) in 1.30s**.
- **Coverage**:
  - `test_personalized_recommendation_synthesis`: Verified synthesis of Google SWE recommendations with critical next focus, practice problems, and DecisionTrace.
  - `test_budget_free_preference`: Verified free course selection under budget=FREE.
  - `test_dsa_readiness_dashboard`: Verified overall readiness percentage and topic-level evaluations.
  - `test_non_software_recommendation_graphic_designer`: Verified recommendation for Graphic Designer without forcing DSA.
  - `test_api_company_role_learning`: HTTP 200 with full recommendation payload.
  - `test_api_dsa_dashboard`: HTTP 200 with structured topic metrics.
