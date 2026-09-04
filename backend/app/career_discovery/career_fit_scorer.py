"""
Career Fit Scorer (Phase 9 Stage 2)
Computes deterministic, multi-dimensional career fit scores:
Fit Score = 0.20 * Edu + 0.25 * Skill + 0.20 * Interest + 0.15 * Evidence + 0.10 * Feasibility + 0.10 * Demand
Categorizes into:
- Strong Fit (>= 0.70)
- Potential Fit (0.50 - 0.69)
- Stretch Path (0.35 - 0.49)
- Alternative Path (< 0.35)
"""

from typing import Dict, List, Any, Optional
from pydantic import BaseModel, Field

from backend.app.core.career_catalog import CareerRoleDefinition

class CareerFitScore(BaseModel):
    career_slug: str
    career_role: str
    domain_category: str
    fit_tier: str  # Strong Fit, Potential Fit, Stretch Path, Alternative Path
    overall_score: float  # 0.0 to 1.0
    education_alignment: float
    skill_alignment: float
    interest_alignment: float
    practical_evidence_score: float
    pathway_feasibility: float
    market_demand_signal: float
    strengths: List[str]
    missing_prerequisites: List[str]
    reasoning: str
    pathway_summary: str

class CareerFitScorer:
    # Standard transparent weights
    WEIGHT_EDUCATION = 0.20
    WEIGHT_SKILL = 0.25
    WEIGHT_INTEREST = 0.20
    WEIGHT_EVIDENCE = 0.15
    WEIGHT_FEASIBILITY = 0.10
    WEIGHT_DEMAND = 0.10

    # Domain affinity heuristics for Indian education backgrounds
    STREAM_AFFINITY_MAP: Dict[str, Dict[str, float]] = {
        # Computer Science & IT Degrees
        "computer-science-engineering": {
            "ai-ml-engineer": 0.95, "software-engineer": 0.95, "full-stack-developer": 0.95,
            "data-scientist": 0.90, "cloud-devops-engineer": 0.85, "cybersecurity-analyst": 0.85, "vlsi-hardware-engineer": 0.70
        },
        "bca": {
            "full-stack-developer": 0.90, "software-engineer": 0.85, "cloud-devops-engineer": 0.80,
            "data-scientist": 0.75, "ai-ml-engineer": 0.75, "cybersecurity-analyst": 0.75, "vlsi-hardware-engineer": 0.40
        },
        # Electronics & Electrical
        "electronics-communication-engineering": {
            "vlsi-hardware-engineer": 0.95, "cloud-devops-engineer": 0.85, "ai-ml-engineer": 0.80,
            "software-engineer": 0.80, "cybersecurity-analyst": 0.85, "data-scientist": 0.75, "full-stack-developer": 0.75
        },
        "electrical-electronics-engineering": {
            "vlsi-hardware-engineer": 0.90, "cloud-devops-engineer": 0.80, "software-engineer": 0.75,
            "ai-ml-engineer": 0.75, "cybersecurity-analyst": 0.75, "data-scientist": 0.70, "full-stack-developer": 0.70
        },
        # Higher Secondary Science
        "pcm": {
            "software-engineer": 0.85, "ai-ml-engineer": 0.85, "data-scientist": 0.85,
            "full-stack-developer": 0.80, "cloud-devops-engineer": 0.75, "cybersecurity-analyst": 0.75, "vlsi-hardware-engineer": 0.80
        },
        "pcm-computer-science": {
            "software-engineer": 0.90, "ai-ml-engineer": 0.90, "full-stack-developer": 0.90,
            "data-scientist": 0.85, "cloud-devops-engineer": 0.80, "cybersecurity-analyst": 0.80, "vlsi-hardware-engineer": 0.80
        },
        "pcb": {
            "data-scientist": 0.75, "ai-ml-engineer": 0.65, "software-engineer": 0.60,
            "full-stack-developer": 0.60, "cloud-devops-engineer": 0.50, "cybersecurity-analyst": 0.50, "vlsi-hardware-engineer": 0.40
        },
        "pcmb": {
            "data-scientist": 0.85, "ai-ml-engineer": 0.80, "software-engineer": 0.75,
            "full-stack-developer": 0.75, "cloud-devops-engineer": 0.70, "cybersecurity-analyst": 0.70, "vlsi-hardware-engineer": 0.70
        },
        # Commerce
        "commerce-with-mathematics": {
            "data-scientist": 0.80, "full-stack-developer": 0.70, "software-engineer": 0.65,
            "ai-ml-engineer": 0.65, "cloud-devops-engineer": 0.60, "cybersecurity-analyst": 0.60, "vlsi-hardware-engineer": 0.30
        },
        "b-com": {
            "data-scientist": 0.75, "full-stack-developer": 0.65, "software-engineer": 0.60,
            "ai-ml-engineer": 0.55, "cloud-devops-engineer": 0.55, "cybersecurity-analyst": 0.55, "vlsi-hardware-engineer": 0.25
        },
        # Humanities / Arts
        "humanities-arts": {
            "full-stack-developer": 0.65, "data-scientist": 0.60, "cybersecurity-analyst": 0.60,
            "software-engineer": 0.55, "ai-ml-engineer": 0.50, "cloud-devops-engineer": 0.50, "vlsi-hardware-engineer": 0.20
        },
        # Polytechnic Diploma
        "diploma-polytechnic": {
            "software-engineer": 0.75, "cloud-devops-engineer": 0.80, "full-stack-developer": 0.75,
            "cybersecurity-analyst": 0.75, "vlsi-hardware-engineer": 0.70, "ai-ml-engineer": 0.65, "data-scientist": 0.60
        },
        # ITI Trades
        "iti-industrial-training": {
            "cloud-devops-engineer": 0.70, "cybersecurity-analyst": 0.65, "software-engineer": 0.60,
            "full-stack-developer": 0.60, "vlsi-hardware-engineer": 0.50, "ai-ml-engineer": 0.50, "data-scientist": 0.45
        }
    }

    # Market demand baseline index
    MARKET_DEMAND_INDEX = {
        "ai-ml-engineer": 0.95,
        "cloud-devops-engineer": 0.90,
        "full-stack-developer": 0.90,
        "cybersecurity-analyst": 0.85,
        "data-scientist": 0.85,
        "software-engineer": 0.85,
        "vlsi-hardware-engineer": 0.80
    }

    @classmethod
    def score_career_fit(
        cls,
        role_def: CareerRoleDefinition,
        education_stage: Optional[str] = None,
        education_domain: Optional[str] = None,
        education_stream: Optional[str] = None,
        specialization: Optional[str] = None,
        subjects: Optional[List[str]] = None,
        learner_skills: Optional[Dict[str, float]] = None,
        interests: Optional[List[str]] = None,
        practical_evidence_count: int = 0
    ) -> CareerFitScore:
        learner_skills = learner_skills or {}
        subjects = subjects or []
        interests = interests or []
        spec_key = (specialization or education_stream or education_stage or "").lower().replace(" ", "-")

        # 1. Education Alignment (0.0 to 1.0)
        edu_score = 0.50  # baseline domain-agnostic score
        for pattern_key, affinities in cls.STREAM_AFFINITY_MAP.items():
            if pattern_key in spec_key or pattern_key in (education_stage or "").lower():
                edu_score = affinities.get(role_def.slug, 0.50)
                break

        # Subject boosts
        sub_str = " ".join([s.lower() for s in subjects])
        if "math" in sub_str and ("ai-ml" in role_def.slug or "data" in role_def.slug):
            edu_score = min(1.0, edu_score + 0.10)
        if "computer" in sub_str or "coding" in sub_str:
            edu_score = min(1.0, edu_score + 0.10)

        # 2. Skill Alignment (0.0 to 1.0)
        target_skills = role_def.target_skills
        matched_skills = []
        missing_skills = []
        skill_sum = 0.0

        for sk in target_skills:
            if sk in learner_skills:
                conf = learner_skills[sk]
                skill_sum += conf
                matched_skills.append(sk)
            else:
                missing_skills.append(sk)

        if learner_skills:
            skill_score = skill_sum / len(target_skills) if target_skills else 0.50
            if matched_skills:
                skill_score = max(skill_score, len(matched_skills) / len(target_skills) * 0.8)
        else:
            # Baseline expectation for exploratory students
            stage_str = (education_stage or "").lower()
            if any(s in stage_str for s in ["secondary", "school", "iti"]):
                skill_score = 0.35
            else:
                skill_score = 0.25

        # 3. Interest Alignment (0.0 to 1.0)
        interest_score = 0.50
        role_text = f"{role_def.role} {role_def.domain_category} {role_def.description}".lower()
        if interests:
            matches = sum(1 for i in interests if i.lower() in role_text)
            interest_score = min(1.0, 0.40 + (matches * 0.25))

        # 4. Practical Evidence Score (0.0 to 1.0)
        evidence_score = min(1.0, practical_evidence_count * 0.25)
        if practical_evidence_count == 0:
            evidence_score = 0.40  # fair baseline for starters

        # 5. Pathway Feasibility (0.0 to 1.0)
        # In India, entry feasibility is high if basic quantitative/reasoning foundations exist
        feasibility = min(1.0, (edu_score * 0.6) + (skill_score * 0.4) + 0.20)

        # 6. Market Demand Signal
        demand_score = cls.MARKET_DEMAND_INDEX.get(role_def.slug, 0.80)

        # Weighted Total
        overall = (
            (cls.WEIGHT_EDUCATION * edu_score) +
            (cls.WEIGHT_SKILL * skill_score) +
            (cls.WEIGHT_INTEREST * interest_score) +
            (cls.WEIGHT_EVIDENCE * evidence_score) +
            (cls.WEIGHT_FEASIBILITY * feasibility) +
            (cls.WEIGHT_DEMAND * demand_score)
        )
        overall = round(max(0.10, min(1.0, overall)), 3)

        # Categorize Tier
        if overall >= 0.70:
            tier = "Strong Fit"
        elif overall >= 0.52:
            tier = "Potential Fit"
        elif overall >= 0.35:
            tier = "Stretch Path"
        else:
            tier = "Alternative Path"

        # Strengths & Reasoning
        strengths = []
        if edu_score >= 0.75:
            strengths.append(f"Strong academic background alignment ({specialization or education_stage or 'Technical'})")
        if matched_skills:
            strengths.append(f"Possesses {len(matched_skills)} relevant competency skills ({', '.join(matched_skills[:3])})")
        if practical_evidence_count > 0:
            strengths.append(f"Demonstrated verified project evidence ({practical_evidence_count} artifact(s))")
        if demand_score >= 0.90:
            strengths.append("High industrial demand in the Indian technology corridor")

        if not strengths:
            strengths.append("Provides a direct growth path for expanding your core quantitative and computational skills")

        reasoning = (
            f"Your educational foundation in {specialization or education_stage or 'your discipline'} "
            f"gives you a {tier.lower()} trajectory toward {role_def.role}. "
        )
        if matched_skills:
            reasoning += f"You have already initiated mastery in {', '.join(matched_skills[:3])}. "
        if missing_skills:
            reasoning += f"Key focus areas to develop include {', '.join(missing_skills[:3])}."

        pathway_summary = (
            f"Standard route through {education_stage or 'undergraduate'} studies, "
            f"supplemented by targeted competency building in {', '.join(missing_skills[:2]) if missing_skills else 'core tools'}."
        )

        return CareerFitScore(
            career_slug=role_def.slug,
            career_role=role_def.role,
            domain_category=role_def.domain_category,
            fit_tier=tier,
            overall_score=overall,
            education_alignment=round(edu_score, 3),
            skill_alignment=round(skill_score, 3),
            interest_alignment=round(interest_score, 3),
            practical_evidence_score=round(evidence_score, 3),
            pathway_feasibility=round(feasibility, 3),
            market_demand_signal=round(demand_score, 3),
            strengths=strengths,
            missing_prerequisites=missing_skills[:4],
            reasoning=reasoning,
            pathway_summary=pathway_summary
        )
