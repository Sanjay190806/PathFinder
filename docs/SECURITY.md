# PathFinder Security Architecture & Threat Model
**Phase 10: Authentication, Authorization, Anti-Tamper & IDOR Protection**

---

## 1. Authentication & Session Security
- **JWT Authentication**: Signed with a cryptographically enforced secret key ($\ge 32$ characters).
- **Session Ownership**: Every exam and analytics request checks `current_user.profile.id == resource.profile_id`.
- **IDOR Protection**: Verified across exam sessions, assessment answers, progress updates, and analytics endpoints.

## 2. Assessment Integrity & Anti-Tampering
- **Answer Key Concealment**: Answer keys and explanations are never returned to the client during an active exam session.
- **Server-Authoritative Grading**: Client submissions contain only chosen option indices or answer text. Scoring is calculated exclusively by the backend runtime.
- **Backend-Enforced Timers**: The client's clock has zero influence over exam time remaining.

## 3. Rate Limiting & Input Validation
- Configured via SlowAPI across all endpoints with stricter limits on auth and AI endpoints.
- Pydantic models validate all request payloads, rejecting malformed inputs and preventing injection.

## 4. Secret Protection
- Zero secrets committed to version control.
- `.env` excluded via `.gitignore`.
- Explicit startup validation crashes if `SECRET_KEY` is missing or insecure.
