# PathFinder Global Career Taxonomy & Canonical Career Data Model
**Phase 11 Stages 1–3 Architecture Specification**

---

## 1. Purpose & Motivation
PathFinder previously utilized a hardcoded list of career destinations. Phase 11 replaces this with a canonical, globally extensible, relational career taxonomy capable of representing careers across technology, healthcare, engineering, public service, creative industries, and skilled vocations.

---

## 2. Canonical Hierarchy & Data Models

### 2.1 Domain (`CareerDomain`)
Ten canonical top-level career domains:
1. `TECHNOLOGY`: Software, Data Science, AI/ML, Cloud/DevOps, Cybersecurity, VLSI.
2. `HEALTHCARE`: Medicine, Nursing, Dentistry, Pharmacy, Allied Health.
3. `ENGINEERING`: Mechanical, Civil, Electrical, Chemical, Robotics.
4. `DESIGN_MEDIA`: UI/UX, Graphic Design, Video Editing, Animation, Journalism.
5. `AVIATION_AEROSPACE`: Commercial Aviation, Aeronautical Engineering, Drone Operations.
6. `BUSINESS_FINANCE`: Chartered Accountancy, Investment Banking, Management Consulting.
7. `LAW_POLICY`: Corporate Law, Civil Litigation, Public Policy, Governance.
8. `EDUCATION_RESEARCH`: School Teaching, University Professorship, Scientific Research.
9. `SKILLED_TRADES`: Licensed Electrician, Automotive Technician, Precision Machinist.
10. `AGRICULTURE_ENVIRONMENT`: Agricultural Science, Environmental Engineering, Agritech.

### 2.2 Career Families (`CareerFamily`)
Intermediate grouping representing occupational clusters linked directly to domains.

### 2.3 Canonical Career (`Career`)
The core occupational identity. Every career is identified by an immutable `id` (UUID) and unique `slug` (e.g. `ai-ml-engineer`, `doctor`, `commercial-airline-pilot`).
- **Classification attributes**: `entry_barrier_level` (`LOW` to `LICENSED_RIGID`), `work_environment`, `remote_compatibility`, `country_scope`.
- **Competency attributes**: `typical_tasks` (JSON array), `tools` (JSON array), `portfolio_expectations`.
- **Governance attributes**: `is_regulated`, `regulation_country`, `regulatory_requirement`, `qualification_requirement`.

### 2.4 Relationships & Transitions (`CareerRelationship`)
Explicit directed graph between careers modeling lateral transitions, vertical promotions, alternative pathways, and prerequisite feeder roles.
