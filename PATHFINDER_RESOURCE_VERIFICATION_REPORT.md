# PathFinder Resource Verification & Security Audit Report

## 1. Verification Audit Scope
This report details the automated verification, security hardening, and SSRF (Server-Side Request Forgery) audit conducted on PathFinder's learning resource verification subsystem (`ResourceVerifier`).

---

## 2. Automated Test Results & Security Findings

| Security / Verification Test Case | Tested Input | System Response | Verdict |
| :--- | :--- | :--- | :---: |
| **iGOT Portal Official URL** | `https://igotkarmayogi.gov.in/course/123` | Validated, Domain Whitelisted, Tier 1 assigned | **PASS** |
| **iGOT Learner Portal Official URL** | `https://portal.igotkarmayogi.gov.in/app/toc/...` | Validated, Offline Recognized, Status 200 | **PASS** |
| **Microsoft Learn Official URL** | `https://learn.microsoft.com/training/azure` | Validated, Tier 2 assigned | **PASS** |
| **Localhost / Loopback SSRF Attack** | `http://127.0.0.1:8000/internal-api` | Blocked: *"Localhost / loopback destination blocked for SSRF security."* | **PASS** |
| **Private RFC 1918 Subnet SSRF** | `http://192.168.1.100/admin` | Blocked: *"Private subnet destination blocked for SSRF security."* | **PASS** |
| **Cloud Metadata Service SSRF** | `http://169.254.169.254/latest/meta-data/` | Blocked: *"Blocked cloud metadata destination for SSRF security."* | **PASS** |
| **Non-HTTP Protocol Phishing** | `file:///etc/passwd`, `gopher://evil.com` | Blocked: *"Unsupported protocol. Only HTTP and HTTPS allowed."* | **PASS** |
| **Phishing / Lookalike Domain** | `https://fake-igotkarmayogi.evil.com/` | Failed domain validation check | **PASS** |

---

## 3. Staleness & Freshness Management

Resources are audited against a 48-hour cache window (`RESOURCE_VERIFICATION_CACHE_HOURS = 48`).
- **`FRESH`**: Resource verified within the last 48 hours.
- **`STALE`**: Verification older than 48 hours; triggers asynchronous background re-audit upon next access.
- **`EXPIRED`**: Target URL returns 404 or persistent connection errors; suppressed from recommendations until resolved.
