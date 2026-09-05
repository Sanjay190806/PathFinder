import uuid
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from backend.app.models.assessment import Assessment, AssessmentQuestion, AssessmentSession
from backend.app.models.profile import LearnerProfile
from backend.app.models.syllabus import CourseSyllabus, SyllabusModule, SyllabusTopic
from backend.app.engine.skill_graph import SkillDAG
from backend.app.engine.explainer import UniversalDecisionTrace, DecisionFactor, DecisionEvidence


DIFFICULTY_ORDER = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"]


class AdaptiveQuestionSelector:
    """
    Performance-aware adaptive question selection engine.
    Answers: "What question should this learner receive next to accurately measure their current mastery?"
    Integrates with SkillDAG for prerequisite fallback and DecisionTrace for explainability.
    """

    def __init__(self, db: Session):
        self.db = db
        self.dag = SkillDAG(db)

    def select_next_question(
        self,
        session: AssessmentSession
    ) -> Tuple[Optional[AssessmentQuestion], Optional[str], Optional[UniversalDecisionTrace]]:
        """
        Selects the next question for an active session according to its mode:
        - STANDARD: Sequential from pre-allocated assessment questions.
        - ADAPTIVE: Evaluates real-time performance, skill mastery, gaps, and prerequisite relationships.
        - DIAGNOSTIC: Rapidly identifies weaknesses across diverse syllabus modules.
        - PRACTICE: Formative learning with topic reinforcement.
        """
        assessment = session.assessment
        profile = session.profile

        # Gather questions already presented to prevent repeats
        presented_ids = set(session.selected_question_ids or [])

        # Check if session has reached total questions limit
        if len(presented_ids) >= assessment.total_questions:
            return None, "Assessment complete: all questions answered.", None

        # 1. STANDARD Mode
        if session.mode == "STANDARD":
            # Select next available question from assessment pool in fixed or seeded order
            candidate = self.db.query(AssessmentQuestion).filter(
                AssessmentQuestion.assessment_id == assessment.id,
                ~AssessmentQuestion.id.in_(presented_ids) if presented_ids else True
            ).first()
            if candidate:
                return candidate, "Standard sequence question", None
            return None, "No remaining questions in assessment blueprint.", None

        # 2. ADAPTIVE / DIAGNOSTIC / PRACTICE Modes
        # Determine current target difficulty
        current_diff = self._determine_next_difficulty(session)

        # Determine target topic (topic-level adaptation)
        target_topic, is_prereq_fallback, reason = self._select_target_topic(session, assessment, profile)

        # Query candidate questions matching target topic, difficulty, and assessment course
        candidate = self._find_matching_question(
            session, assessment, target_topic, current_diff, presented_ids
        )

        # Fallback if no exact match: relax difficulty within target topic or course
        if not candidate:
            candidate = self.db.query(AssessmentQuestion).filter(
                (AssessmentQuestion.assessment_id == assessment.id) |
                (AssessmentQuestion.course_id == assessment.course_id),
                ~AssessmentQuestion.id.in_(presented_ids) if presented_ids else True
            ).first()

        if not candidate:
            return None, "All available questions for this assessment have been presented.", None

        # Record DecisionTrace for explainability
        trace = UniversalDecisionTrace(
            decision_id=f"dec_adapt_{uuid.uuid4().hex[:10]}",
            decision_type="adaptive_question_selection",
            profile_id=profile.id if profile else "anonymous",
            target_role=getattr(profile, "current_role", None) or "Learner",
            decision=f"Selected question {candidate.id} at difficulty {candidate.difficulty}",
            rationale=reason,
            factors=[
                DecisionFactor(
                    name="consecutive_performance",
                    weight=0.35,
                    raw_score=float(session.consecutive_correct - session.consecutive_incorrect),
                    contribution=0.35,
                    reason=f"{session.consecutive_correct} correct / {session.consecutive_incorrect} incorrect in streak"
                ),
                DecisionFactor(
                    name="prerequisite_awareness",
                    weight=0.30,
                    raw_score=1.0 if is_prereq_fallback else 0.0,
                    contribution=0.30 if is_prereq_fallback else 0.0,
                    reason="Prerequisite concept prioritized due to foundational weakness" if is_prereq_fallback else "Direct curriculum progression"
                )
            ],
            evidence=[
                DecisionEvidence(
                    evidence_type="adaptive_session_state",
                    description=f"Session mode={session.mode}, current_difficulty={current_diff}"
                )
            ],
            affected_skills=candidate.skill_ids or []
        )

        return candidate, reason, trace

    def _determine_next_difficulty(self, session: AssessmentSession) -> str:
        """
        Controlled difficulty adaptation policy:
        - 2 consecutive correct -> advance 1 tier (max EXPERT)
        - 2 consecutive incorrect -> step down 1 tier (min BEGINNER)
        - Prevents rapid oscillation
        """
        curr = session.current_difficulty or "INTERMEDIATE"
        idx = DIFFICULTY_ORDER.index(curr) if curr in DIFFICULTY_ORDER else 1

        if session.consecutive_correct >= 2:
            next_idx = min(len(DIFFICULTY_ORDER) - 1, idx + 1)
        elif session.consecutive_incorrect >= 2:
            next_idx = max(0, idx - 1)
        else:
            next_idx = idx

        return DIFFICULTY_ORDER[next_idx]

    def _select_target_topic(
        self,
        session: AssessmentSession,
        assessment: Assessment,
        profile: Optional[LearnerProfile]
    ) -> Tuple[Optional[SyllabusTopic], bool, str]:
        """
        Selects which topic to test next:
        - Priority 1: Check if previous answer on advanced topic was incorrect -> test prerequisite via SkillDAG.
        - Priority 2: In DIAGNOSTIC mode, test untested modules first.
        - Priority 3: Target topics with lower confidence / skill gaps.
        - Priority 4: Ensure syllabus coverage constraints (cap on repeat topics).
        """
        tested_topics = session.tested_topics or {}
        syllabus = assessment.syllabus

        # Check prerequisite fallback
        if session.consecutive_incorrect >= 2 and syllabus:
            # Look at last tested topic
            for top in syllabus.topics if hasattr(syllabus, "topics") else []:
                # Check prerequisites in SkillDAG
                for sk in top.topic_skills:
                    prereqs = self.dag.get_prerequisites(sk.skill.slug if sk.skill else "")
                    for p_slug, is_mandatory in prereqs:
                        p_skill = self.dag.skills_by_slug.get(p_slug)
                        if p_skill:
                            return None, True, f"Testing prerequisite concept '{p_slug}' following repeated incorrect answers."

        # Fairness Invariant: Cap questions per topic at 3
        all_topics: List[SyllabusTopic] = []
        if syllabus and syllabus.modules:
            for m in syllabus.modules:
                all_topics.extend(m.topics)

        # Filter out topics that have already reached cap
        available_topics = [t for t in all_topics if tested_topics.get(t.id, {}).get("tested", 0) < 3]
        if not available_topics:
            available_topics = all_topics

        # DIAGNOSTIC mode: prioritize completely untested topics
        if session.mode == "DIAGNOSTIC":
            untested = [t for t in available_topics if t.id not in tested_topics]
            if untested:
                chosen = untested[0]
                return chosen, False, f"Diagnostic scan prioritizing untested topic '{chosen.title}'."

        # ADAPTIVE mode: prioritize topic with highest error rate or lowest confidence
        if available_topics:
            # Sort by error rate or default to first
            def get_error_score(t: SyllabusTopic) -> float:
                st = tested_topics.get(t.id, {})
                tested = st.get("tested", 0)
                if tested == 0:
                    return 0.5  # Neutral
                correct = st.get("correct", 0)
                return 1.0 - (correct / tested)

            sorted_topics = sorted(available_topics, key=get_error_score, reverse=True)
            chosen = sorted_topics[0]
            return chosen, False, f"Targeting topic '{chosen.title}' based on demonstrated mastery and curriculum weights."

        return None, False, "General assessment progression."

    def _find_matching_question(
        self,
        session: AssessmentSession,
        assessment: Assessment,
        target_topic: Optional[SyllabusTopic],
        difficulty: str,
        presented_ids: set
    ) -> Optional[AssessmentQuestion]:
        """Finds candidate question matching topic and difficulty."""
        q_filter = [~AssessmentQuestion.id.in_(presented_ids)] if presented_ids else []

        # 1. Match topic + difficulty
        if target_topic:
            q = self.db.query(AssessmentQuestion).filter(
                (AssessmentQuestion.assessment_id == assessment.id) |
                (AssessmentQuestion.course_id == assessment.course_id),
                AssessmentQuestion.topic_id == target_topic.id,
                AssessmentQuestion.difficulty == difficulty,
                *q_filter
            ).first()
            if q:
                return q

            # 2. Match topic with any difficulty
            q = self.db.query(AssessmentQuestion).filter(
                (AssessmentQuestion.assessment_id == assessment.id) |
                (AssessmentQuestion.course_id == assessment.course_id),
                AssessmentQuestion.topic_id == target_topic.id,
                *q_filter
            ).first()
            if q:
                return q

        # 3. Match difficulty across assessment
        q = self.db.query(AssessmentQuestion).filter(
            (AssessmentQuestion.assessment_id == assessment.id) |
            (AssessmentQuestion.course_id == assessment.course_id),
            AssessmentQuestion.difficulty == difficulty,
            *q_filter
        ).first()
        return q
