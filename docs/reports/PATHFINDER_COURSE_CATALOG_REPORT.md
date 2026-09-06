# PathFinder Course Catalog Distribution & Quality Report

## 1. Catalog Distribution Summary

As of Phase 11 multi-source intelligence integration, PathFinder indexes 28 verified, curated learning resources spanning government portals, technology vendor curricula, and university tracks.

### 1.1 Source Tier Distribution
- **Tier 1 (Government & Institutional)**: 13 resources (46.4%)
  - iGOT Karmayogi: 10 authoritative courses
  - NPTEL / SWAYAM: 3 university courses (Python, Deep Learning, Cloud Computing)
- **Tier 2 (Official Technology Providers)**: 6 resources (21.4%)
  - Microsoft Learn (Azure Fundamentals, Azure AI)
  - Google (Machine Learning Crash Course)
  - AWS (Cloud Practitioner Essentials)
  - Cisco (Networking Basics)
  - IBM (Data Science Fundamentals)
- **Tier 3 (Established MOOCs)**: 5 resources (17.9%)
  - freeCodeCamp, Harvard CS50, MIT OpenCourseWare
- **Tier 4 (Curated Video Learning)**: 4 resources (14.3%)
  - Curated algorithms, system design, and web development playlists

---

## 2. Pricing & Accessibility Breakdown

| Pricing Model | Resource Count | Percentage | Verified Quality Score (Avg) | Free Certificate Available |
| :--- | :---: | :---: | :---: | :---: |
| **`GENUINELY_FREE`** | 19 | 67.9% | 0.95 | **Yes** (iGOT, MS Learn, Cisco, FCC) |
| **`FREE_TO_ENROLL_PAID_CERTIFICATE`** | 5 | 17.9% | 0.96 | Optional Paid Proctored Exam (NPTEL) |
| **`YOUTUBE_FREE_CONTENT`** | 4 | 14.3% | 0.92 | N/A (Video Only) |
| **`PAID` / `SUBSCRIPTION_REQUIRED`** | 0 | 0.0% | N/A | N/A |

---

## 3. Data Integrity & Deduplication Audit

1. **Deduplication Verification**:
   - Deduplication key: `Provider::ExternalID` and `NormalizedURL`.
   - Result: **0 Duplicate Entities Detected**.
2. **Quality Score Audit**:
   - Highest rated course: `0.98` (MIT OpenCourseWare Single Variable Calculus & NPTEL Python).
   - Median quality score: `0.95`.
   - Minimum threshold: `0.85`.
