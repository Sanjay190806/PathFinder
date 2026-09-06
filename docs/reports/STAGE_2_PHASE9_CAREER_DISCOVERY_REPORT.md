# 🧭 Phase 9 Stage 2: Career Discovery Engine Report

**Module**: Career Discovery & Multi-Dimensional Fit Engine (Phase 9 - Stage 2)  
**Status**: Release Certified  
**Date**: September 2026  

---

## 1. Executive Summary

Stage 2 established the **Career Discovery Engine**, giving learners transparent, multi-signal career recommendations based on their Indian educational background, current competencies, verified practical evidence, and interests.
- **Divergent Purpose**: While the learning path recommendation engine suggests *what learning resources to consume*, the Career Discovery Engine recommends *which career trajectories to pursue*.
- **Multi-Dimensional Transparent Scoring**: Uses an open, weighted formulation combining education alignment, skill mastery, interests, practical evidence, pathway feasibility, and market demand.
- **Incomplete Profile Resilience**: Operates deterministically even for fresh high schoolers or new signups with zero declared skills.
- **Domain Agnostic & Non-Lockout**: Never declares "You cannot become X"; instead categorizes fit into `Strong Fit`, `Potential Fit`, `Stretch Path`, and `Alternative Path` with tailored bridge recommendations.

---

## 2. Fit Scoring Model Formulation

$$\text{Fit Score} = 0.20 \times \text{Edu} + 0.25 \times \text{Skill} + 0.20 \times \text{Interest} + 0.15 \times \text{Evidence} + 0.10 \times \text{Feasibility} + 0.10 \times \text{Demand}$$

### Fit Tiers
- **Strong Fit** ($\ge 70\%$): High academic alignment, foundational skill prerequisites met, verified projects.
- **Potential Fit** ($52\% - 69\%$): Good foundational quantitative or computational aptitude; moderate bridge preparation needed.
- **Stretch Path** ($35\% - 51\%$): Cross-domain or emerging career requiring structured bridge modules.
- **Alternative Path** ($< 35\%$): Nontraditional route with substantial prerequisite acquisition.

---

## 3. Architecture & Components

- `backend/app/career_discovery/career_fit_scorer.py`: Core scoring mathematical model, stream affinities for Indian education (PCM, PCB, PCMB, Commerce, Humanities, ITI, Polytechnic, ECE, CSE), and reasoning generation.
- `backend/app/career_discovery/career_discovery_engine.py`: Orchestrates discovery across all catalog roles (`CAREER_ROLES_CATALOG`), queries learner skills/evidence, and returns sorted, deterministic results.
- `backend/app/api/v1/career_discovery.py`: Exposes:
  - `GET /api/v1/careers/discover?q={query}`: Authenticated discovery list.
  - `GET /api/v1/careers/{career_slug}/discovery-fit`: Single career fit diagnostics.
- `frontend/src/app/career-discovery/page.tsx`: Interactive responsive discovery dashboard with search, fit filters, strength chips, missing prerequisite alerts, and direct pathway links.

---

## 4. Verification & Test Results

- `pytest backend/tests/test_phase9_stage2_career_discovery.py -v`: **5 passed / 5 tests** (100%).
- Validated scenarios across:
  - PCM (+2 Science): Software Engineer / AI/ML Engineer / Data Scientist top matches.
  - PCB (+2 Pre-Medical): Data Science / Bioinformatics strong potential fit.
  - Commerce: Data Scientist / Financial Analytics alignment without artificial lockout.
  - ECE Undergraduate: VLSI Hardware Engineer / Cloud / AI alignment ($\ge 70\%$ Strong Fit with skills).
  - ITI & Polytechnic: Practical cloud/networking/DevOps entry routes.
- Frontend TypeScript check: `npx tsc --noEmit` passed with 0 errors.
