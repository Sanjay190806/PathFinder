# Role Intelligence Architecture

Role Intelligence connects enterprise company roles to canonical career tracks while maintaining explicit role-level requirements for skills, DSA, technologies, and interview topics.

## 1. Requirement Taxonomy
- `RoleSkillRequirement`: Links canonical skills to company roles with requirement types (`REQUIRED`, `PREFERRED`, `VALUABLE`, `OPTIONAL`), importance scores, and minimum proficiency levels (`FOUNDATIONAL`, `WORKING`, `PROFICIENT`, `ADVANCED`).
- `RoleDSARequirement`: Attaches specific DSA topics (e.g. Graphs, Dynamic Programming) to company roles with target difficulties and interview frequencies.
- `RoleTechnologyRequirement`: Captures company-specific framework/stack expectations (e.g. PyTorch, Spring Boot, React, Verilog).
- `RoleInterviewTopic`: Outlines round-by-round interview focus areas (System Design, Coding Rounds, Behavioral STAR principles).

## 2. Canonical vs Company Specificity
- Canonical skills (e.g. `Python`, `SQL`, `Docker`) remain pure.
- Company specificity exists exclusively in the relationship, preventing duplicate pseudo-skills like "Google Python" or "NVIDIA Python".

## 3. APIs
- `GET /api/v1/companies/{slug}/roles/{role_slug}`: Role details and core requirements.
- `GET /api/v1/companies/{slug}/roles/{role_slug}/dsa`: Role-specific DSA requirements.
- `GET /api/v1/companies/{slug}/roles/{role_slug}/learner-gaps`: Learner skill gaps compared to role expectations.
