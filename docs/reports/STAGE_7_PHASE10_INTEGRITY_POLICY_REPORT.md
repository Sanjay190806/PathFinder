# Phase 10 — Stage 7: Assessment Integrity Warning, Escalation & Exam Policy Engine
## Production Release & Architecture Verification Report

**Platform:** PathFinder — India-First Adaptive Career Intelligence & Employability Platform  
**Phase:** Phase 10 (Syllabus-Based Assessment Blueprint & Secure Adaptive Runtime)  
**Stage:** Stage 7 (Assessment Integrity Warning, Escalation & Exam Policy Engine)  
**Status:** Complete & Verified  
**Tests:** 328/328 Backend Tests Passing (100% Pass Rate, 0 Regressions)  
**Frontend:** 20/20 Routes Compiled Cleanly (Next.js 14 App Router, Zero TypeScript / Lint Errors)  

---

> [!IMPORTANT]
> **Core Ethical & Operating Principle**:
> Computer vision and browser-based environment telemetry are inherently probabilistic. **Integrity monitoring provides probabilistic signals and does not guarantee detection of misconduct.** PathFinder strictly prohibits automatic cheating verdicts. The engine operates on progressive, proportionate guidance:
> $$\text{Detection Telemetry} \longrightarrow \text{Centralized Policy} \longrightarrow \text{Proportionate Warning} \longrightarrow \text{Escalation State} \longrightarrow \text{Human Review / Invalidation (where justified)}$$

---

## 1. Executive Summary & Policy Architecture

Phase 10 Stage 7 delivers the **authoritative assessment integrity policy, warning, and escalation engine** for PathFinder. Building directly on Stage 4 (Secure Exam Runtime), Stage 5 (Webcam Integrity Monitoring), and Stage 6 (Phone & Gadget Detection), Stage 7 unifies presence and hardware signals into a server-authoritative state machine with strict anti-spam cooldowns, multi-signal correlation, explainability traces, and review workflows.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        Integrity Event Ingestion                         │
│   (NO_FACE, LOOKING_AWAY, MULTIPLE_FACES, POSSIBLE_PHONE, TABLET, etc.)   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│             Stage 7 Centralized Integrity Policy Engine                  │
│                                                                          │
│  1. False-Positive Filter                                                │
│     - Brief glances (<3s) or low confidence (<0.50) => Ignored (INFO)    │
│                                                                          │
│  2. Hardware vs Behavioral Separation                                    │
│     - CAMERA_INTERRUPTED / DISCONNECTED => Technical Pause (No Penalty)  │
│                                                                          │
│  3. Anti-Spam Warning Cooldown                                           │
│     - Sustained 30s window suppresses repeated warning banner spam       │
│                                                                          │
│  4. Multi-Signal Correlation                                             │
│     - Phone + Face Absence => Accelerated Escalation                     │
│                                                                          │
│  5. Mode-Aware Policy Rules                                              │
│     - PRACTICE: Lenient (Warnings only, no review/invalidation)          │
│     - STANDARD / DIAGNOSTIC: Balanced (4 warnings, review enabled)       │
│     - EXAM / FINAL: Strict (3 warnings, human review, invalidation cap)  │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  Progressive Integrity State Progression                 │
│                                                                          │
│        NORMAL  ──►  WARNING  ──►  REPEATED_WARNING  ──►  ESCALATED       │
│                                                              │           │
│                                                              ▼           │
│                     INVALIDATED  ◄──────────────  REVIEW_REQUIRED        │
│                (Exceeded hard limit)          (Flagged for Review)       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Integrity Warning Model & Progression

The state machine manages authoritative session progression across 6 distinct states:

| Integrity State | Warning Count | Action Instruction | Learner-Facing Guidance |
| :--- | :--- | :--- | :--- |
| `NORMAL` | 0 | `CONTINUE` | Normal testing environment. No banners. |
| `WARNING` | 1 | `SHOW_WARNING` | Calm, constructive guidance (e.g., *"Please remove unauthorized devices"*). |
| `REPEATED_WARNING` | 2 | `SHOW_WARNING` | Repeated notice with explicit counter (e.g., *"Integrity Warning 2 of 3"*). |
| `ESCALATED` | 3 | `SHOW_WARNING` | Escalated notice warning of impending administrative review. |
| `REVIEW_REQUIRED` | $\ge 4$ or Correlated | `MARK_REVIEW_REQUIRED` | Flags session as `PENDING_REVIEW` for human evaluation. |
| `INVALIDATED` | Hard Limit (e.g. 6) | `INVALIDATE` | Policy-dictated exam termination; session status marked `FAILED`. |

