# PathFinder Data Provenance, Trust & Verification Standards

## 1. Zero-Fabrication Philosophy

PathFinder enforces strict provenance criteria to guarantee that learners are never guided by hallucinated job requirements, fake course pricing, or phantom career pathways.

Every external datum is cataloged with origin, timestamp, verification status, and retrieval methodology.

---

## 2. Provenance Taxonomy & Sources

### 2.1 India Education & Taxonomy Registry
- **Framework Grounding**: National Curriculum Framework for School Education (NCF 2023), National Education Policy (NEP 2020), University Grants Commission (UGC), AICTE, and National Council for Vocational Education and Training (NCVET).
- **Streams & Qualifications**: Mapped systematically from Classes 1–10 (integrated non-stream), Classes 11–12 (PCM, PCB, PCMB, Commerce, Arts, Vocational), Polytechnic Diplomas, and Undergraduate/Postgraduate university degrees.

### 2.2 Career Requirements & Pathway Catalog
- **Curated Profiles**: 30+ comprehensive industry roles spanning Software Engineering, AI/ML, Data Science, Cloud/DevOps, VLSI Hardware, Cybersecurity, Full Stack, Product Management, Healthcare Tech, and FinTech.
- **Prerequisite Validation**: Each role specifies mandatory foundational skills, recommended complementary skills, minimum education level, and preferred educational streams.

### 2.3 Learning Resource Catalog & Price Classification
Resources are organized into four verification tiers:
- **Tier 1 (Government & Institutional)**: NPTEL, SWAYAM, IIT Bombay Spoken Tutorials, NCERT.
- **Tier 2 (Industry Tech Providers)**: Google Cloud Skills, AWS Skill Builder, Microsoft Learn, Meta Developers.
- **Tier 3 (Accredited EdTech Platforms)**: Coursera, edX, Harvard Online, Khan Academy.
- **Tier 4 (Open Source & Community)**: FreeCodeCamp, MIT OpenCourseWare, curated YouTube tutorials.

#### Pricing Classification System:
- `GENUINELY_FREE`: 100% free learning content and free certificate/completion confirmation.
- `FREE_TO_ENROLL_PAID_CERTIFICATE`: Full course materials accessible for free (audit mode); optional payment required only for formal graded credentials.
- `PAID`: Requires tuition fee or subscription to access core content.

### 2.4 Live Market & Salary Intelligence
- **Regional Tech Hubs**: Grounded across major Indian technology centers: Bengaluru, Hyderabad, Pune, Delhi-NCR, and Chennai.
- **Percentile Distributions**: Reports 10th percentile (entry), 50th percentile (median), and 90th percentile (senior) compensation in INR Lakhs Per Annum (LPA).
- **Freshness Decay**: Salary signals carry a timestamp and validity window. Data older than 90 days triggers a degradation notice in the UI.

---

## 3. Trust Badges & Status Codes
- `VERIFIED`: Directly cross-referenced with primary provider documentation and active HTTP reachability checks.
- `PARTIALLY_VERIFIED`: Provider identity confirmed; pricing tier verified via catalog, live enrollment status pending next scheduled sync.
- `UNVERIFIED`: Extracted via real-time web search fallback; clearly marked to learners with a provenance disclaimer.
