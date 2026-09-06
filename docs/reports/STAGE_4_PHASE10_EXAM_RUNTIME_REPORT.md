# Phase 10 — Stage 4: Secure Exam Session, Assessment Runtime & Exam State Management
## Production Release & Architecture Verification Report

**Platform:** PathFinder — India-First Adaptive Career Intelligence & Employability Platform  
**Phase:** Phase 10 (Syllabus-Based Assessment Blueprint & Secure Adaptive Runtime)  
**Stage:** Stage 4 (Secure Exam Session, Assessment Runtime & Exam State Management)  
**Status:** Complete & Verified  
**Tests:** 299/299 Backend Tests Passing (100% Pass Rate, 0 Regressions)  
**Frontend:** 20/20 Routes Compiled Cleanly (Next.js 14 App Router, Zero TypeScript / Lint Errors)  

---

## 1. Executive Summary & Architectural Overview

Phase 10 Stage 4 establishes the **secure, backend-authoritative assessment runtime engine** for PathFinder. Building directly on Stage 1 (Syllabus Intelligence), Stage 2 (Assessment Blueprints & Question Validation), and Stage 3 (Adaptive Question Selection), Stage 4 delivers a hardened exam environment suitable for high-stakes certifications, institutional examinations, and proctored readiness benchmarks across 12+ domains.

### Core Architectural Guarantees:
1. **Strict Backend Authority**: All scoring, clock management, attempt counts, and session state transitions are determined and persisted exclusively on the server. The client is treated as an untrusted display terminal.
2. **Total Answer Secrecy**: At no point during an active exam are correct answers, explanations, or unreached questions leaked to the client. Responses in `EXAM` mode redact all evaluation metadata until final submission.
3. **Tamper-Proof Timers**: Remaining time is calculated dynamically on the backend (`expires_at - now`). Client clock alterations have zero impact on exam duration.
4. **Idempotency Protection**: Repeated answer submissions (double clicks, connection retries) return the authoritative evaluated state without inflating scores or altering adaptation streaks.
5. **Session Recovery & IDOR Shield**: Browser reloads and network reconnects restore the ongoing attempt without incrementing attempt counts. Sessions are strictly scoped to the authenticated learner profile.
6. **Configurable Navigation & Pause Policies**: Supports `FREE_NAVIGATION`, `SEQUENTIAL_ONLY`, and `LOCK_AFTER_SUBMISSION` rules, paired with enforced pause quotas and maximum pause duration caps.

---

## 2. Session Lifecycle & State Machine

```
              ┌────────────────────────┐
              │      READY / INIT      │
              └───────────┬────────────┘
                          │ (Start Session)
                          ▼
              ┌────────────────────────┐
   ┌─────────►│      IN_PROGRESS       │◄────────┐
   │          └─────┬────────────┬─────┘         │
   │                │            │               │
(Resume)      (Pause Allowed)    │          (Reconnect)
   │                │            │               │
   │          ┌─────▼─────┐      │               │
   └──────────┤  PAUSED   │      │               │
              └───────────┘      │               │
                                 │               │
                 ┌───────────────┴───────────────┤
                 │                               │
       (Learner Submits)             (Authoritative Expiration)
                 │                               │
                 ▼                               ▼
       ┌──────────────────┐            ┌──────────────────┐
       │ PASSED / FAILED  │            │     EXPIRED      │
       └──────────────────┘            └──────────────────┘
```

### State Definitions:
- **READY**: Session record initialized; clock not yet ticking.
- **IN_PROGRESS**: Active testing state; authoritative countdown running.
- **PAUSED**: Permitted pause active; clock frozen; answer submission rejected.
- **PASSED / FAILED**: Session finalized by learner; scored against syllabus passing threshold.
- **EXPIRED**: Session auto-closed by backend due to timer expiration; scored up to last submitted answer.

---

## 3. Core Engine Implementations

### A. Database Models (`backend/app/models/assessment.py`)
Extended `Assessment` and `AssessmentSession` with dedicated Stage 4 runtime columns:
- `Assessment.attempt_limit`: Maximum allowed attempts per learner (default `3`, `0` = unlimited).
- `Assessment.allowed_pause`: Flag indicating whether pauses are permitted.
- `Assessment.max_pause_seconds`: Maximum total pause allowance in seconds (default `600s`).
- `Assessment.max_pauses_allowed`: Maximum count of pauses permitted (default `2`).
- `Assessment.navigation_policy`: `FREE_NAVIGATION`, `SEQUENTIAL_ONLY`, `LOCK_AFTER_SUBMISSION`.
- `Assessment.submission_policy`: `AUTO_SUBMIT_ON_EXPIRE`, `DISCARD_ON_EXPIRE`.
- `AssessmentSession.attempt_number`: Sequential attempt index (1-indexed).
- `AssessmentSession.total_paused_seconds`: Cumulative paused duration.
- `AssessmentSession.paused_at`: Timestamp when current pause started.
- `AssessmentSession.pause_count`: Number of pauses taken so far.
- `AssessmentSession.audit_events`: JSON audit log of all session events.
- `AssessmentSession.result_summary`: Final syllabus score breakdown cache.