---

## 3. Technical Disruption vs Behavioral Anomaly Separation

A primary architectural guarantee of Stage 7 is distinguishing hardware and connectivity failures from behavioral misconduct:

- **Technical Events**: `CAMERA_INTERRUPTED`, `CAMERA_OFF`, `PERMISSION_DENIED`, `MONITORING_INTERRUPTED`.
- **System Response**:
  - Sets `action_instruction = "PAUSE_REQUIRED"`.
  - Displays a technical notice (e.g., *"Your camera connection was interrupted. Please restore camera access"*).
  - **Does NOT increment misconduct warning count (`warning_count` remains unchanged)**.
  - Automatically preserves timer countdown while paused.

---

## 4. Anti-Spam Warning Cooldown

To prevent cognitive overload and test anxiety, the engine enforces a **30-second warning cooldown**:
- If a phone is held in frame for 25 seconds, the camera generates telemetry every second.
- The debouncer accumulates duration onto the existing database record.
- The policy engine issues **exactly one warning banner**. Subsequent signals within 30 seconds update background telemetry without spamming new alerts.
- When an actionable event occurs *after* cooldown expires, the next warning tier is triggered.

---

## 5. Multi-Signal Event Correlation

Isolated probabilistic detections carry uncertainty. However, when independent signals co-occur, the engine detects an elevated pattern:
- **Rule**: A hardware detection (`POSSIBLE_PHONE`, `POSSIBLE_TABLET`) co-occurring with prolonged face absence (`NO_FACE`) or orientation deviation (`LOOKING_AWAY`) within 60 seconds.
- **Classification**: Tagged internally as `"increased integrity concern"`.
- **Escalation**: Accelerates state directly to `ESCALATED` or `REVIEW_REQUIRED` without waiting for 4 isolated events.

---

## 6. Learner-Facing Phrasing Standards

In alignment with compassionate design, all learner-facing messages remain neutral, constructive, and free of accusations:

| Event Type | Authorized Phrasing |
| :--- | :--- |
| `NO_FACE` | "Please remain visible to the camera." |
| `LOOKING_AWAY` | "Please keep your attention on the assessment." |
| `MULTIPLE_FACES` | "Please ensure you are the only person visible during the assessment." |
| `FACE_OUT_OF_FRAME` | "Please center your face within the camera frame." |
| `POSSIBLE_PHONE` | "Please remove unauthorized devices from your assessment area." |
| `POSSIBLE_TABLET` | "Please remove unauthorized secondary screens or tablets from your workspace." |
| `CAMERA_INTERRUPTED`| "Your camera connection was interrupted. Please restore camera access." |

Internal confidence scores, mathematical weights, and threshold bounds are strictly redacted from learner-facing views.

---

## 7. Explainability & DecisionTrace Integration

Every integrity state escalation generates an immutable `UniversalDecisionTrace` recording:
- `decision_id`: Unique identifier (e.g., `dec_a8b9f012e345`).
- `decision_type`: `"integrity_escalation"`.
- `decision`: `"State transitioned to REVIEW_REQUIRED"`.
- `rationale`: Explainable statement (e.g., *"Increased integrity concern: correlated signals (POSSIBLE_PHONE combined with face anomaly)"*).
- `factors`: Structured weights of triggering signals (duration, confidence, event type).
- `evidence`: Timestamped backend verification evidence.

---

## 8. Database Schema & Migration

