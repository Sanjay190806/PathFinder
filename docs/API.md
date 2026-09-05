# PathFinder REST API Reference
**Phase 10: Complete Assessment, Syllabus & Analytics Specifications**

---

## 1. Syllabus & Courses
- `GET /api/v1/courses/{course_id}/syllabus`: Retrieve authoritative syllabus hierarchy.
- `POST /api/v1/courses/{course_id}/syllabus`: Admin creation/update of syllabus.

## 2. Assessment & Runtime
- `GET /api/v1/assessments/{assessment_id}/rules`: Pre-exam rules, time limit, and attempt configuration.
- `POST /api/v1/assessments/{assessment_id}/session`: Start new or recover in-progress exam session.
- `GET /api/v1/assessment-sessions/{session_id}/questions/next`: Fetch current or next question with answer key redacted.
- `POST /api/v1/assessment-sessions/{session_id}/answers`: Submit answer with idempotency and time tracking.
- `POST /api/v1/assessment-sessions/{session_id}/pause`: Authoritatively pause exam (if permitted).
- `POST /api/v1/assessment-sessions/{session_id}/resume`: Resume paused exam with timer recalculation.
- `POST /api/v1/assessment-sessions/{session_id}/submit`: Finalize exam, evaluate score, and generate decision trace.

## 3. Proctoring & Integrity
- `POST /api/v1/assessment-sessions/{session_id}/integrity-events`: Report client-debounced proctoring events.

## 4. Analytics
- `GET /api/v1/analytics/overview`: Authoritative KPIs and completion rates.
- `GET /api/v1/analytics/courses`: Course progress and verified completions.
- `GET /api/v1/analytics/assessments`: Exam performance metrics.
- `GET /api/v1/analytics/modules`: Module, topic, and learning objective performance.
- `GET /api/v1/analytics/skills`: Bayesian skill mastery, decay risk, and evidence counts.
- `GET /api/v1/analytics/learning`: 14-day study effort histogram and streaks.
- `GET /api/v1/analytics/planner`: Study plan execution and milestone progress.
- `GET /api/v1/analytics/career-readiness`: Target career readiness pillars.
- `GET /api/v1/analytics/integrity`: Privacy-conscious exam monitoring audit.
- `GET /api/v1/analytics/definitions`: Canonical metric definitions and formulas.
