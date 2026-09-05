# Phase 12 — Stage 7 Engineering Report: Free & Paid Course Intelligence, Pricing Classification & Verified Learning Resources

## Executive Summary
Stage 7 of Phase 12 delivers the authoritative learning-resource intelligence layer for PathFinder. It connects the upstream career, employer, role requirements, DSA priorities, and learner skill gaps directly to a multi-tiered, verified catalog of academic and industry courses.

The system rigorously separates "100% Free Learning" (`GENUINELY_FREE`) from "Free to Enroll with Optional Paid Certificate" (`FREE_TO_ENROLL_PAID_CERTIFICATE`), "Free Audit with Paid Graded Assignments" (`FREE_AUDIT_PAID_CERTIFICATE`), "Paid Subscription" (`SUBSCRIPTION_REQUIRED`), and "Direct Paid Purchase" (`PAID`). Furthermore, all external URLs are protected against Server-Side Request Forgery (SSRF), validate redirect chains up to 5 hops, and link directly to canonical DSA topics and verified company roles.

---

## 1. Architectural Implementation

### A. Core Service & Catalog Integration
- **File**: [`backend/app/resources/course_intelligence_service.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/resources/course_intelligence_service.py)
- **Class**: `CourseIntelligenceService`
  - Merges three tiers of educational resources:
    1. Institutional Tier 1 (MIT OCW, NPTEL, IIT Madras, Princeton, Stanford).
    2. Tech Provider & EdTech Tier 2/3 (freeCodeCamp, Microsoft Learn, Coursera, O'Reilly).
    3. Database-backed `LearningResource` entities.
  - Normalizes canonical URLs and deduplicates records by `provider::external_id` and normalized URL strings.
  - Multi-dimensional query filters: text query, `dsa_topic`, `skill`, `career_slug`, `role_slug`, `price_filter`, `language`, `difficulty`, and `free_only`.
  - Distinguishes free learning content from certificates, preventing false free labels.
  - Directly maps courses to canonical DSA topics (e.g. MIT 6.006 $\rightarrow$ Arrays, Hashing, Trees, Graphs, DP) and company roles (Google SWE $\rightarrow$ Distributed Systems, Go, Algorithms).

### B. Security & SSRF Protection
- **File**: [`backend/app/resources/resource_verifier.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/resources/resource_verifier.py)
  - Enforces `is_safe_destination`: blocks localhost, `127.0.0.1`, private RFC-1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local addresses, and non-HTTP protocols.
  - Follows redirects safely up to 5 hops.

### C. API Endpoints
- **File**: [`backend/app/api/v1/resources.py`](file:///C:/Sanjay/Project/AI%20PathFinder/backend/app/api/v1/resources.py)
  - `GET /api/v1/resources/courses`: Filterable by text, DSA topic, skill, career, role, price classification, language, and difficulty.
  - `GET /api/v1/resources/pricing-categories`: Returns canonical pricing definitions.
  - `GET /api/v1/resources/by-dsa/{topic_slug}`: Retrieves verified courses for a specific DSA topic.
  - `GET /api/v1/resources/by-company-role/{company_slug}/{role_slug}`: Retrieves verified courses aligned with company role requirements.

### D. Frontend Components
- **Files**:
  - [`frontend/src/components/resources/PriceBadge.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/resources/PriceBadge.tsx): Color-coded semantic badge displaying `100% Free Learning`, `Free Learning (Optional Cert Fee)`, `Subscription Required`, or `Paid ($)`.
  - [`frontend/src/components/resources/CourseExplorer.tsx`](file:///C:/Sanjay/Project/AI%20PathFinder/frontend/src/components/resources/CourseExplorer.tsx): Interactive filterable explorer interface.

---

## 2. Verification & Test Results
- **Test File**: `backend/tests/test_phase12_stage7_course_resource_intelligence.py`
- **Result**: **9 passed out of 9 tests (100%) in 1.46s**.
- **Coverage**:
  - `test_pricing_classification_distinction`: Verified MIT OCW (GENUINELY_FREE) vs NPTEL (FREE_TO_ENROLL_PAID_CERTIFICATE).
  - `test_paid_course_classification`: Verified paid O'Reilly course preserves non-zero cost and false free_learning.
  - `test_courses_by_dsa_topic`: Verified graphs topic returns MIT 6.006 and Princeton algorithms.
  - `test_courses_by_role_google_swe`: Verified Google SWE maps to algorithms, systems, and Go.
  - `test_non_software_disciplines`: Verified Graphic Design and Finance courses without DSA pollution.
  - `test_ssrf_and_url_safety`: Verified rejection of private IPs and loopback destinations.
  - `test_api_courses_search`: HTTP 200 with free_only filter.
  - `test_api_pricing_categories`: HTTP 200 returning full taxonomy dictionary.
  - `test_api_by_dsa_topic`: HTTP 200 returning graph courses list.
