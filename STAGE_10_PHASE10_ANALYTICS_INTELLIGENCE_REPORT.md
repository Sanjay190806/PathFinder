# Phase 10 — Stage 10: Advanced Learning Analytics & Accurate Assessment Intelligence Report

**Project**: PathFinder Adaptive Career Intelligence, Assessment & Learning Platform  
**Phase**: 10 (Syllabus Intelligence, Secure Exam Runtime & Assessment Architecture)  
**Stage**: 10 (Advanced Learning Analytics & Accurate Assessment Intelligence)  
**Date**: September 5, 2026  
**Status**: COMPLETE & PRODUCTION READY

---

## 1. Executive Summary

Phase 10 Stage 10 establishes a trustworthy, backend-authoritative learning and assessment analytics engine for PathFinder. It eliminates fabricated or independently calculated frontend metrics and replaces them with mathematical projections directly derived from authoritative database records (`Progress`, `AssessmentSession`, `AssessmentAttemptEvidence`, `BehaviorEvent`, `LearnerPlan`, `SkillMasteryEngine`, and `OpportunityReadinessEngine`).

Crucially, the system enforces **academic vs. integrity separation**, ensuring that proctored webcam or gadget integrity flags never contaminate academic score averages, and invalid attempts are excluded from pass rates while remaining transparently audited.

---

## 2. Analytics Architecture & Canonical Source of Truth

```mermaid
flowchart TD
    subgraph Storage["Authoritative Domain Entities"]
        P[Progress / Courses]
        AS[AssessmentSession & Evidence]
        BE[BehaviorEvents]
        LP[LearnerPlan / Planner]
        RE[ReadinessEngine]
        ME[MasteryEngine & GapEngine]
    end

    subgraph AnalyticsCore["Backend Analytics Intelligence Layer"]
        MDR[Metric Definitions Registry]
        AAE[AuthoritativeAnalyticsEngine]
    end

    subgraph API["FastAPI Endpoints /api/v1/analytics/*"]
        O[/overview]
        C[/courses]
        A[/assessments]
        S[/modules & /topics]
        SK[/skills & /mastery]
        L[/learning]
        PL[/planner]
        CR[/career-readiness]
        I[/integrity]
        D[/definitions]
    end

    subgraph UI["Frontend Dashboard (/analytics)"]
        KPI[Authoritative KPIs Bar]
        CT[Course Progress & Assessment Performance]
        SM[Syllabus Module & Topic Mastery]
        SR[Skill Mastery & Career Readiness]
        CP[Consistency Streak & Planner Execution]
        IA[Integrity Proctoring Audit]
        MDM[Metric Definitions Modal]
    end

    Storage --> AAE
    MDR --> AAE
    AAE --> API
    API --> UI
```

---

## 3. Canonical Metric Definitions & Formulas

| Metric Key | Display Name | Authoritative Source | Exact Mathematical Formula | Freshness |
| :--- | :--- | :--- | :--- | :--- |
| `courses_started` | Courses Started | `Progress` records | `count(distinct resource_id where status in ['in_progress', 'completed'])` | LIVE |
| `courses_completed` | Courses Completed | `Progress (status == 'completed')` | `count(distinct resource_id where status == 'completed')` | LIVE |
| `course_completion_rate`| Completion Rate | `Progress` | `(courses_completed / courses_started) * 100.0` (or `None` if 0) | LIVE |
| `assessments_taken` | Total Assessments | `AssessmentSession` | `count(AssessmentSession)` | LIVE |
| `assessment_pass_rate` | Pass Rate | Valid `AssessmentSession` | `(passed_valid_attempts / total_valid_attempts) * 100.0` | LIVE |
| `average_assessment_score`| Average Score | Valid `AssessmentSession` | `mean(valid_session.percentage)` (excludes `INVALIDATED`) | LIVE |
| `learning_hours` | Qualifying Study Effort | `Progress (time_spent_minutes)` | `sum(time_spent_minutes) / 60.0` (excludes exam duration) | LIVE |
| `learning_streak` | Learning Streak | Qualifying `BehaviorEvent` & `Progress` | Consecutive days with qualifying study activity | LIVE |
| `module_accuracy` | Module Accuracy | `AssessmentAttemptEvidence` | `(sum(earned_marks) / sum(max_marks)) * 100.0` | LIVE |
| `topic_accuracy` | Topic Accuracy | `AssessmentAttemptEvidence` | `(sum(earned_marks) / sum(max_marks)) * 100.0` | LIVE |
| `planner_completion_rate`| Plan Execution | `LearnerPlan` | `(completed_tasks / total_scheduled_tasks) * 100.0` | LIVE |
| `career_readiness` | Readiness Index | `OpportunityReadinessEngine` | Synthesized composite across technical & practical readiness | LIVE |

