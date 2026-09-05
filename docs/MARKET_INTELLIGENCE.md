# Live Career Market, Demand, Salary & Regional Intelligence
**Phase 11 Stages 7–8 Architecture Specification**

---

## 1. Overview
Stage 7 anchors career planning in verified Indian and global market realities. It prevents aspirational misguidance by grounding recommendations in live job market signals, salary distributions, hiring velocity, and regional demand clusters.

---

## 2. Market Signal Taxonomy (`CareerMarketSignal`)
Signals represent verified empirical observations:
- `DEMAND_TREND`: Hiring trajectory (HIGH, MODERATE, EMERGING, STABLE).
- `SALARY_BENCHMARK`: Entry, mid, senior compensation tiers in INR.
- `SKILL_DEMAND`: Co-occurrence frequencies in live industry job postings.
- `REGIONAL_DEMAND`: Geographic density across Indian employment hubs (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai).
- `EMERGING_SKILL`: Trending technologies (e.g. LLMs, PyTorch, Kubernetes).

---

## 3. Priority Recommendation Modes (Stage 8)
1. **EXPLORE Mode**: Balanced weighting across interests, foundational fit, and emerging domains.
2. **BALANCED Mode**: Equal weighting of learner competency fit and market demand.
3. **EMPLOYABILITY_FIRST Mode**: Heavy weighting towards immediate hiring volume, salary potential, and low transition friction.
