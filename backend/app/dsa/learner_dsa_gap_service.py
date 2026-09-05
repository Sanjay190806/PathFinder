from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.models.dsa import DSATopic
from backend.app.company.role_requirement_service import RoleRequirementService
from backend.app.dsa.dsa_priority_service import DSAPriorityService


class LearnerDSAGapService:
    @staticmethod
    def evaluate_learner_gaps(
        db: Session,
        company_slug: str,
        role_slug: str,
        learner_id: str,
    ) -> Dict[str, Any]:
        """Calculates comprehensive skill, technology, and topic-by-topic DSA gaps with prerequisite blocking analysis."""
        # 1. Fetch requirements and DSA priority profile
        role_reqs = RoleRequirementService.get_role_requirements_profile(db, company_slug, role_slug)
        if not role_reqs:
            return {"error": f"Role '{role_slug}' at '{company_slug}' not found"}

        dsa_profile = DSAPriorityService.get_role_dsa_priority(
            db, company_slug=company_slug, role_slug=role_slug
        )

        # 2. Fetch learner profile and skills
        profile = db.query(LearnerProfile).filter(LearnerProfile.id == learner_id).first()
        learner_skills = (
            db.query(LearnerSkill)
            .filter(LearnerSkill.profile_id == learner_id)
            .all()
        )
        skill_id_map = {ls.skill_id: ls for ls in learner_skills}

        # Also map by slug for easy lookup
        skill_slug_map: Dict[str, LearnerSkill] = {}
        for ls in learner_skills:
            if ls.skill:
                skill_slug_map[ls.skill.slug.lower()] = ls

        # Also check profile confidence map
        prof_conf_map = dict(profile.skill_confidence_map or {}) if profile else {}

        # 3. Evaluate General & Role Skills
        required_skills = role_reqs.get("skills", [])
        skill_evaluations = []
        critical_skill_gaps = []
        high_skill_gaps = []
        satisfied_skills = []

        now = datetime.now(timezone.utc)

        for req in required_skills:
            sk_id = req.get("skill_id")
            sk_slug = req.get("skill_slug", "").lower()
            ls = skill_id_map.get(sk_id) or skill_slug_map.get(sk_slug)

            conf = 0.0
            decay_risk = False
            verified = False

            if ls:
                conf = ls.assessed_confidence or 0.20
                verified = ls.verified
                if ls.last_assessed_at:
                    last_a = ls.last_assessed_at
                    if last_a.tzinfo is None:
                        last_a = last_a.replace(tzinfo=timezone.utc)
                    if (now - last_a).days > 180:
                        decay_risk = True
            elif sk_slug in prof_conf_map:
                conf = prof_conf_map[sk_slug]

            # Determine gap status
            req_type = req.get("requirement_type", "REQUIRED")
            importance = req.get("importance", "HIGH")

            if conf >= 0.75:
                status = "SATISFIED"
                gap_priority = "LOW"
            elif conf >= 0.40:
                status = "DEVELOPING"
                gap_priority = "MEDIUM" if importance == "HIGH" else "LOW"
            else:
                if req_type == "REQUIRED" and importance == "HIGH":
                    status = "CRITICAL_GAP"
                    gap_priority = "CRITICAL"
                elif importance in ("HIGH", "MEDIUM"):
                    status = "GAP"
                    gap_priority = "HIGH"
                else:
                    status = "GAP"
                    gap_priority = "MEDIUM"

            eval_item = {
                "skill_id": sk_id,
                "skill_name": req.get("skill_name"),
                "skill_slug": sk_slug,
                "requirement_type": req_type,
                "importance": importance,
                "minimum_level": req.get("minimum_level", "WORKING"),
                "learner_confidence": round(conf, 2),
                "status": status,
                "gap_priority": gap_priority,
                "verified": verified,
                "decay_risk": decay_risk,
                "tier": req.get("tier", "TIER_1_COMPANY_VERIFIED"),
            }
            skill_evaluations.append(eval_item)

            if status == "CRITICAL_GAP":
                critical_skill_gaps.append(eval_item)
            elif status == "GAP":
                high_skill_gaps.append(eval_item)
            elif status == "SATISFIED":
                satisfied_skills.append(eval_item)

        # 4. Evaluate Topic-by-Topic DSA
        all_dsa_topics = dsa_profile.get("all_topics", [])
        is_dsa_applicable = dsa_profile.get("priority_level") != "NOT_APPLICABLE"

        dsa_topic_evaluations = []
        dsa_confidence_lookup: Dict[str, float] = {}

        # Pre-compute learner confidence for each DSA topic
        for dt in all_dsa_topics:
            t_slug = dt["topic_slug"].lower()
            ls = skill_slug_map.get(t_slug)
            conf = 0.0
            if ls:
                conf = ls.assessed_confidence or 0.20
            elif t_slug in prof_conf_map:
                conf = prof_conf_map[t_slug]
            elif "dsa" in prof_conf_map:
                # Baseline fallback if general DSA assessed
                conf = prof_conf_map["dsa"] * 0.8
            dsa_confidence_lookup[t_slug] = conf

        # Evaluate each topic with prerequisite checking
        critical_dsa_gaps = []
        prerequisite_blockers = []

        if is_dsa_applicable:
            for dt in all_dsa_topics:
                t_slug = dt["topic_slug"].lower()
                conf = dsa_confidence_lookup.get(t_slug, 0.0)
                is_core = dt.get("is_core", False)
                prio_level = dt.get("priority_level", "MEDIUM")

                # Check prerequisites
                prereqs = dt.get("prerequisites", [])
                missing_prereqs = [
                    p for p in prereqs if dsa_confidence_lookup.get(p.lower(), 0.0) < 0.40
                ]

                if conf >= 0.75:
                    status = "SATISFIED"
                    gap_prio = "LOW"
                elif conf >= 0.40:
                    status = "DEVELOPING"
                    gap_prio = "MEDIUM" if is_core else "LOW"
                else:
                    if is_core and dsa_profile.get("priority_level") in ("VERY_HIGH", "HIGH"):
                        status = "CRITICAL_GAP"
                        gap_prio = "CRITICAL"
                    else:
                        status = "GAP"
                        gap_prio = "HIGH" if is_core else "MEDIUM"

                is_blocked = len(missing_prereqs) > 0 and status in ("GAP", "CRITICAL_GAP")

                dsa_eval = {
                    "topic_slug": t_slug,
                    "topic_name": dt.get("topic_name"),
                    "priority_level": prio_level,
                    "target_difficulty": dt.get("interview_difficulty", "MEDIUM"),
                    "learner_confidence": round(conf, 2),
                    "status": status,
                    "gap_priority": gap_prio,
                    "is_core": is_core,
                    "prerequisites": prereqs,
                    "missing_prerequisites": missing_prereqs,
                    "is_blocked_by_prerequisite": is_blocked,
                    "unblock_recommendation": (
                        f"Master foundational {', '.join(missing_prereqs)} before advancing to {dt.get('topic_name')}."
                        if is_blocked
                        else None
                    ),
                }
                dsa_topic_evaluations.append(dsa_eval)

                if status == "CRITICAL_GAP":
                    critical_dsa_gaps.append(dsa_eval)
                if is_blocked:
                    prerequisite_blockers.append({
                        "blocked_topic": dt.get("topic_name"),
                        "blocked_slug": t_slug,
                        "blocking_prerequisites": missing_prereqs,
                    })

        # 5. Deterministically Select Next Recommended Topic
        # Must be unmastered AND prerequisite-safe (no missing prereqs)
        candidate_next_topics = [
            t for t in dsa_topic_evaluations
            if t["status"] in ("CRITICAL_GAP", "GAP", "DEVELOPING")
            and not t["is_blocked_by_prerequisite"]
        ]

        # Prioritize CRITICAL_GAP > GAP > DEVELOPING, then core > non-core
        def rank_key(item):
            status_score = 3 if item["status"] == "CRITICAL_GAP" else 2 if item["status"] == "GAP" else 1
            core_score = 1 if item["is_core"] else 0
            return (status_score, core_score, -item["learner_confidence"])

        candidate_next_topics.sort(key=rank_key, reverse=True)
        next_topic = candidate_next_topics[0] if candidate_next_topics else None

        # 6. Overall Readiness & Decision Trace
        total_evals = len(skill_evaluations) + (len(dsa_topic_evaluations) if is_dsa_applicable else 0)
        satisfied_count = len(satisfied_skills) + len([t for t in dsa_topic_evaluations if t["status"] == "SATISFIED"])
        readiness_pct = round((satisfied_count / total_evals * 100), 1) if total_evals > 0 else 0.0

        decision_trace = {
            "decision": "READINESS_EVALUATION",
            "readiness_percentage": readiness_pct,
            "rationale": (
                f"Learner has {len(critical_skill_gaps)} critical skill gaps and {len(critical_dsa_gaps)} critical DSA gaps "
                f"for '{role_reqs.get('role_name')}' at '{role_reqs.get('company_name')}'. "
                + (f"Recommended next action: Focus on {next_topic['topic_name']}." if next_topic else "Requirements largely satisfied.")
            ),
            "factors": [
                {
                    "name": "Critical Skill Gaps",
                    "count": len(critical_skill_gaps),
                    "items": [g["skill_name"] for g in critical_skill_gaps],
                },
                {
                    "name": "Critical DSA Gaps",
                    "count": len(critical_dsa_gaps),
                    "items": [g["topic_name"] for g in critical_dsa_gaps],
                },
                {
                    "name": "Prerequisite Blockers",
                    "count": len(prerequisite_blockers),
                    "blockers": prerequisite_blockers,
                },
            ],
        }

        return {
            "company_slug": company_slug,
            "company_name": role_reqs.get("company_name"),
            "role_slug": role_slug,
            "role_name": role_reqs.get("role_name"),
            "learner_id": learner_id,
            "readiness_percentage": readiness_pct,
            "is_dsa_applicable": is_dsa_applicable,
            "dsa_priority_level": dsa_profile.get("priority_level"),
            "summary": {
                "total_skills_evaluated": len(skill_evaluations),
                "critical_gaps_count": len(critical_skill_gaps) + len(critical_dsa_gaps),
                "high_gaps_count": len(high_skill_gaps),
                "satisfied_count": satisfied_count,
                "prerequisite_blockers_count": len(prerequisite_blockers),
            },
            "next_recommended_topic": next_topic,
            "prerequisite_blockers": prerequisite_blockers,
            "critical_skill_gaps": critical_skill_gaps,
            "skill_evaluations": skill_evaluations,
            "dsa_topic_evaluations": dsa_topic_evaluations,
            "decision_trace": decision_trace,
        }

    @staticmethod
    def compare_company_gaps(
        db: Session,
        role_slug: str,
        company_slug_a: str,
        company_slug_b: str,
        learner_id: str,
        role_slug_b: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Compares learner skill & DSA gap profiles between two target companies for a role."""
        effective_role_b = role_slug_b or role_slug
        gaps_a = LearnerDSAGapService.evaluate_learner_gaps(db, company_slug_a, role_slug, learner_id)
        gaps_b = LearnerDSAGapService.evaluate_learner_gaps(db, company_slug_b, effective_role_b, learner_id)

        # If role_slug not found directly in company B, attempt lookup by common role aliases
        if "error" in gaps_b and not role_slug_b:
            for alt_slug in ["software-engineer", "sde-1", "backend-engineer"]:
                alt_gaps = LearnerDSAGapService.evaluate_learner_gaps(db, company_slug_b, alt_slug, learner_id)
                if "error" not in alt_gaps:
                    gaps_b = alt_gaps
                    break

        if "error" in gaps_a:
            return gaps_a
        if "error" in gaps_b:
            return gaps_b

        diff_skills = []
        skills_b_map = {s["skill_slug"]: s for s in gaps_b["skill_evaluations"]}
        for sa in gaps_a["skill_evaluations"]:
            slug = sa["skill_slug"]
            sb = skills_b_map.get(slug)
            if not sb or sb["importance"] != sa["importance"] or sb["status"] != sa["status"]:
                diff_skills.append({
                    "skill_name": sa["skill_name"],
                    "skill_slug": slug,
                    company_slug_a: {"status": sa["status"], "importance": sa["importance"]},
                    company_slug_b: {"status": sb["status"] if sb else "NOT_REQUIRED", "importance": sb["importance"] if sb else "NONE"},
                })

        return {
            "role_slug": role_slug,
            "company_a": {
                "slug": company_slug_a,
                "name": gaps_a["company_name"],
                "readiness": gaps_a["readiness_percentage"],
                "critical_gaps": len(gaps_a["critical_skill_gaps"]),
                "dsa_priority": gaps_a["dsa_priority_level"],
            },
            "company_b": {
                "slug": company_slug_b,
                "name": gaps_b["company_name"],
                "readiness": gaps_b["readiness_percentage"],
                "critical_gaps": len(gaps_b["critical_skill_gaps"]),
                "dsa_priority": gaps_b["dsa_priority_level"],
            },
            "differential_requirements": diff_skills,
            "next_topic_a": gaps_a["next_recommended_topic"],
            "next_topic_b": gaps_b["next_recommended_topic"],
        }
