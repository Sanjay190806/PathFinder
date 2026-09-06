# PathFinder Multi-Signal Resource Recommendation Engine Report

## 1. Engine Objective & Mathematical Formulation
The `ResourceDiscoveryEngine` delivers personalized, context-aware, and explainable learning recommendations across multi-source providers. It enforces a source-agnostic, deterministic scoring formula that prevents platform bias while honoring institutional authority.

$$\text{Final Score} = \min\left(1.0, S_{\text{match}} \cdot W_{\text{tier}} + B_{\text{domain}} + B_{\text{gap}} + B_{\text{lang}}\right)$$

Where:
- $S_{\text{match}}$: Base text and semantic overlap with target skills ($0.0 \le S \le 0.80$).
- $W_{\text{tier}}$: Provider authority tier bonus ($+0.12$ for Tier 1, $+0.09$ for Tier 2, $+0.05$ for Tier 3).
- $B_{\text{domain}}$: Synergy boost when curriculum matches career field ($+0.20$ for iGOT in public policy/governance, $+0.15$ for Tech Vendors in software/cloud).
- $B_{\text{gap}}$: Active skill gap closure boost ($+0.15$).
- $B_{\text{lang}}$: Preferred language match boost ($+0.10$).

---

## 2. Recommendation Scenarios & Deterministic Ranking Results

### Scenario A: Public Sector & Governance Discovery
- **Query / Focus**: `Public Policy Analysis`, `Public Administration`
- **Results**:
  1. **Fundamentals of Public Policy** (iGOT Karmayogi) — Score: `1.00`
     - *Explanation*: "Tier 1 Institutional & Government Provider (iGOT Karmayogi). Strong synergy with public administration and governance roles."
  2. **Data Driven Decision Making For Government** (iGOT Karmayogi) — Score: `0.98`
     - *Explanation*: "Official Government of India curriculum building essential quantitative and evidence-driven decision-making competencies."

### Scenario B: Software Engineering & Data Structures Discovery
- **Query / Focus**: `Python`, `Software Engineering`, `Data Structures`
- **Results**:
  1. **Programming in Python** (NPTEL / IIT Madras) — Score: `1.00`
     - *Explanation*: "Tier 1 University Engineering track directly addressing Python software engineering fundamentals."
  2. **Azure Fundamentals** (Microsoft Learn) — Score: `0.94`
     - *Explanation*: "Official Microsoft Learn certification track."
  - **Key Fairness Check**: Irrelevant iGOT courses scored `0.00` and were suppressed from software engineering recommendations, proving the system avoids artificial platform favoritism.

---

## 3. Explainability & Trust Transparency
Every recommendation item includes structured `recommendation_reasons` presented directly in the user interface under the *"Why Recommended"* badge, explaining:
1. Why the provider was selected (e.g. Government of India authority, Microsoft official curriculum).
2. Which skill gaps are bridged.
3. Why the course matches the learner's active career goal.
