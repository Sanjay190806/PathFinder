# PathFinder System Architecture (Phases 1–9)

## 1. Executive Architecture Overview

PathFinder is an **India-First, Domain-Agnostic Adaptive Career Discovery, Learning Intelligence, and Employability Platform**. It provides end-to-end guidance from secondary school education streams through career discovery, personalized adaptive learning roadmaps, AI career coaching, live market intelligence, practical interview preparation, and real-world opportunity alignment.

```
+---------------------------------------------------------------------------------------------------+
|                                      NEXT.JS 14 FRONTEND LAYER                                     |
|  - Modern App Router & React 18 UI               - India Education Taxonomy Multi-Step Selector    |
|  - Career Discovery & Pathway Visualizer        - Personalized Adaptive Weekly Planner            |
|  - Multilingual AI Career Coach (Side Drawer)   - Opportunity Matcher & Market Intelligence Matrix|
|  - Interview Preparation & Technical Practice   - Strict Accessibility, High-Contrast & Responsive|
+--------------------------------------------------+------------------------------------------------+
                                                   | (REST APIs / JWT Bearer Authentication)
+--------------------------------------------------v------------------------------------------------+
|                                        FASTAPI APPLICATION LAYER                                  |
|  +---------------------------------------------------------------------------------------------+  |
|  | API Routing Layer (/api/v1/):                                                              |  |
|  | - auth, profile, education, careers, pathways, market-intelligence, resources,              |  |
|  | - planner, ai-chat, opportunities, preparation                                              |  |
|  +-----------------------------------------------+---------------------------------------------+  |
|                                                  |                                                |
|  +-----------------------------------------------v---------------------------------------------+  |
|  | CORE INTELLIGENCE ENGINES                                                                   |  |
|  | 1. India Education Taxonomy Engine (NCF 2023, UGC, AICTE, NCVET hierarchical taxonomy)      |  |
|  | 2. Career Discovery & Fit Scorer (Multi-dimensional alignment: 6 transparent weighted factors)|  |
|  | 3. Pathway Intelligence Engine (Direct, Alternative, Diploma, Bridge routes + Milestones)  |  |
|  | 4. Live Market Intelligence & Salary Provider (India tech hubs, freshness decay, sources)   |  |
|  | 5. Resource Discovery & Verification Engine (Tier 1-4 catalog, pricing integrity, SSRF guard)|  |
|  | 6. Adaptive Weekly Learning Planner (Spaced repetition, pace adjustments, milestone gating) |  |
|  | 7. Multilingual AI Coach (Hybrid Groq Llama-3-70B + Deterministic Zero-Failure Fallback)     |  |
|  | 8. Opportunity Intelligence Matcher (Internships, hackathons, jobs with Indian eligibility) |  |
|  | 9. Preparation & Interview Engine (STAR behavioral + domain technical drill + rubric scorin)|  |
|  +-----------------------------------------------+---------------------------------------------+  |
|                                                  |                                                |
|  +-----------------------------------------------v---------------------------------------------+  |
|  | RELATIONAL PERSISTENCE & DATA PROVENANCE (SQLAlchemy 2.0)                                   |  |
|  | - SQLite (Zero-Config Development & Local Testing)                                          |  |
|  | - PostgreSQL (Production Scaled Storage)                                                    |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

## 2. Subsystem Architecture & Modules

### 2.1 Stage 1: India Education Taxonomy (`backend/app/core/india_taxonomy.py`)
- Standardized multi-level hierarchy reflecting Indian educational reality:
  1. Primary & Middle School (Classes 1–8)
  2. Secondary School (Classes 9–10)
  3. Higher Secondary (Classes 11–12): Science (PCM, PCB, PCMB), Commerce (with/without Math), Humanities/Arts, Vocational
  4. Polytechnic & ITI Diplomas
  5. Undergraduate Degrees (B.Tech, B.Sc, BCA, B.Com, B.A, MBBS, etc.)
  6. Postgraduate Degrees (M.Tech, MCA, MBA, M.Sc, etc.)

### 2.2 Stage 2: Career Discovery Engine (`backend/app/career_discovery/`)
- Multi-dimensional scoring formula:
  $$\text{Fit Score} = 0.20 \cdot \text{Education} + 0.25 \cdot \text{Skill} + 0.20 \cdot \text{Interest} + 0.15 \cdot \text{Evidence} + 0.10 \cdot \text{Feasibility} + 0.10 \cdot \text{Demand}$$
- Deterministic, explainable rankings categorized into `Strong Fit`, `Potential Fit`, `Stretch Path`, and `Alternative Path`.

### 2.3 Stage 3: Career Eligibility & Pathway Intelligence (`backend/app/career_discovery/pathway_engine.py`)
- Analyzes educational prerequisites and recommends:
  - **Direct Path**: For candidates meeting all academic prerequisites.
  - **Alternative Academic Path**: For non-traditional degree holders.
  - **Diploma Route**: For lateral entry polytechnic / ITI graduates.
  - **Bridge Path**: Explicit milestone-driven transitional roadmaps for non-linear pivots.

### 2.4 Stage 4: Live Market & Salary Intelligence (`backend/app/intelligence/live_market_provider.py`)
- Provides real-time salary benchmarks (P10, P50, P90) across Indian tech clusters (Bengaluru, Hyderabad, Pune, NCR, Chennai).
- Tracks market demand velocity, growth trends, hiring velocity, and freshness decay timestamps.

### 2.5 Stage 5 & 6: Resource Discovery & Verification (`backend/app/resources/`)
- Curates Tier 1 (Gov/NPTEL/SWAYAM), Tier 2 (Tech Providers - Google, AWS, Microsoft), Tier 3 (Coursera, edX), and Tier 4 (FreeCodeCamp, YouTube).
- Strict Free/Paid pricing classification (`GENUINELY_FREE`, `FREE_TO_ENROLL_PAID_CERTIFICATE`, `PAID`).
- Robust SSRF protection (`ResourceVerifier.is_safe_destination`) blocking loopback, link-local, and private cloud metadata IPs.

### 2.6 Stage 7: Adaptive Learning Planner (`backend/app/planner/`)
- Transforms high-level career pathways into concrete weekly sprint schedules.
- Dynamically adapts based on user pace, weekly study hours, assessment scores, and milestone completions.

### 2.7 Stage 8: Multilingual AI Coach (`backend/app/ai/`)
- Powered by Groq Llama-3-70B / 8B with automatic deterministic fallback.
- Native multilingual reasoning in **Hindi, Tamil, Telugu, and English**, preserving technical terms (e.g. *Python*, *Docker*, *SQL*) in Latin script.
- PromptGuard safety layer preventing prompt injections, jailbreaks, and authority bypasses.

### 2.8 Stage 9: Career Opportunity Intelligence (`backend/app/opportunities/`)
- Real-time catalog of internships, apprenticeships, hackathons, and entry-level positions.
- Bounded pagination and multi-filter criteria (location, domain, stipend, remote).

### 2.9 Stage 10: Interview & Application Preparation (`backend/app/preparation/`)
- Dual-mode mock interview simulator (Behavioral STAR method + Technical deep-dives).
- Automated rubric scoring across 4 dimensions: Technical Correctness, Communication Clarity, Structural Completeness, and Depth.
- IDOR protected session state ensuring strict learner boundary isolation.

---

## 3. Key Invariant Rules
1. **Zero-Fabrication Policy**: Market data, pricing, and course metadata are strictly grounded with explicit verification status badges (`VERIFIED`, `PARTIALLY_VERIFIED`, `UNVERIFIED`).
2. **Deterministic Precedence**: Crucial career prerequisites, scoring matrices, and roadmap DAGs are evaluated deterministically; the AI layer serves explainability, coaching, and translation.
3. **Graceful Fallback Guarantee**: If external APIs (Groq, web search, live market feeds) encounter network latency, rate limits, or outages, the platform seamlessly degrades to deterministic local engines with 100% uptime.
