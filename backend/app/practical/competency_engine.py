from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.practical_competency import PracticalCompetency, PracticalEvidenceRecord
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.schemas.practical import PracticalEvidenceCreate, PracticalCompetencyOut

PRACTICAL_COMPETENCY_TIERS = [
    (0.90, "Mastery"),
    (0.75, "Strong"),
    (0.60, "Competent"),
    (0.40, "Developing"),
    (0.20, "Beginner"),
    (0.00, "Unknown"),
]

PRACTICAL_DIMENSION_WEIGHTS = {
    "application": 0.30,
    "problem_solving": 0.20,
    "implementation": 0.15,
    "debugging": 0.15,
    "decision_making": 0.10,
    "discipline_and_tools": 0.10,
}

def score_to_practical_level(score: float) -> str:
    for threshold, level in PRACTICAL_COMPETENCY_TIERS:
        if score >= threshold:
            return level
    return "Unknown"

class PracticalCompetencyEngine:
    def __init__(self, db: Session):
        self.db = db

    def record_evidence(
        self,
        profile_id: str,
        evidence_in: PracticalEvidenceCreate
    ) -> PracticalEvidenceRecord:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"Profile {profile_id} not found")

        record = PracticalEvidenceRecord(
            profile_id=profile_id,
            skill_slug=evidence_in.skill_slug,
            evidence_type=evidence_in.evidence_type,
            source_id=evidence_in.source_id,
            score=evidence_in.score,
            confidence=evidence_in.confidence,
            evaluator=evidence_in.evaluator,
            metadata_payload=evidence_in.metadata_payload or {},
            timestamp=datetime.now(timezone.utc)
        )
        self.db.add(record)
        self.db.flush()

        # Update or create aggregate PracticalCompetency
        self._recalculate_competency(profile_id=profile_id, skill_slug=evidence_in.skill_slug)
        self.db.commit()
        self.db.refresh(record)
        return record

    def _recalculate_competency(self, profile_id: str, skill_slug: str) -> PracticalCompetency:
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        primary_goal = next((g for g in profile.goals if g.is_primary), profile.goals[0] if profile.goals else None)
        target_role = primary_goal.target_role if primary_goal else "Engineering Role"

        all_evidence = (
            self.db.query(PracticalEvidenceRecord)
            .filter(
                PracticalEvidenceRecord.profile_id == profile_id,
                PracticalEvidenceRecord.skill_slug == skill_slug
            )
            .all()
        )

        if not all_evidence:
            avg_score = 0.0
            confidence = 0.20
            dimensions = {k: 0.0 for k in PRACTICAL_DIMENSION_WEIGHTS}
            last_ts = None
        else:
            # Weighted average based on individual evidence score & confidence
            total_weight = sum(e.confidence for e in all_evidence)
            weighted_sum = sum(e.score * e.confidence for e in all_evidence)
            avg_score = round(weighted_sum / max(0.1, total_weight), 4)
            confidence = min(1.0, 0.40 + len(all_evidence) * 0.15)
            valid_ts = [e.timestamp.replace(tzinfo=None) if e.timestamp.tzinfo else e.timestamp for e in all_evidence if e.timestamp]
            last_ts = max(valid_ts) if valid_ts else None
            dimensions = {
                "application": avg_score,
                "problem_solving": round(avg_score * 0.95, 4),
                "implementation": avg_score,
                "debugging": round(avg_score * 0.90, 4),
                "decision_making": round(avg_score * 0.85, 4),
                "discipline_and_tools": avg_score,
            }

        level = score_to_practical_level(avg_score)

        comp = (
            self.db.query(PracticalCompetency)
            .filter(
                PracticalCompetency.profile_id == profile_id,
                PracticalCompetency.skill_slug == skill_slug
            )
            .first()
        )

        if not comp:
            comp = PracticalCompetency(
                profile_id=profile_id,
                career_role=target_role,
                skill_slug=skill_slug,
                level=level,
                score=avg_score,
                confidence=confidence,
                evidence_count=len(all_evidence),
                dimensions=dimensions,
                last_demonstrated_at=last_ts
            )
            self.db.add(comp)
        else:
            comp.career_role = target_role
            comp.level = level
            comp.score = avg_score
            comp.confidence = confidence
            comp.evidence_count = len(all_evidence)
            comp.dimensions = dimensions
            comp.last_demonstrated_at = last_ts

        self.db.flush()
        return comp

    def get_competency(self, profile_id: str, skill_slug: str) -> PracticalCompetencyOut:
        comp = (
            self.db.query(PracticalCompetency)
            .filter(
                PracticalCompetency.profile_id == profile_id,
                PracticalCompetency.skill_slug == skill_slug
            )
            .first()
        )
        if not comp:
            comp = self._recalculate_competency(profile_id=profile_id, skill_slug=skill_slug)

        explanation = (
            f"Practical application for '{skill_slug}' is rated {comp.level} ({int(comp.score * 100)}%) "
            f"with {comp.evidence_count} verified practical artifacts and {int(comp.confidence * 100)}% evaluation confidence."
        )

        return PracticalCompetencyOut(
            id=comp.id,
            profile_id=comp.profile_id,
            career_role=comp.career_role,
            skill_slug=comp.skill_slug,
            competency_type=comp.competency_type,
            level=comp.level,
            score=comp.score,
            confidence=comp.confidence,
            evidence_count=comp.evidence_count,
            dimensions=comp.dimensions or {},
            last_demonstrated_at=comp.last_demonstrated_at,
            explanation=explanation
        )

    def get_all_competencies(self, profile_id: str) -> List[PracticalCompetencyOut]:
        comps = self.db.query(PracticalCompetency).filter(PracticalCompetency.profile_id == profile_id).all()
        if not comps:
            profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
            if profile and profile.skill_confidence_map:
                return [self.get_competency(profile_id, s) for s in profile.skill_confidence_map.keys()]
            return []
        return [self.get_competency(profile_id, c.skill_slug) for c in comps]
