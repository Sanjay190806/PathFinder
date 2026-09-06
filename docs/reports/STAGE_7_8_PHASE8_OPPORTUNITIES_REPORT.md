# STAGES 7 & 8 ? OPPORTUNITY INTELLIGENCE & MATCHING REPORT

## 1. Objective
Ingest real-world career opportunities and perform multi-dimensional matching against learner theoretical readiness, practical competencies, and portfolio evidence.

## 2. Architecture & Scoring
- **Match Score Formula**:
  $$\text{MatchScore} = (0.35 \cdot \text{SkillCoverage} + 0.30 \cdot \text{TheoreticalReadiness} + 0.20 \cdot \text{PortfolioFit} + 0.15 \cdot \text{RoleAlignment}) \times 100$$
- **Match Levels**: Strong Fit (75+), Competitive Fit (55+), Developing Fit (35+), Early Prerequisite (<35).

## 3. Endpoints & Verification
- `GET /api/v1/opportunities`
- `GET /api/v1/opportunities/matches`
- Tests: `backend/tests/test_phase8_stage7_8_opportunities.py` (2/2 passing)
