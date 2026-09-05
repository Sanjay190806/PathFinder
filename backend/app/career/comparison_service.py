"""
Career Comparison & Alternative Career Discovery Engine (Phase 11 Stage 5)
Provides 2-way and 3-way multi-career comparative analytics, skill overlap analysis,
and algorithmic discovery of adjacent, alternative, and bridge careers.
"""

from typing import List, Dict, Any, Set, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.app.models.career import (
    Career,
    CareerSkillRequirement,
    CareerEducationRequirement,
    CareerRelationship,
    CareerRegionalMetadata,
    CareerDomain,
    CareerFamily
)
from backend.app.models.skill import Skill
from backend.app.schemas.career_requirements import (
    CareerComparisonItem,
    SkillOverlapAnalysis,
    CareerComparisonResponse,
    AlternativeCareerItem,
    AlternativeCareersResponse
)


class CareerComparisonService:
    """
    Multi-career comparative intelligence and adjacent alternative discovery service.
    """

    def __init__(self, db: Session):
        self.db = db

    def compare_careers(self, career_slugs: List[str]) -> CareerComparisonResponse:
        """
        Perform in-depth side-by-side comparison of 2 or 3 careers.
        """
        if len(career_slugs) < 2 or len(career_slugs) > 3:
            raise ValueError("Comparison requires either 2 or 3 career slugs.")

        trace: Dict[str, Any] = {
            "requested_slugs": career_slugs,
            "careers_loaded": [],
            "skill_analysis_steps": [],
            "transition_evaluations": []
        }

        # 1. Fetch careers
        careers: List[Career] = []
        for slug in career_slugs:
            c = self.db.query(Career).filter(Career.slug == slug).first()
            if not c:
                raise ValueError(f"Career with slug '{slug}' not found.")
            careers.append(c)
            trace["careers_loaded"].append(c.slug)

        # 2. Extract comparison items and skill sets
        comparison_items: List[CareerComparisonItem] = []
        skills_by_career: Dict[str, Set[str]] = {}
        skill_names_by_career: Dict[str, List[str]] = {}

        for c in careers:
            # Regional / Regulatory metadata
            reg_meta = self.db.query(CareerRegionalMetadata).filter(
                CareerRegionalMetadata.career_id == c.id
            ).first()
            regulatory_body = reg_meta.regulatory_body if reg_meta else (c.regulatory_requirement if c.is_regulated else None)
            statutory_exam = reg_meta.statutory_exam if reg_meta else None

            # Min education
            min_edu = "Undergraduate"
            if c.education_requirements:
                min_edu = c.education_requirements[0].education_level.title()

            # Key skills
            req_skills = [csr.skill.name for csr in c.skill_requirements if csr.skill]
            req_slugs = {csr.skill.slug for csr in c.skill_requirements if csr.skill}
            skills_by_career[c.slug] = req_slugs
            skill_names_by_career[c.slug] = req_skills

            # Entry barrier estimation
            barrier = "Moderate"
            if c.is_regulated or (min_edu and any(k in min_edu.lower() for k in ["medical", "postgraduate", "doctor"])):
                barrier = "High (Statutory Licensure)"
            elif any(k in c.slug for k in ["electrician", "mechanic", "video-editor", "graphic-designer"]):
                barrier = "Accessible (Vocational/Portfolio)"

            # Estimate salaries based on domain if not set
            salary_entry = 450000
            salary_senior = 1800000
            if "tech" in (c.domain.slug if c.domain else ""):
                salary_entry = 700000
                salary_senior = 3500000
            elif "doctor" in c.slug or "pilot" in c.slug:
                salary_entry = 1000000
                salary_senior = 4000000
            elif "electrician" in c.slug or "mechanic" in c.slug:
                salary_entry = 300000
                salary_senior = 900000

            comparison_items.append(CareerComparisonItem(
                career_id=c.id,
                title=c.display_name,
                slug=c.slug,
                domain=c.domain.name if c.domain else "General",
                family=c.family.name if c.family else "General",
                work_environment=c.work_environment or "Office / Studio",
                remote_compatibility=c.remote_compatibility or "MEDIUM",
                salary_entry=salary_entry,
                salary_senior=salary_senior,
                min_education=min_edu,
                regulatory_body=regulatory_body,
                statutory_exam=statutory_exam,
                key_skills=req_skills[:6],
                growth_rate="15-22% (High Demand)" if "tech" in c.slug or "ai" in c.slug else "8-12% (Steady)",
                entry_barrier=barrier
            ))

        # 3. Compute Skill Overlap & Transferability
        all_skill_sets = list(skills_by_career.values())
        shared_slugs = set.intersection(*all_skill_sets) if all_skill_sets else set()
        
        # Unique skills
        unique_by_slug: Dict[str, List[str]] = {}
        for c_slug, c_set in skills_by_career.items():
            other_skills = set()
            for other_slug, other_set in skills_by_career.items():
                if other_slug != c_slug:
                    other_skills.update(other_set)
            unique = c_set - other_skills
            unique_by_slug[c_slug] = list(unique)

        # Pair-wise transferable skills
        transferable: Dict[str, List[str]] = {}
        for i in range(len(careers)):
            for j in range(len(careers)):
                if i != j:
                    c1 = careers[i].slug
                    c2 = careers[j].slug
                    pair_key = f"{c1}_to_{c2}"
                    shared = list(skills_by_career[c1] & skills_by_career[c2])
                    transferable[pair_key] = shared

        skill_overlap = SkillOverlapAnalysis(
            shared_skills=list(shared_slugs),
            unique_skills_by_career=unique_by_slug,
            transferable_skills=transferable
        )

        # 4. Education Comparison
        education_comp: Dict[str, Any] = {}
        for c in careers:
            edu_reqs = [
                {
                    "level": er.education_level,
                    "streams": er.preferred_streams or [],
                    "subjects": er.subject_prerequisites or [],
                    "type": er.requirement_type
                }
                for er in c.education_requirements
            ]
            education_comp[c.slug] = edu_reqs

        # 5. Difficulty Ranking
        difficulty_ranking = []
        for idx, item in enumerate(comparison_items):
            score = 50
            if "High" in item.entry_barrier:
                score += 35
            elif "Accessible" in item.entry_barrier:
                score -= 15
            if item.statutory_exam:
                score += 15
            difficulty_ranking.append({
                "career_slug": item.slug,
                "title": item.title,
                "difficulty_score": score,
                "entry_barrier": item.entry_barrier
            })
        difficulty_ranking.sort(key=lambda x: x["difficulty_score"], reverse=True)

        # 6. Transition Feasibility Analysis
        transition_feasibility: Dict[str, Any] = {}
        for i in range(len(careers)):
            for j in range(len(careers)):
                if i != j:
                    c1 = careers[i]
                    c2 = careers[j]
                    pair_key = f"{c1.slug}_to_{c2.slug}"
                    
                    # Check if DB relationship exists
                    db_rel = self.db.query(CareerRelationship).filter(
                        CareerRelationship.source_career_id == c1.id,
                        CareerRelationship.target_career_id == c2.id
                    ).first()

                    c1_skills = skills_by_career[c1.slug]
                    c2_skills = skills_by_career[c2.slug]
                    overlap_ratio = len(c1_skills & c2_skills) / max(1, len(c2_skills))

                    if db_rel and db_rel.relationship_type in ["TRANSITION", "ADJACENT"]:
                        feasibility = "HIGH"
                        time_est = "3-6 months"
                        rationale = db_rel.notes or f"Natural transition path with high skill overlap ({int(overlap_ratio*100)}%)."
                    elif c2.is_regulated and not c1.is_regulated:
                        feasibility = "VERY_LOW"
                        time_est = "3-5+ years"
                        rationale = f"Requires complete statutory qualifying education and licensure ({c2.display_name})."
                    elif overlap_ratio >= 0.4:
                        feasibility = "MODERATE"
                        time_est = "6-12 months"
                        rationale = f"Significant transferable skills ({int(overlap_ratio*100)}% overlap); requires targeted bridge upskilling."
                    else:
                        feasibility = "LOW"
                        time_est = "1-2 years"
                        rationale = f"Low direct overlap ({int(overlap_ratio*100)}%); requires foundational career pivoting."

                    transition_feasibility[pair_key] = {
                        "feasibility": feasibility,
                        "overlap_percentage": round(overlap_ratio * 100, 1),
                        "estimated_transition_time": time_est,
                        "rationale": rationale,
                        "bridge_skills_needed": list(c2_skills - c1_skills)
                    }

        summary = f"Compared {len(careers)} careers: {', '.join(c.display_name for c in careers)}. "
        if shared_slugs:
            summary += f"They share {len(shared_slugs)} foundational skill(s): {', '.join(shared_slugs)}. "
        else:
            summary += "They have distinct specialized skill profiles. "

        return CareerComparisonResponse(
            careers=comparison_items,
            skill_overlap=skill_overlap,
            education_comparison=education_comp,
            difficulty_ranking=difficulty_ranking,
            transition_feasibility=transition_feasibility,
            comparison_summary=summary,
            decision_trace=trace
        )

    def get_alternative_careers(
        self,
        career_slug: str,
        limit: int = 5
    ) -> AlternativeCareersResponse:
        """
        Discover alternative, adjacent, and bridge careers for a given career.
        Combines explicit relationship graph data with algorithmic skill similarity.
        """
        trace: Dict[str, Any] = {
            "source_slug": career_slug,
            "relationship_matches": 0,
            "skill_overlap_matches": 0,
            "evaluated_candidates": []
        }

        source = self.db.query(Career).filter(Career.slug == career_slug).first()
        if not source:
            raise ValueError(f"Career '{career_slug}' not found.")

        # Source skill set
        source_skills = {csr.skill.slug for csr in source.skill_requirements if csr.skill}

        alternatives: List[AlternativeCareerItem] = []
        seen_career_ids: Set[str] = {source.id}

        # 1. Check explicit relationships in DB (outgoing & incoming)
        outgoing_rels = self.db.query(CareerRelationship).filter(
            CareerRelationship.source_career_id == source.id
        ).all()

        for r in outgoing_rels:
            target = r.target_career
            if target and target.id not in seen_career_ids:
                seen_career_ids.add(target.id)
                t_skills = {csr.skill.slug for csr in target.skill_requirements if csr.skill}
                sim = len(source_skills & t_skills) / max(1, len(source_skills | t_skills))

                alternatives.append(AlternativeCareerItem(
                    career_id=target.id,
                    title=target.display_name,
                    slug=target.slug,
                    domain=target.domain.name if target.domain else "General",
                    relationship_type=r.relationship_type,
                    transferable_skills=r.transferable_skills or list(source_skills & t_skills),
                    bridge_skills=r.bridge_skills or list(t_skills - source_skills),
                    similarity_score=round(max(0.65, sim), 2),
                    rationale=r.notes or f"Direct {r.relationship_type.lower()} relationship defined in career knowledge graph."
                ))
                trace["relationship_matches"] += 1

        # 2. Check incoming relationships (careers that lead to this career)
        incoming_rels = self.db.query(CareerRelationship).filter(
            CareerRelationship.target_career_id == source.id
        ).all()

        for r in incoming_rels:
            src = r.source_career
            if src and src.id not in seen_career_ids and len(alternatives) < limit:
                seen_career_ids.add(src.id)
                s_skills = {csr.skill.slug for csr in src.skill_requirements if csr.skill}
                sim = len(source_skills & s_skills) / max(1, len(source_skills | s_skills))

                alternatives.append(AlternativeCareerItem(
                    career_id=src.id,
                    title=src.display_name,
                    slug=src.slug,
                    domain=src.domain.name if src.domain else "General",
                    relationship_type="PREDECESSOR" if r.relationship_type == "TRANSITION" else "ADJACENT",
                    transferable_skills=r.transferable_skills or list(source_skills & s_skills),
                    bridge_skills=r.bridge_skills or list(source_skills - s_skills),
                    similarity_score=round(max(0.55, sim), 2),
                    rationale=f"Related feeder or adjacent career: {r.notes or src.display_name}."
                ))
                trace["relationship_matches"] += 1

        # 3. Algorithmic skill similarity fallback for same domain / taxonomy
        if len(alternatives) < limit:
            all_other_careers = self.db.query(Career).filter(
                Career.id.notin_(list(seen_career_ids)),
                Career.is_active == True
            ).all()

            scored_candidates = []
            for other in all_other_careers:
                other_skills = {csr.skill.slug for csr in other.skill_requirements if csr.skill}
                intersect = source_skills & other_skills
                union = source_skills | other_skills
                jaccard = len(intersect) / max(1, len(union))

                # Same family bonus
                if source.career_family_id and other.career_family_id == source.career_family_id:
                    jaccard += 0.25
                # Same domain bonus
                elif source.career_domain_id and other.career_domain_id == source.career_domain_id:
                    jaccard += 0.15

                scored_candidates.append((other, jaccard, intersect, other_skills - source_skills))

            scored_candidates.sort(key=lambda x: x[1], reverse=True)

            for cand, score, shared, bridge in scored_candidates:
                if len(alternatives) >= limit:
                    break
                seen_career_ids.add(cand.id)
                rel_type = "ADJACENT" if cand.career_domain_id == source.career_domain_id else "ALTERNATIVE"
                alternatives.append(AlternativeCareerItem(
                    career_id=cand.id,
                    title=cand.display_name,
                    slug=cand.slug,
                    domain=cand.domain.name if cand.domain else "General",
                    relationship_type=rel_type,
                    transferable_skills=list(shared),
                    bridge_skills=list(bridge),
                    similarity_score=round(min(0.95, score), 2),
                    rationale=f"High skill and domain proximity in {cand.domain.name if cand.domain else 'industry'}."
                ))
                trace["skill_overlap_matches"] += 1

        # Sort alternatives by similarity score
        alternatives.sort(key=lambda x: x.similarity_score, reverse=True)

        return AlternativeCareersResponse(
            source_career_slug=source.slug,
            source_career_title=source.display_name,
            alternatives=alternatives[:limit],
            decision_trace=trace
        )
