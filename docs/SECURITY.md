# PathFinder Security Architecture & Hardening

PathFinder implements defense-in-depth across authentication, data authorization, prompt safety, network interactions, and API resilience.

---

## 1. Authentication & Token Management
- **JWT (JSON Web Tokens)**: Signed using HMAC-SHA256 with strong secret keys and expiration enforcement.
- **Password Security**: Passwords hashed using `bcrypt` with work factor 12 via `passlib`.
- **Demo Access Isolation**: The `/api/v1/demo/login` route provisions a fully isolated session for `alex@pathfinder.demo` without granting cross-user administrative access.

---

## 2. Insecure Direct Object Reference (IDOR) Mitigation
- **Profile Isolation**: All career discovery, pathways, and planner endpoints scope data strictly through `current_user.profile.id`.
- **Preparation Sessions**: Mock interview sessions verify that the requesting user's profile ID matches `mock_session.profile_id`. Any unauthorized access yields HTTP 403 Forbidden:
  ```python
  if session.profile_id != requester_profile_id:
      raise PermissionError("Access denied: session belongs to another user")
  ```

---

## 3. Prompt Injection & AI Safety (`PromptGuard`)
All user messages routed to the AI Career Coach pass through `PromptGuard.validate_user_input`:
- **Pattern Matching**: Actively rejects jailbreak attempts, system override instructions, role-playing bypasses ("DAN Mode"), prompt extraction, and credential exfiltration attempts.
- **Instruction Hierarchy Isolation**: Prompts sent to LLM providers are framed in explicit XML/markdown boundaries (`<SYSTEM_INSTRUCTIONS>`, `<GROUNDED_DATA>`, `<USER_QUERY>`) to prevent user input from hijacking instruction semantics.
- **Max Input Length**: Enforces a strict 4,000-character ceiling to prevent buffer attacks and context window stuffing.

---

## 4. Server-Side Request Forgery (SSRF) Protection
Outbound URL resolution in `ResourceVerifier.is_safe_destination` blocks:
- Loopback destinations (`127.0.0.1`, `localhost`, `::1`)
- Private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
- Cloud instance metadata addresses (`169.254.169.254`)
- Non-standard protocols (only `http://` and `https://` permitted)

---

## 5. API Hardening & Error Masking
- **Centralized Exception Handler**: A global middleware intercepts unhandled exceptions in production, logs the error internally, and returns sanitized JSON:
  ```json
  {"detail": "Internal server error"}
  ```
  Internal Python stack traces, file paths, and environment details are never exposed to the client.
- **Bounded Pagination**: All discovery queries (`/opportunities/discover`, `/resources/discover`) enforce maximum page sizes (`limit <= 100`) to mitigate denial-of-service via memory exhaustion.

---

## 6. Data Integrity & Provenance
- **Zero Fabrication Policy**: All educational pathways, salary ranges, and courses are anchored in catalog registries with transparent verification tags (`VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`).
- **Pricing Honesty**: Free courses are rigorously verified to ensure learners are not misled by paid certification requirements labeled as "free".
