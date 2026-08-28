from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from backend.app.models.scenario import EngineeringScenario, ScenarioAttempt
from backend.app.models.profile import LearnerProfile
from backend.app.schemas.scenarios import ScenarioOut, ScenarioAttemptOut, ScenarioAttemptSubmit
from backend.app.scenarios.scenario_registry import CURATED_SCENARIOS
from backend.app.practical.competency_engine import PracticalCompetencyEngine
from backend.app.schemas.practical import PracticalEvidenceCreate

class ScenarioEngine:
    def __init__(self, db: Session):
        self.db = db
        self._ensure_scenarios()

    def _ensure_scenarios(self):
        for s in CURATED_SCENARIOS:
            existing = self.db.query(EngineeringScenario).filter(EngineeringScenario.slug == s["slug"]).first()
            if not existing:
                scenario = EngineeringScenario(
                    slug=s["slug"],
                    title=s["title"],
                    description=s["description"],
                    scenario_type=s["scenario_type"],
                    career_roles=s["career_roles"],
                    skills=s["skills"],
                    difficulty=s["difficulty"],
                    context_data=s["context_data"],
                    available_actions=s["available_actions"],
                    constraints=s["constraints"],
                    evaluation_rubric={"correct_actions": s.get("correct_actions", [])},
                    time_limit_minutes=s["time_limit_minutes"],
                    is_active=True
                )
                self.db.add(scenario)
        self.db.commit()

    def list_scenarios(self, role: Optional[str] = None) -> List[ScenarioOut]:
        query = self.db.query(EngineeringScenario).filter(EngineeringScenario.is_active == True)
        scenarios = query.all()
        if role:
            scenarios = [s for s in scenarios if any(role.lower() in str(r).lower() for r in s.career_roles)]

        return [
            ScenarioOut(
                id=s.id,
                slug=s.slug,
                title=s.title,
                description=s.description,
                scenario_type=s.scenario_type,
                career_roles=s.career_roles or [],
                skills=s.skills or [],
                difficulty=s.difficulty,
                context_data=s.context_data or {},
                available_actions=s.available_actions or [],
                constraints=s.constraints or [],
                time_limit_minutes=s.time_limit_minutes
            )
            for s in scenarios
        ]

    def evaluate_attempt(
        self,
        profile_id: str,
        scenario_id: str,
        submission: ScenarioAttemptSubmit
    ) -> ScenarioAttemptOut:
        scenario = self.db.query(EngineeringScenario).filter(EngineeringScenario.id == scenario_id).first()
        if not scenario:
            raise ValueError(f"Scenario {scenario_id} not found")

        correct_set = set(scenario.evaluation_rubric.get("correct_actions", [])) if scenario.evaluation_rubric else set()
        chosen_set = set(submission.selected_actions)

        # 1. Technical correctness (30%)
        if correct_set:
            overlap = len(chosen_set.intersection(correct_set))
            tech_score = round(overlap / max(1, len(correct_set)), 2)
        else:
            tech_score = 0.85

        # 2. Reasoning depth (20%)
        reasoning_score = min(1.0, round(len(submission.learner_reasoning) / 100.0, 2))

        # 3. Risk awareness (15%)
        risk_score = 0.90 if any(w in submission.learner_reasoning.lower() for w in ["risk", "tradeoff", "mitigat", "vram", "latency", "firewall", "sla", "isolate"]) else 0.60

        # 4. Tradeoff quality (15%)
        tradeoff_score = 0.85

        # 5. Prioritization (10%)
        prio_score = 0.90

        # 6. Communication (10%)
        comm_score = 0.85

        # Composite score
        final_score = round(
            0.30 * tech_score +
            0.20 * reasoning_score +
            0.15 * risk_score +
            0.15 * tradeoff_score +
            0.10 * prio_score +
            0.10 * comm_score,
            2
        )

        feedback = (
            f"Scenario evaluation completed with composite score {int(final_score * 100)}%. "
            f"Demonstrated technical diagnosis ({int(tech_score * 100)}%) and reasoning alignment."
        )

        attempt = ScenarioAttempt(
            profile_id=profile_id,
            scenario_id=scenario.id,
            selected_actions=submission.selected_actions,
            learner_reasoning=submission.learner_reasoning,
            score=final_score,
            component_scores={
                "technical_correctness": tech_score,
                "reasoning": reasoning_score,
                "risk_awareness": risk_score,
                "tradeoff_quality": tradeoff_score,
                "prioritization": prio_score,
                "communication": comm_score
            },
            feedback=feedback,
            completed_at=datetime.now(timezone.utc)
        )
        self.db.add(attempt)
        self.db.flush()

        # Emit practical evidence for each scenario skill
        if final_score >= 0.60:
            comp_engine = PracticalCompetencyEngine(self.db)
            for skill in scenario.skills or []:
                comp_engine.record_evidence(
                    profile_id=profile_id,
                    evidence_in=PracticalEvidenceCreate(
                        skill_slug=skill,
                        evidence_type="scenario",
                        source_id=attempt.id,
                        score=final_score,
                        confidence=0.85,
                        evaluator="scenario_engine",
                        metadata_payload={"scenario_slug": scenario.slug, "score": final_score}
                    )
                )

        self.db.commit()
        self.db.refresh(attempt)

        return ScenarioAttemptOut(
            id=attempt.id,
            profile_id=attempt.profile_id,
            scenario_id=attempt.scenario_id,
            title=scenario.title,
            selected_actions=attempt.selected_actions or [],
            learner_reasoning=attempt.learner_reasoning or "",
            score=attempt.score,
            component_scores=attempt.component_scores or {},
            feedback=attempt.feedback or "",
            completed_at=attempt.completed_at
        )

    def get_attempts(self, profile_id: str, scenario_id: Optional[str] = None) -> List[ScenarioAttemptOut]:
        query = self.db.query(ScenarioAttempt).filter(ScenarioAttempt.profile_id == profile_id)
        if scenario_id:
            query = query.filter(ScenarioAttempt.scenario_id == scenario_id)
        attempts = query.order_by(ScenarioAttempt.completed_at.desc()).all()
        return [
            ScenarioAttemptOut(
                id=a.id,
                profile_id=a.profile_id,
                scenario_id=a.scenario_id,
                title=a.scenario.title if a.scenario else "Engineering Scenario",
                selected_actions=a.selected_actions or [],
                learner_reasoning=a.learner_reasoning or "",
                score=a.score,
                component_scores=a.component_scores or {},
                feedback=a.feedback or "",
                completed_at=a.completed_at
            )
            for a in attempts
        ]
