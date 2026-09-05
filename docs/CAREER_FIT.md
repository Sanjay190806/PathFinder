# Skill-Based Career Fit & Personalized Career Intelligence
**Phase 11 Stage 6 Architecture Specification**

---

## 1. Overview
The Career Fit Engine personalizes canonical career suggestions using actual learner evidence from the Bayesian mastery engine, assessment records, syllabus coverage, and learning velocity.

---

## 2. Multi-Pillar Fit Formulation
Personalized fit is computed as a weighted composite of 4 transparent dimensions:
1. **Skill Match Score ($S_m$)**: Weighted overlap between the learner's verified skill mastery and the career's required competencies.
2. **Education Alignment Score ($E_a$)**: Compatibility of learner's academic background, discipline, and degree level.
3. **Pace & Velocity Score ($V_p$)**: Assessment of learner's study consistency and ability to bridge remaining gaps.
4. **Overall Readiness Index ($R_o$)**: Readiness composite determining pathway viability.

$$\text{Fit Score} = 0.50 \cdot S_m + 0.25 \cdot E_a + 0.15 \cdot V_p + 0.10 \cdot R_o$$

---

## 3. Explainability & Gap Classification
- **Critical Gaps**: Missing hard requirements or prerequisites with no lateral equivalent.
- **Moderate Gaps**: Bridgeable within 4–12 weeks of focused study.
- **Minor Gaps**: Easily acquired during initial role induction.
