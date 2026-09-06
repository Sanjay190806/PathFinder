# PathFinder — iGOT Karmayogi Integration Specification

## 1. Executive Summary & Mission Alignment
PathFinder is an intelligent career guidance and adaptive learning platform. Rather than segregating Government of India civil service competencies into an isolated silo or secondary portal, **iGOT Karmayogi** is seamlessly unified into the **Central PathFinder Learning Intelligence Engine**.

iGOT Karmayogi joins premier institutions (NPTEL, SWAYAM, Microsoft Learn, Google Cloud, AWS, Cisco, IBM, Coursera, edX, and YouTube) within a single source-agnostic, deterministic multi-signal recommendation framework.

---

## 2. Core Architectural Principles

### 2.1 Central Engine Integration (No Separate Silos)
- All iGOT courses share the canonical `LearningResource` database schema and extended discovery pipeline.
- Students and professionals seeking governance, public policy, administrative technology, or digital ethics competencies receive iGOT recommendations natively alongside university and vendor tracks.

### 2.2 Strict Compliance & Security Boundaries
- **Provider Identifier**: `igot_karmayogi`
- **Provider Display Name**: `iGOT Karmayogi`
- **Authoritative Domains**:
  - Primary Portal: `https://igotkarmayogi.gov.in/`
  - Learner Portal: `https://portal.igotkarmayogi.gov.in/`
- **Zero-Scraping / Non-Invasive Policy**:
  - No authenticated internal endpoints are scraped.
  - No undocumented private APIs are reverse-engineered.
  - No copyrighted civil service videos or modules are cloned.
  - Progress verification is handled non-intrusively via external links ("View on iGOT Karmayogi") and user-driven milestone checkpoints.

---

## 3. Canonical Taxonomy & Competency Alignment

iGOT Karmayogi defines functional, domain, and behavioral competencies. PathFinder's `TaxonomyMapper` projects these competencies onto canonical skill slugs without generating duplicate or conflicting skill entities.

| iGOT Competency Title | iGOT Domain Category | Canonical PathFinder Skill Slugs | Career Relevance |
| :--- | :--- | :--- | :--- |
| **Data Driven Decision Making For Government** | Functional / Governance | `data-analysis`, `decision-making`, `data-literacy`, `data-interpretation` | Public Administration, Data Analyst, Policy Advisor |
| **Fundamentals of Public Policy** | Domain / Policy | `public-policy`, `policy-analysis`, `governance` | Civil Services, Policy Analyst, Legal Compliance |
| **AI Using Google Bard and ChatGPT for Beginners** | Functional / Modern Tech | `generative-ai`, `prompt-engineering`, `llms`, `ai-tools` | Public Servant, AI Product Manager, Tech Lead |
| **Public Financial Management & Procurement (GeM)** | Domain / Finance | `public-finance`, `government-procurement`, `supply-chain` | Procurement Specialist, Operations Manager |
| **Citizen Centricity & Public Service Delivery** | Behavioral / Service | `citizen-centricity`, `service-delivery`, `public-administration` | Administrative Officer, Public Relations Manager |
| **Ethics and Integrity in Governance** | Behavioral / Leadership | `public-ethics`, `governance`, `integrity` | Leadership, Civil Services, Compliance Officer |
| **Basics of Administrative Law** | Domain / Legal | `administrative-law`, `legal-compliance`, `public-administration` | Corporate Counsel, Governance Advisor |
| **Disaster Management & Emergency Response** | Domain / Security | `disaster-management`, `crisis-management`, `risk-assessment` | Infrastructure Planner, Security Coordinator |
| **Digital Safety & Cybersecurity Essentials** | Functional / Cybersecurity | `cybersecurity`, `information-security`, `digital-safety` | Information Security Analyst, IT Specialist |
| **Introduction to Project Management for Governance** | Functional / Management | `project-management`, `operations`, `agile` | Project Manager, Delivery Lead |

---

## 4. Discovery & Ranking Formulation

PathFinder scores every resource using a deterministic formula that balances relevance, source trust, and gap alignment:

$$\text{Final Score} = S_{\text{match}} \cdot W_{\text{tier}} \cdot B_{\text{domain}} \cdot B_{\text{gap}}$$

Where:
1. **$S_{\text{match}}$ (Base Relevance)**: Text similarity, skill slug intersection, and title token alignment ($0.0 \le S \le 1.0$).
2. **$W_{\text{tier}}$ (Provider Tier Weight)**:
   - Tier 1 (Govt / Institutional: iGOT, NPTEL, SWAYAM): $1.25 - 1.30$
   - Tier 2 (Tech Vendors: Microsoft, Google, AWS, Cisco, IBM): $1.20$
   - Tier 3 (Global EdTech: Coursera, edX, Udemy): $1.10 - 1.15$
   - Tier 4 (Video: YouTube): $1.05$
3. **$B_{\text{domain}}$ (Domain Context Synergy)**:
   - For public administration, governance, public policy, or citizen services: iGOT receives an authoritative bonus ($+0.20$).
   - For computer science, algorithms, and deep software engineering: NPTEL and Tier 2 tech vendors receive high technical relevance, ensuring irrelevant governance courses never outrank relevant software courses.
4. **$B_{\text{gap}}$ (Active Skill Gap Multiplier)**:
   - $+0.15$ bonus when the course directly addresses an unmet competency identified in the learner's skill gap audit.

---

## 5. UI Integration & User Experience

1. **Tier 1 Badge**: Displayed with amber/gold styling: `🏛️ iGOT Karmayogi • Govt of India`.
2. **Direct Portal Link**: Official "View on iGOT Karmayogi" button linking directly to verified public URLs with `target="_blank" rel="noopener noreferrer"`.
3. **Explainability Box**: Clear callouts explaining *"Why Recommended"* (e.g., *"Authoritative Government of India curriculum building essential evidence-driven policy formulation competencies"*).
4. **Genuinely Free**: Labeled as `100% Free` (Free Learning + Free Certificate) under national open education policies.