### `assessment_integrity_policies` Table
```sql
CREATE TABLE assessment_integrity_policies (
    id VARCHAR(36) PRIMARY KEY,
    assessment_id VARCHAR(36) NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
    monitoring_required BOOLEAN DEFAULT 1,
    camera_required BOOLEAN DEFAULT 1,
    allowed_warning_count INTEGER DEFAULT 3,
    warning_cooldown_seconds INTEGER DEFAULT 30,
    event_thresholds JSON DEFAULT '{}',
    escalation_rules JSON DEFAULT '{}',
    review_required_threshold INTEGER DEFAULT 4,
    invalidation_threshold INTEGER DEFAULT 0,
    auto_pause_on_interruption BOOLEAN DEFAULT 1,
    created_at DATETIME,
    updated_at DATETIME
);
CREATE INDEX ix_integrity_policy_assessment_id ON assessment_integrity_policies (assessment_id);
```

### `assessment_sessions` Extended Columns
- `integrity_state`: `VARCHAR(50) DEFAULT 'NORMAL'`
- `action_instruction`: `VARCHAR(50) DEFAULT 'CONTINUE'`
- `warning_count`: `INTEGER DEFAULT 0`
- `last_warning_issued_at`: `DATETIME`
- `active_warning`: `JSON`
- `warning_history`: `JSON DEFAULT '[]'`
- `review_status`: `VARCHAR(50) DEFAULT 'NOT_APPLICABLE'`

---

## 9. API Specifications

| Method | Route | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/assessments/{id}/integrity-policy` | Retrieves assessment policy configuration. |
| `GET` | `/api/v1/assessment-sessions/{id}/integrity/state` | Authoritative session state, warning counters, and active alerts. |
| `POST`| `/api/v1/assessment-sessions/{id}/integrity/acknowledge` | Learner acknowledgment dismissing active warning banner. |
| `GET` | `/api/v1/assessment-sessions/{id}/warnings` | Complete immutable historical warning audit trail. |

All session endpoints enforce strict profile-ownership verification (IDOR protection, returning HTTP 403 on cross-user access).

---

## 10. Frontend User Experience

- **`IntegrityWarningBanner.tsx`**: Accessible, non-aggressive banner positioned directly above the question card. Includes event badges, calm guidance, and an *"I Understand / Resume"* acknowledgment button.
- **Header Supervision Badge**: Displays active supervisory posture (e.g. `Supervision: Normal`, `Supervision: Warning`, `Supervision: Review Required`).
- **Real-Time Synchronization**: 8-second polling loop synchronized with local camera detector feedback.
- **Interruption Overlays**: Enforces pause when hardware is disconnected, automatically preventing timer drain.

---

## 11. Verification Results

### Dedicated Stage 7 Test Suite (`backend/tests/test_phase10_stage7_integrity_policy.py`)
- `test_stage7_01_default_policy_by_mode`: PASSED
- `test_stage7_02_weak_event_no_warning`: PASSED
- `test_stage7_03_strong_event_warning`: PASSED
- `test_stage7_04_warning_cooldown_anti_spam`: PASSED
- `test_stage7_05_repeated_warning_escalation`: PASSED
- `test_stage7_06_multi_signal_correlation_escalation`: PASSED
- `test_stage7_07_camera_interruption_technical_handling`: PASSED
- `test_stage7_08_warning_acknowledgment`: PASSED
- `test_stage7_09_decision_trace_generation`: PASSED
- `test_stage7_10_idor_and_security_tampering`: PASSED
- `test_stage7_11_invalidation_policy_enforcement`: PASSED
**Result:** 11/11 tests passed in 3.58s.

### Full Platform Regression Suite
- **All Phase 10 Tests (Stages 1–7)**: 66/66 passed in 14.85s.
- **Full Backend Regression Pass**: 328/328 passed in 128.51s (100% pass rate, 0 regressions).
- **Frontend Production Build**: `npm run build` compiled 20/20 routes with zero TypeScript or ESLint errors.

---

## 12. Known Limitations & Best Practices

1. **Probabilistic Nature**: Edge cases such as low room lighting, webcam backlighting, or handheld objects resembling phones (calculators, notebooks) may trigger warnings. Administrators should review sessions marked `PENDING_REVIEW` with human context.
2. **Browser Permissions**: If a learner accidentally blocks webcam access, the system issues a technical pause notice, not a cheating failure.
3. **Bandwidth Efficiency**: Telemetry messages are under 1 KB each, ensuring compatibility with low-bandwidth Indian mobile connections.
