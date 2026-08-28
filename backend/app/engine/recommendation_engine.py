from typing import Dict, List, Any, Optional, Set
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.recommendation import Recommendation
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.skill_gap import SkillGapEngine, SkillGapReport
from backend.app.engine.candidate_retriever import CandidateRetriever
from backend.app.engine.hard_constraints import HardConstraintFilter
from backend.app.engine.semantic import SemanticMatcher
from backend.app.engine.scorer import RecommendationScorer, ScoredCandidate
from backend.app.engine.ranker import DeterministicRanker
from backend.app.engine.diversity import DiversitySelector
from backend.app.engine.sequencer import PathSequencer, PhaseDefinition
from backend.app.engine.explainer import RecommendationExplainer
from backend.app.engine.fingerprint import StateFingerprinter
from backend.app.engine.embedding_service import EmbeddingService
from backend.app.core.weights import RECOMMENDATION_ALGO_VERSION
from backend.app.core.config import settings

class RecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
        self.skill_dag = SkillDAG(db)
        self.gap_engine = SkillGapEngine(db)
        self.retriever = CandidateRetriever(db, self.skill_dag)
        self.filter = HardConstraintFilter(self.skill_dag)
        self.semantic_matcher = SemanticMatcher()
        self.scorer = RecommendationScorer(self.skill_dag, self.semantic_matcher)
        self.diversity_selector = DiversitySelector(max_per_provider=3)
        self.sequencer = PathSequencer(self.skill_dag)
        self.embed_service = EmbeddingService()

    def generate(
        self,
        profile_id: str,
        goal_id: Optional[str] = None,
        top_k: int = 10,
        persist: bool = True
    ) -> Dict[str, Any]:
        """
        Executes full deterministic recommendation pipeline:
        Learner State -> Skill Gap -> Candidate Retrieval -> Hard Constraints ->
        Semantic Matching -> Scoring -> Ranking -> Diversity -> Path Sequencing ->
        Explanation -> Persistence -> Return Result
        """
        # 1. Load Learner State
        profile = self.db.query(LearnerProfile).filter(LearnerProfile.id == profile_id).first()
        if not profile:
            raise ValueError(f"LearnerProfile with id '{profile_id}' not found")

        # Find primary goal or specified goal
        if goal_id:
            goal = self.db.query(Goal).filter(Goal.id == goal_id, Goal.profile_id == profile_id).first()
        else:
            goal = self.db.query(Goal).filter(Goal.profile_id == profile_id, Goal.is_primary == True).first()
            if not goal:
                goal = self.db.query(Goal).filter(Goal.profile_id == profile_id).first()

        if not goal:
            raise ValueError(f"No goal found for learner profile '{profile_id}'")

        # Load completed resource IDs & feedback history
        completed_progress = (
            self.db.query(Progress)
            .filter(Progress.profile_id == profile_id, Progress.status == "completed")
            .all()
        )
        completed_ids: Set[str] = {p.resource_id for p in completed_progress}

        feedbacks = self.db.query(Feedback).filter(Feedback.profile_id == profile_id).all()
        feedback_history = {f.resource_id: f.feedback_type for f in feedbacks}

        # 2. Skill Gap Analysis
        gap_report = self.gap_engine.calculate(profile, goal)

        # 3. Candidate Retrieval
        candidates = self.retriever.retrieve(goal=goal, gap_report=gap_report)

        # 4. HARD CONSTRAINT FILTER
        confidence_map = dict(profile.skill_confidence_map or {})
        eligible_candidates, blocked_rejections = self.filter.filter_candidates(
            candidates=candidates,
            learner_confidence_map=confidence_map,
            completed_resource_ids=completed_ids
        )

        # 5. Semantic Matching (Learner vector representation)
        learner_text = self.embed_service.create_learner_embedding_text(
            target_role=goal.target_role,
            learning_objective=profile.learning_objective or "Career Placement",
            known_skills=[s for s, c in confidence_map.items() if c >= 0.40],
            target_skills=goal.target_skills or [],
            preferred_formats=profile.preferred_formats or []
        )
        learner_embedding_payload = self.embed_service.generate_embedding(learner_text)
        learner_vector = learner_embedding_payload.get("vector")

        # 6. Hybrid Multi-Signal Scoring
        scored_candidates: List[ScoredCandidate] = []
        for res in eligible_candidates:
            scored = self.scorer.score(
                resource=res,
                profile=profile,
                goal=goal,
                gap_report=gap_report,
                learner_vector=learner_vector,
                historical_engagement=0.50,
                feedback_history=feedback_history
            )
            scored_candidates.append(scored)

        # 7. Deterministic Ranking
        ranked_candidates = DeterministicRanker.rank(scored_candidates)

        # 8. Diversity Selection
        diverse_candidates = self.diversity_selector.select(ranked_candidates, top_k=top_k)

        # 9. Path Sequencing
        sequenced_phases = self.sequencer.sequence(diverse_candidates)

        # 10. Structured Explanations
        recommendations_out = []
        for rank_idx, cand in enumerate(diverse_candidates, start=1):
            expl = RecommendationExplainer.explain(cand, profile, goal)
            recommendations_out.append({
                "rank": rank_idx,
                "score": cand.composite_score,
                "resource": {
                    "id": cand.resource.id,
                    "title": cand.resource.title,
                    "slug": cand.resource.slug,
                    "provider": cand.resource.provider,
                    "url": cand.resource.url,
                    "difficulty": cand.resource.difficulty,
                    "estimated_hours": cand.resource.estimated_hours,
                    "quality_score": cand.resource.quality_score,
                    "format": cand.resource.format,
                    "resource_type": cand.resource.resource_type,
                    "skills": [rs.skill.name for rs in cand.resource.resource_skills]
                },
                "explanation": expl
            })

        # 11. State Fingerprint Generation
        fingerprint = StateFingerprinter.generate_fingerprint(
            profile=profile,
            goal=goal,
            completed_resource_ids=list(completed_ids)
        )

        # 12. Persistence Layer
        if persist:
            for item in recommendations_out:
                rec_record = Recommendation(
                    profile_id=profile_id,
                    resource_id=item["resource"]["id"],
                    score=item["score"],
                    rank=item["rank"],
                    algorithm_version=RECOMMENDATION_ALGO_VERSION,
                    embedding_model_version=settings.EMBEDDING_MODEL_VERSION,
                    recommendation_state_fingerprint=fingerprint
                )
                self.db.add(rec_record)
            self.db.commit()

        # Format sequenced phases for output
        phases_out = []
        for p in sequenced_phases:
            if p.items:
                phases_out.append({
                    "phase_number": p.number,
                    "phase_name": p.name,
                    "description": p.description,
                    "items": [
                        {
                            "resource_id": it.resource.id,
                            "title": it.resource.title,
                            "score": it.composite_score,
                            "difficulty": it.resource.difficulty,
                            "estimated_hours": it.resource.estimated_hours
                        }
                        for it in p.items
                    ]
                })

        return {
            "profile_id": profile_id,
            "goal_id": goal.id,
            "goal_role": goal.target_role,
            "fingerprint": fingerprint,
            "algorithm_version": RECOMMENDATION_ALGO_VERSION,
            "recommendations": recommendations_out,
            "phases": phases_out,
            "blocked_count": len(blocked_rejections),
            "rejections": [r.to_dict() for r in blocked_rejections]
        }
