from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.profile import LearnerProfile
from backend.app.models.skill import Skill, LearnerSkill
from backend.app.models.progress import Progress
from backend.app.models.resource import LearningResource, ResourceSkill
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.schemas.intelligence import SkillMasteryOut

PHASE7_MASTERY_MODEL_VERSION = "phase7.mastery.v1"

# Weights for multi-factor demonstrated mastery
MASTERY_WEIGHTS = {
    "assessment_evidence": 0.35,
    "completion_evidence": 0.30,
    "quiz_evidence": 0.15,
    "repetition_evidence": 0.10,
    "confidence_prior": 0.10
}

COMPETENCY_TIERS = [
    (0.90, "Mastery"),
    (0.75, "Strong"),
    (0.60, "Competent"),
    (0.40, "Developing"),
    (0.20, "Beginner"),
    (0.00, "Unknown"),
]

def score_to_tier(score: float) -> str:
    for threshold, tier in COMPETENCY_TIERS:
        if score >= threshold:
            return tier
    return "Unknown"

class SkillMasteryEngine:
    def __init__(self, db: Session):
        self.db = db

    def calculate_skill_mastery(self, profile_id: str, skill_slug: str) -> SkillMasteryOut:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        skill = self.db.query(Skill).filter(Skill.slug == skill_slug).first()

        # 1. Base Confidence Prior from Profile
        conf_map = dict(profile.skill_confidence_map or {})
        prior_conf = float(conf_map.get(skill_slug, 0.20))

        # 2. Completed Resources Evidence targeting this skill
        completed_progress = (
            self.db.query(Progress)
            .join(LearningResource, Progress.resource_id == LearningResource.id)
            .join(ResourceSkill, ResourceSkill.resource_id == LearningResource.id)
            .join(Skill, ResourceSkill.skill_id == Skill.id)
            .filter(
                Progress.profile_id == profile_id,
                Progress.status == "completed",
                Skill.slug == skill_slug
            )
            .all()
        )
        completion_count = len(completed_progress)
        completion_evidence = min(1.0, completion_count * 0.40)

        # 3. Assessment Questions Evidence (Phase 10: AssessmentAttemptEvidence)
        from backend.app.models.assessment import AssessmentAttemptEvidence
        responses = (
            self.db.query(AssessmentAttemptEvidence)
            .filter(
                AssessmentAttemptEvidence.profile_id == profile_id,
                AssessmentAttemptEvidence.skill_slug == skill_slug
            )
            .all()
        )
        if responses:
            correct = sum(1 for r in responses if r.is_correct)
            assessment_evidence = round(correct / len(responses), 4)
        else:
            assessment_evidence = prior_conf

        # 4. Behavior & Repetition Evidence
        events = (
            self.db.query(BehaviorEvent)
            .filter(
                BehaviorEvent.profile_id == profile_id,
                BehaviorEvent.skill_slug == skill_slug
            )
            .all()
        )
        evidence_count = completion_count + len(responses) + len(events)
        repetition_evidence = min(1.0, len(events) * 0.20)
        quiz_evidence = assessment_evidence

        # 5. Composite Demonstrated Mastery Calculation
        raw_score = (
            MASTERY_WEIGHTS["assessment_evidence"] * assessment_evidence
            + MASTERY_WEIGHTS["completion_evidence"] * completion_evidence
            + MASTERY_WEIGHTS["quiz_evidence"] * quiz_evidence
            + MASTERY_WEIGHTS["repetition_evidence"] * repetition_evidence
            + MASTERY_WEIGHTS["confidence_prior"] * prior_conf
        )
        mastery_score = round(max(0.0, min(1.0, raw_score)), 4)
        tier = score_to_tier(mastery_score)

        # Last demonstrated timestamp
        last_ts = None
        if events:
            last_ts = max(e.timestamp for e in events)
        elif completed_progress:
            last_ts = max(p.last_accessed_at for p in completed_progress if p.last_accessed_at)

        # Explanation
        explanation = (
            f"Demonstrated {tier} level ({int(mastery_score * 100)}%) with {evidence_count} verified evidence points "
            f"(including {completion_count} completed modules and {len(responses)} assessment questions)."
        )

        return SkillMasteryOut(
            skill_slug=skill_slug,
            mastery_score=mastery_score,
            competency_tier=tier,
            evidence_count=evidence_count,
            contributing_factors={
                "assessment_factor": round(MASTERY_WEIGHTS["assessment_evidence"] * assessment_evidence, 4),
                "completion_factor": round(MASTERY_WEIGHTS["completion_evidence"] * completion_evidence, 4),
                "quiz_factor": round(MASTERY_WEIGHTS["quiz_evidence"] * quiz_evidence, 4),
                "repetition_factor": round(MASTERY_WEIGHTS["repetition_evidence"] * repetition_evidence, 4),
                "prior_factor": round(MASTERY_WEIGHTS["confidence_prior"] * prior_conf, 4)
            },
            explanation=explanation,
            last_demonstrated=last_ts,
            confidence="high" if evidence_count >= 3 else "medium" if evidence_count >= 1 else "low",
            model_version=PHASE7_MASTERY_MODEL_VERSION
        )

    def calculate_all_mastery(self, profile_id: str) -> List[SkillMasteryOut]:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            return []
        conf_map = dict(profile.skill_confidence_map or {})
        all_skills = list(conf_map.keys())
        if not all_skills:
            all_skills = [s.slug for s in self.db.query(Skill).limit(8).all()]

        return [self.calculate_skill_mastery(profile_id, s) for s in all_skills]
