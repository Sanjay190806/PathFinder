# Phase 10 — Stage 5: Webcam-Based Assessment Integrity Monitoring
## Architecture & Production Verification Report

**Platform:** PathFinder — India-First Adaptive Career Intelligence & Employability Platform  
**Phase:** Phase 10 (Syllabus-Based Assessment Blueprint & Secure Adaptive Runtime)  
**Stage:** Stage 5 (Webcam-Based Assessment Integrity Monitoring)  
**Status:** Complete & Verified  
**Tests:** 317/317 Full Backend Tests Passing (100% Pass Rate, 0 Regressions)  
**Frontend:** 20/20 Routes Compiled Cleanly (Next.js 14 App Router, Zero TypeScript / Lint Errors)  

---

## 1. Executive Summary & Core Philosophy

Phase 10 Stage 5 delivers the **privacy-conscious webcam monitoring subsystem** for PathFinder assessments. Operating strictly in accordance with ethical AI standards, the system's purpose is **NOT** to deliver automated punitive verdicts or claim omniscient cheating detection. Instead, it provides:

$$\text{Detection} \longrightarrow \text{Confidence Calibration} \longrightarrow \text{Event Classification} \longrightarrow \text{Proportionate Warnings} \longrightarrow \text{Audit Telemetry}$$

### Key Privacy & Operational Guarantees:
1. **Local-First Processing**: Inference runs client-side in the browser via Web APIs/Canvas. Zero raw video streams, frames, or biometric photos are uploaded or stored.
2. **Minimal Telemetry**: Only structured metadata is transmitted to the server (`event_type`, `confidence`, `duration`, `severity`, `source`, `timestamp`).
3. **Explicit Consent Lifecycle**: Camera access is requested only upon entering an authorized assessment session after clear policy disclosure (`CONSENT_GRANTED` / `CONSENT_DENIED`).
4. **Session-Bound Lifetime**: Camera hardware access begins exclusively when an exam starts and is forcefully terminated upon exam completion, auto-expiry, pause, page navigation, or tab unmount.
5. **Calm, Assistive Feedback**: Learners receive calm, non-accusatory visual cues (e.g., "Please face your camera", "Ensure your face is clearly visible") to correct their environment before any escalation.

---

## 2. Integrity Monitoring Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Learner Browser (Local)                         │
│                                                                        │
│  ┌───────────────────────┐          ┌───────────────────────────────┐  │
│  │ Explicit Consent Modal│ ───────► │ HTML5 Video & Canvas Stream   │  │
│  └───────────────────────┘          └───────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                     ┌───────────────────────────────┐  │
│                                     │ Local Presence Detector       │  │
│                                     │ - Face Presence & Tracking    │  │
│                                     │ - Multi-face / Absence Logic  │  │
│                                     └───────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                     ┌───────────────────────────────┐  │
│                                     │ Debounced Telemetry Dispatcher│  │
│                                     │ (Cooldown: 5.0s per type)     │  │
│                                     └───────────────┬───────────────┘  │
└─────────────────────────────────────────────────────┼──────────────────┘
                                                      │ (Telemetry Only)
                                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     PathFinder Backend Authoritative                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ IntegrityMonitor Engine                                          │  │
│  │  - IDOR & Session Ownership Verification                         │  │
│  │  - Active Session State Enforcement (Rejects on Finalized/Paused)│  │
│  │  - Privilege Check (Rejects spoofed MANUAL_REVIEW from learners)  │  │
│  │  - Timestamp Bounds Check (Rejects future timestamps)            │  │
│  │  - Authoritative Severity Normalization (Clamps client overrides) │  │
│  │  - Smart Debouncing & Duration Aggregation                       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ SQLite Database: assessment_integrity_events                     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Supported Face Integrity Events

| Event Code | Description | Severity Classification |
| :--- | :--- | :--- |
| `NO_FACE` | No face detected in camera viewport | `<3s`: INFO, `<8s`: LOW, `<15s`: MEDIUM, `≥15s`: HIGH |
| `MULTIPLE_FACES` | More than one person present in viewport | `<5s`: MEDIUM, `≥5s`: HIGH |
| `LOOKING_AWAY` | Prolonged eye/head orientation off-screen | `<4s`: INFO, `<10s`: LOW, `≥10s`: MEDIUM |
| `FACE_OUT_OF_FRAME`| Face partially clipped or obscured | `<5s`: LOW, `≥5s`: MEDIUM |
| `CAMERA_OFF` | Learner turned camera off during exam | `HIGH` (if REQUIRED) / `MEDIUM` (if WARNING_ONLY) |
| `PERMISSION_DENIED`| Camera hardware permission denied | `HIGH` (if REQUIRED) / `MEDIUM` (if WARNING_ONLY) |

---

## 4. Endpoints & Schema Summary

- `POST /api/v1/assessment-sessions/{session_id}/consent`:
  - Request: `{"consent": "CONSENT_GRANTED" | "CONSENT_DENIED"}`
  - Validates assessment policy (`REQUIRED` rejects denial; `WARNING_ONLY` / `OPTIONAL` permits graceful continuation).
  - Initializes `monitoring_started_at` and appends audit trail entry.

- `POST /api/v1/assessment-sessions/{session_id}/integrity-events`:
  - Request: `IntegrityEventCreate` (`event_type`, `duration`, `confidence`, `source`, `metadata_minimized`).
  - Server-side validation against `ALL_INTEGRITY_EVENTS`.
  - Normalizes severity using authoritative rules.
  - Aggregates duration on rapid bursts within 5.0 seconds.

- `GET /api/v1/assessment-sessions/{session_id}/integrity`:
  - Response: `IntegritySummaryOut` with structured counts for all face events, device events, high confidence flags, and warning candidates.

---

## 5. Verification Results

All 9 dedicated Stage 5 test cases passed with 100% success rate:
- `test_stage5_01_consent_lifecycle`: PASSED
- `test_stage5_02_policy_enforcement`: PASSED
- `test_stage5_03_event_validation_and_ownership`: PASSED
- `test_stage5_04_session_state_and_timestamp_bounds`: PASSED
- `test_stage5_05_source_privilege_restriction`: PASSED
- `test_stage5_06_server_side_severity_normalization`: PASSED
- `test_stage5_07_event_debouncing_and_aggregation`: PASSED
- `test_stage5_08_integrity_summary_aggregation`: PASSED
- `test_stage5_09_exam_completion_monitoring_shutdown`: PASSED
