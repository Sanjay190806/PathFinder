# Resource Verification & Security Architecture

The `ResourceVerifier` service enforces strict link safety, SSRF protection, redirect bounds, and price integrity.

## 1. SSRF & URL Safety Protection
All incoming and refreshed URLs pass `ResourceVerifier.is_safe_destination`:
- **Blocked Protocols**: Anything other than `http` or `https`.
- **Blocked IP Ranges**:
  - Loopback (`127.0.0.0/8`, `::1`, `localhost`).
  - Private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
  - Link-local and cloud metadata endpoints (`169.254.0.0/16`).
- **Redirect Limits**: Maximum 5 hops; intermediate destinations are re-checked for SSRF safety.

## 2. Non-Destructive Resource Lifecycle
When a course URL fails accessibility checks (e.g. HTTP 404 or domain lapse):
- It is marked `UNAVAILABLE` or `EXPIRED`.
- It is **never** destructively deleted from the database.
- This guarantees that historical learner records, past recommendations, and completed roadmap items continue resolving cleanly.
