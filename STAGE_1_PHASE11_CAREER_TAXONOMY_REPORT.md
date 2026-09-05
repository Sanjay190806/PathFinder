# Phase 11 — Stage 1: Global Career Taxonomy & Canonical Career Data Model Report

## Executive Summary
Phase 11 Stage 1 establishes a scalable, data-driven, canonical career knowledge model for PathFinder. It replaces the hardcoded in-memory role list with a relational database taxonomy spanning 16 top-level domains, 28 career families, 21 canonical multi-domain professions, 43 sub-specializations, 93 skill requirements linked directly to the canonical `skills` table, and 21 education requirement records aligned with Phase 9's Indian & global education hierarchy.

---

## Architecture & Data Model

### 1. Relational Entities (`backend/app/models/career.py`)
- **`CareerDomain`**: Top-level macro domains (`technology-computing`, `engineering-infrastructure`, `healthcare-medicine`, `design-creative`, `media-film-entertainment`, `finance-accounting`, `law-legal`, `education-academia`, `agriculture-food`, `aviation-aerospace`, `skilled-trades-vocational`, etc.).
- **`CareerFamily`**: Functional groupings within domains (e.g., `design-creative` $\rightarrow$ `graphic-visual-design`, `ui-ux-product-design`, `3d-game-art`).
- **`Career`**: Canonical entity storing slug, canonical name, descriptions, domain/family foreign keys, alias lists, keywords, governance flags (`is_emerging`, `is_regulated`), work characteristics (`remote_compatibility`, `work_environment`, `tools`), and versioning.
- **`CareerSpecialization`**: Granular focus branches (e.g. `video-editor` $\rightarrow$ `film-editor`, `commercial-editor`, `youtube-content-editor`).
- **`CareerRelationship`**: Typed semantic links (`TRANSITION`, `ADJACENT`, `PREDECESSOR`, `SUBSPECIALIZATION`) recording transferable and bridge skills.
- **`CareerSkillRequirement`**: Foreign key to `skills.id` enforcing **zero duplicate skill taxonomy**, annotated with `importance` (`MANDATORY`, `RECOMMENDED`, `HELPFUL`, `OPTIONAL`, `BRIDGE`) and `proficiency_level` (`FOUNDATIONAL`, `WORKING`, `PROFICIENT`, `ADVANCED`, `EXPERT`).
- **`CareerEducationRequirement`**: Prerequisites mapped to Phase 9 education stages (`higher-secondary`, `undergraduate`, `diploma-polytechnic`, `iti-vocational`).
- **`CareerRegionalMetadata`**: Statutory regulatory bodies (`NMC`, `BCI`, `ICAI`, `DGCA`) and statutory examinations (`NEET`, `CLAT`, `CPL`, `CA Final`).

---

## Multi-Domain Representative Catalog

| Domain | Representative Careers | Regulated? | Key Skills |
|---|---|---|---|
| **Technology & Computing** | AI/ML Engineer, Data Scientist, Software Engineer, Full Stack Developer, Cloud/DevOps Engineer, Cybersecurity Analyst | No | Python, DSA, Machine Learning, Deep Learning, Docker |
| **Electronics & Hardware** | VLSI Hardware Engineer, Embedded Systems Engineer | No | Verilog RTL, Digital Logic, Embedded C |
| **Engineering & Infrastructure** | Civil Engineer, Mechanical Engineer | Yes (Structural) | Structural Analysis, CAD Modeling, Thermodynamics |
| **Healthcare & Medicine** | General Physician / Doctor, Registered Nurse | **Yes (NMC / INC)** | Clinical Diagnosis, Anatomy & Physiology, Pharmacology |
| **Finance & Accounting** | Chartered Accountant, Financial Analyst | **Yes (ICAI)** | Financial Accounting, Corporate Finance, IFRS Audit |
| **Law & Legal** | Corporate Lawyer | **Yes (BCI)** | Legal Research, Commercial Contracts, Corporate Law |
| **Education & Academia** | Secondary School Teacher | **Yes (NCTE/B.Ed)** | Pedagogy, Curriculum Scaffolding, Bloom Alignment |
| **Design & Creative** | Graphic Designer, UI/UX Designer | No | Typography, Layout, Color Theory, Figma |
| **Media & Film** | Video Editor | No | Video Editing, Audio Post, Color Grading |
| **Agriculture & Food** | Agricultural Scientist / Agronomist | No | Agronomy, Soil Science, Crop Yield Optimization |
| **Aviation & Aerospace** | Commercial Airline Pilot | **Yes (DGCA/FAA)** | Aeronautical Navigation, Aerodynamics, Meteorology |
| **Skilled Trades & Vocational** | Automotive Mechanic, Licensed Electrician | **Yes (Trade Permit)** | Automotive Engine Diagnostics, Electrical Wiring Code |

---

## Backward Compatibility & Governance
1. **Legacy Slugs Preserved**: All 7 historical career slugs (`ai-ml-engineer`, `data-scientist`, `full-stack-developer`, `cloud-devops-engineer`, `cybersecurity-analyst`, `vlsi-hardware-engineer`, `software-engineer`) remain primary slugs in the canonical database.
2. **Accessors Preserved**: `get_career_catalog()` and `resolve_target_skills_for_role()` in `backend/app/core/career_catalog.py` seamlessly resolve both historical roles and newly seeded canonical roles.
3. **No Duplicate Skills**: All career skill requirements link directly to the existing `skills` table.

---

## Verification & Test Results
- Test suite: `backend/tests/test_phase11_stage1_career_taxonomy.py`
- Test count: **7 passed of 7 (100%)**
- Zero P0/P1 defects discovered.
