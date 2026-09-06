# PathFinder Course Catalog & Data Integrity Policy

## 1. Scope & Objective
This policy defines the governance, indexing rules, pricing classification standards, security verification safeguards, and URL sanitization protocols enforced across PathFinder's unified learning resource catalog.

---

## 2. Canonical Pricing Classification Taxonomy

To eliminate misleading "free trial" claims and hidden paywalls, PathFinder enforces a strict 5-state pricing taxonomy:

1. **`GENUINELY_FREE`**:
   - Both learning materials and certificates of completion/badges are 100% free of charge.
   - Examples: iGOT Karmayogi courses, Microsoft Learn modules, Cisco Skills for All, freeCodeCamp.
2. **`FREE_TO_ENROLL_PAID_CERTIFICATE`**:
   - Course lectures, syllabus, and assessments can be audited without cost; a verified physical/digital certificate requires an optional proctored exam fee.
   - Examples: NPTEL university courses (free video lectures + ₹1,000 optional exam fee), SWAYAM, select Coursera audit courses.
3. **`SUBSCRIPTION_REQUIRED`**:
   - Requires an active monthly or annual platform subscription.
   - Examples: Coursera Plus, LinkedIn Learning, Pluralsight.
4. **`PAID`**:
   - Requires direct one-time course purchase.
   - Examples: Udemy individual courses, specialized proprietary bootcamps.
5. **`YOUTUBE_FREE_CONTENT`**:
   - Freely accessible video playlists and tutorial series without certificate overhead.

---

## 3. Resource Verification & Anti-SSRF Safeguards

All external URLs ingested into the catalog undergo automated audit via `ResourceVerifier` (`backend/app/resources/resource_verifier.py`):

1. **Protocol Restriction**: Only standard `http://` and `https://` schemes are permitted.
2. **Loopback & Private Network Blocking**:
   - Blocks `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`.
   - Blocks private RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Blocks link-local addresses (`169.254.0.0/16`) and carrier-grade NAT (`100.64.0.0/10`).
3. **Cloud Metadata Endpoint Blocking**:
   - Strictly blocks AWS/GCP/Azure instance metadata endpoints (`169.254.169.254`, `metadata.google.internal`).
4. **DNS Rebinding Protection**:
   - Resolves domains dynamically and inspects IP addresses prior to HTTP requests.
5. **Trusted Offline Domains**:
   - Pre-whitelists authoritative educational portals (`igotkarmayogi.gov.in`, `portal.igotkarmayogi.gov.in`, `nptel.ac.in`, `swayam.gov.in`, `learn.microsoft.com`, `aws.amazon.com`, `skillsforall.com`) for rapid, offline-resilient verification.

---

## 4. Deduplication & Identifier Standards

Every resource catalog entry is indexed by a deterministic compound deduplication key:
$$\text{DedupKey} = \text{Provider} \mathrel{::} (\text{ExternalID} \parallel \text{NormalizedCanonicalURL})$$

- Prevents duplicate entries when courses are imported across different catalog sync cycles.
- Preserves unique competencies and topics while keeping the global course index clean and performant.