---

## 4. Academic vs. Integrity Result Separation

In adherence to PathFinder security principles:
1. **Academic Pass Rate**:
   Calculated strictly as `(Passed Valid Attempts / Total Valid Attempts) * 100%`.
   Any attempt with `integrity_state == "INVALIDATED"` is completely excluded from academic pass-rate and average-score calculations.
2. **Integrity Audit Card**:
   Maintained in a dedicated privacy-conscious section showing:
   - Monitored exams taken
   - Warnings issued (by policy engine)
   - Camera glitches / interruptions
   - Review-required sessions
   - Invalidated sessions
   - Transparent disclaimer: *"Integrity monitoring records probabilistic events for proctoring review. It is never a definitive cheating score."*

---

## 5. Explicit Missing Data Handling (`NOT_AVAILABLE`)

PathFinder never displays `0%` when no data exists:
- A learner with no started courses receives `course_completion_rate: null` (UI renders `"Not Available"`).
- A learner with no completed assessments receives `assessment_pass_rate: null` (UI renders `"No Attempts"`).
- A learner with no module attempts receives `mastery_signal: "NOT_EVALUATED"`.

---

## 6. Verification & Automated Testing Evidence

### Backend Test Suite (`test_phase10_stage10_analytics.py`):
- `test_stage10_01_course_counts_and_completion_rate`: **PASSED** (verifies 3 started, 2 completed, 1 in progress -> 66.7% completion rate, 6.0 study hours).
- `test_stage10_02_assessment_pass_rate_and_integrity_separation`: **PASSED** (verifies 1 pass, 1 fail, 1 invalidated -> 50% pass rate, 60% avg score, invalidated excluded).
- `test_stage10_03_syllabus_module_and_topic_analytics`: **PASSED** (verifies questions correct/attempted and marks earned/max for modules, topics, and objectives).
- `test_stage10_04_learning_consistency_qualifying_streak`: **PASSED** (verifies AI chat/page views do not count, only qualifying study sessions).
- `test_stage10_05_metric_definitions_registry`: **PASSED** (verifies metadata definitions returned).
- `test_stage10_06_security_and_idor_protection`: **PASSED** (verifies cross-user privacy isolation).

### Full Phase 10 Regression Suite:
**76 passed out of 76 tests across Stages 1 to 10** (100% pass rate).

---

## 7. Delivery Summary

| Component | File Location | Purpose |
| :--- | :--- | :--- |
| **Definitions Registry** | `backend/app/analytics/metric_definitions.py` | Central catalog of formulas, sources, versions |
| **Analytics Engine** | `backend/app/analytics/engine.py` | Backend-authoritative metric calculations |
| **Analytics Schemas** | `backend/app/schemas/analytics.py` | Pydantic models for Stage 10 projections |
| **Analytics Router** | `backend/app/api/v1/analytics.py` | REST API endpoints with IDOR security |
| **Test Suite** | `backend/tests/test_phase10_stage10_analytics.py` | Comprehensive test verification |
| **Frontend Types** | `frontend/src/lib/types.ts` | TypeScript interfaces for Stage 10 |
| **Frontend API** | `frontend/src/lib/api.ts` | Client methods for all analytics endpoints |
| **KPI Bar** | `frontend/src/components/analytics/OverviewAuthoritativeKPIs.tsx` | Overview KPIs with freshness badges |
| **Course & Exam UI** | `frontend/src/components/analytics/CourseAndAssessmentAnalytics.tsx` | Course progress and attempt integrity |
| **Syllabus UI** | `frontend/src/components/analytics/SyllabusMasteryAnalytics.tsx` | Module, topic & objective breakdowns |
| **Skills & Readiness** | `frontend/src/components/analytics/SkillAndReadinessAnalytics.tsx` | Bayesian mastery and career pillars |
| **Consistency & Plan** | `frontend/src/components/analytics/ConsistencyAndPlannerAnalytics.tsx` | 14-day study activity & planner progress |
| **Integrity Audit** | `frontend/src/components/analytics/IntegrityAuditSummary.tsx` | Proctored exam audit card |
| **Definitions Modal** | `frontend/src/components/analytics/MetricDefinitionsModal.tsx` | Full metric transparency modal |
| **Dashboard Page** | `frontend/src/app/analytics/page.tsx` | Tabbed, responsive analytics dashboard |