### B. Exam Runtime Engine (`backend/app/assessment/exam_runtime.py`)
Key engine methods:
1. `get_exam_rules(assessment_id)`: Fetches authoritative pre-exam rules (duration, attempt limits, pause policy, navigation constraints).
2. `get_or_create_session(assessment_id, profile_id, mode)`: Validates attempt limit quotas, performs auto-recovery if an active session exists, or initializes a new session with authoritative timer bounds.
3. `get_time_remaining(session)`: Calculates server-side seconds remaining. If paused, halts countdown.
4. `pause_session(session_id, profile_id)`: Enforces `allowed_pause`, checks `pause_count < max_pauses_allowed`, freezes timer, and records `PAUSE_STARTED` audit event.
5. `resume_session(session_id, profile_id)`: Verifies pause duration does not exceed `max_pause_seconds`, authoritatively extends `expires_at` by pause elapsed time, and resumes session.
6. `get_current_or_next_question(session_id, profile_id, target_question_id)`: Dispatches questions with strict redaction of `correct_answer`, `correct_option_index`, and `explanation`.
7. `submit_answer_idempotent(session_id, profile_id, payload)`: Enforces question lock rules, computes score deltas, records immutable evidence in `AssessmentAttemptEvidence`, and protects against repeated submissions.
8. `finalize_exam(session_id, profile_id, auto_expire)`: Scores exam, computes percentage against `passing_score`, builds module, topic, and objective breakdowns, and commits audit trail.

---

## 4. API Endpoints Mounted

Dual-mounted for clean consumption across legacy and modern routing patterns:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/assessments/{id}/rules` | Authoritative pre-exam configuration & rules |
| `POST` | `/api/v1/assessments/{id}/sessions` | Start or recover an exam session (attempt limit protected) |
| `GET` | `/api/v1/assessment-sessions/{id}` | Session status, timing, and recovery state |
| `GET` | `/api/v1/assessment-sessions/{id}/current` | Current question (or navigate via `?question_id=`) |
| `POST` | `/api/v1/assessment-sessions/{id}/answers` | Idempotent answer submission with authoritative grading |
| `POST` | `/api/v1/assessment-sessions/{id}/pause` | Authoritative pause (halts countdown) |
| `POST` | `/api/v1/assessment-sessions/{id}/resume` | Authoritative resume (extends expiry timestamp) |
| `POST` | `/api/v1/assessment-sessions/{id}/submit` | Finalizes exam and scores syllabus breakdown |
| `GET` | `/api/v1/assessment-sessions/{id}/result` | Full post-exam result summary & syllabus mastery |
| `GET` | `/api/v1/assessment-sessions/{id}/progress` | In-flight progress and skill coverage metadata |

---

## 5. Comprehensive Test Suite (`backend/tests/test_phase10_stage4_exam_runtime.py`)

All 9 dedicated Stage 4 test cases passed synchronously:

| Test Case | Scenario Verified | Status |
|---|---|---|
| `test_stage4_01` | Pre-exam rules retrieval, initial session fields, timer bounds, and creation audit log. | **PASSED** |
| `test_stage4_02` | Strict attempt limit enforcement (attempts 1 & 2 succeed; attempt 3 rejected with HTTP 403). | **PASSED** |
| `test_stage4_03` | Server-authoritative timer calculation, rejection of expired submissions, and auto-expire finalization. | **PASSED** |
| `test_stage4_04` | Idempotent answer submission (duplicate submissions do not duplicate marks or evidence). | **PASSED** |
| `test_stage4_05` | Pause policy enforcement (clock freeze, answer rejection while paused, resume expiry extension, max pause limit). | **PASSED** |
| `test_stage4_06` | Navigation policy enforcement (`FREE_NAVIGATION` question jumping vs `LOCK_AFTER_SUBMISSION` rejection). | **PASSED** |
| `test_stage4_07` | Session recovery on disconnect/refresh without burning attempt, and IDOR access protection. | **PASSED** |
| `test_stage4_08` | Final submission scoring with module, topic, and learning objective percentage breakdowns. | **PASSED** |
| `test_stage4_09` | Multi-domain exam execution across Cybersecurity, VLSI Design, Data Science, and Vocational fields. | **PASSED** |

---

## 6. Frontend Production Build Verification

- **Route Mounted**: `/assessment/[assessment_id]/session/[session_id]`
- **Build Status**: Successful production bundle (`next build`).
- **Features**:
  - Live server-synchronized countdown timer with visual urgency styling (< 5 minutes).
  - Modal overlay during paused states with remaining pauses indicator.
  - Question grid navigator with answered / current / unanswered status badges.
  - Automatic submission trigger when timer reaches zero.
  - Comprehensive post-exam syllabus breakdown view (module scores, topic scores, and objective mastery).
  - Clean responsive design optimized for mobile and desktop viewports.

---

## 7. Global Regression & Hardening Verification

```bash
pytest backend/tests -q
# Result: 299 passed, 1 warning in 49.65s (100% Pass Rate)

npm run build
# Result: Compiled successfully, 20 routes generated, 0 lint/type errors
```

With zero regressions across all 9 previous phases and complete multi-domain coverage, **Phase 10 Stage 4 is formally released and production-ready**.
