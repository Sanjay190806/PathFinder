# Career Eligibility, Requirements & Pathway Intelligence
**Phase 11 Stages 4–5 Architecture Specification**

---

## 1. Overview
Career intelligence answers eight fundamental questions for every career:
1. What does this career require?
2. What education pathways lead to it?
3. Which requirements are hard barriers vs recommended?
4. What does the learner already satisfy?
5. What is missing?
6. Is a bridge pathway required?
7. What are realistic alternative pathways?
8. What is the immediate next step?

---

## 2. Requirement Modeling (`CareerRequirement`)
Every career defines hard constraints and soft recommendations:
- `ACADEMIC_DEGREE`: Required minimum qualification (e.g. MBBS for Doctor, B.E./B.Tech for VLSI).
- `EXAMINATION_LICENSURE`: Mandatory regulatory qualification (e.g. NEET-PG, DGCA CPL, ICAI Final, Bar Council of India).
- `EXPERIENCE_YEARS`: Years of domain practice.
- `PORTFOLIO`: Proven artifacts or code repositories.
- `AGE_OR_PHYSICAL`: Aviation medical class 1, eyesight standards.

---

## 3. Roadmap & Pathway Definitions (`CareerPathwayDefinition` & `CareerPathwayStep`)
- Multi-phase structured journey broken down into concrete sequence of steps.
- Each step defines `skills_to_acquire`, `estimated_weeks`, and prerequisites.
