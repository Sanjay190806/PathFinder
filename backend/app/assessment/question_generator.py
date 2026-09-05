import json
import uuid
import httpx
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.models.syllabus import LearningObjective, SyllabusTopic, SyllabusModule
from backend.app.models.assessment import AssessmentQuestion
from backend.app.models.skill import Skill
from backend.app.assessment.question_validator import QuestionValidator, QuestionValidationError
from backend.app.ai.groq_provider import GroqProvider
from backend.app.ai.config import AI_REQUEST_TIMEOUT_SECONDS
from backend.app.core.logger import logger


class QuestionGenerator:
    """
    AI-Assisted Question Generation engine grounded strictly in Syllabus Learning Objectives.
    Every candidate question must pass deterministic structural validation and duplicate detection
    before insertion into the authoritative Question Bank.
    """

    def __init__(self, db: Session):
        self.db = db
        self.groq_provider = GroqProvider()

    def generate_question_for_objective(
        self,
        objective_id: str,
        question_type: str = "MCQ",
        difficulty: str = "INTERMEDIATE",
        marks: float = 2.0
    ) -> AssessmentQuestion:
        """
        Generates a validated question targeting a specific LearningObjective.
        """
        obj = self.db.query(LearningObjective).filter(LearningObjective.id == objective_id).first()
        if not obj:
            raise ValueError(f"LearningObjective '{objective_id}' not found")

        topic = obj.topic
        module = topic.module if topic else None
        syllabus = module.syllabus if module else None

        prompt = (
            f"Generate an objective assessment question based strictly on this curriculum objective:\n"
            f"Objective: {obj.objective} (Type: {obj.objective_type})\n"
            f"Topic: {topic.title if topic else 'Core Concept'}\n"
            f"Module: {module.title if module else 'Foundational'}\n"
            f"Difficulty: {difficulty}\n"
            f"Question Type: {question_type}\n\n"
            f"Return a strict JSON object with fields:\n"
            f"- question_text: string\n"
            f"- options: list of 4 distinct strings (if MCQ or MULTIPLE_SELECT)\n"
            f"- correct_option_index: integer 0-3 (if MCQ)\n"
            f"- correct_answer: string\n"
            f"- explanation: string\n"
            f"- code_template: string (if CODING)\n"
            f"- code_language: string (if CODING, e.g. python, java, sql)\n"
            f"- test_cases: list of dicts with input and expected (if CODING)\n"
            f"- rubric: dict with evaluation criteria (if SCENARIO or PRACTICAL)\n"
        )

        raw_candidate = None
        if self.groq_provider.api_key:
            try:
                headers = {
                    "Authorization": f"Bearer {self.groq_provider.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.groq_provider.model,
                    "messages": [
                        {"role": "system", "content": "You are an expert curriculum assessment author. Respond ONLY in valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 1200,
                    "response_format": {"type": "json_object"}
                }
                with httpx.Client(timeout=AI_REQUEST_TIMEOUT_SECONDS) as http_client:
                    resp = http_client.post(self.groq_provider.GROQ_API_ENDPOINT, headers=headers, json=payload)
                    resp.raise_for_status()
                    data = resp.json()
                    raw_text = data["choices"][0]["message"]["content"]
                    raw_candidate = json.loads(raw_text)
            except Exception as e:
                logger.warning(f"Groq question generation failed ({e}), falling back to deterministic template.")
                raw_candidate = None

        if not raw_candidate:
            raw_candidate = self._fallback_template_candidate(obj, topic, question_type, difficulty)

        # Ensure fundamental fields exist
        raw_candidate["question_type"] = question_type
        raw_candidate["difficulty"] = difficulty
        raw_candidate["marks"] = marks
        raw_candidate["course_id"] = syllabus.course_id if syllabus else None
        raw_candidate["syllabus_id"] = syllabus.id if syllabus else None
        raw_candidate["syllabus_version"] = syllabus.version if syllabus else 1
        raw_candidate["module_id"] = module.id if module else None
        raw_candidate["topic_id"] = topic.id if topic else None
        raw_candidate["objective_id"] = obj.id
        raw_candidate["skill_ids"] = [s.skill_id for s in topic.topic_skills] if (topic and topic.topic_skills) else []

        # 1. Deterministic Structural Validation
        errors = QuestionValidator.validate_question_data(raw_candidate)
        if errors:
            raise QuestionValidationError(errors)

        # 2. Duplicate Check against existing Question Bank
        existing_questions = self.db.query(AssessmentQuestion).filter(
            AssessmentQuestion.topic_id == topic.id
        ).all()
        existing_texts = [q.question_text for q in existing_questions]
        is_dup, match_text, sim = QuestionValidator.check_duplicate(raw_candidate["question_text"], existing_texts)
        if is_dup:
            raise ValueError(f"Candidate question rejected as duplicate (similarity {sim:.2f} with '{match_text}')")

        gen_skill_id = None
        if topic and topic.topic_skills:
            gen_skill_id = topic.topic_skills[0].skill_id
        if not gen_skill_id:
            first_sk = self.db.query(Skill).first()
            gen_skill_id = first_sk.id if first_sk else None

        question = AssessmentQuestion(
            id=str(uuid.uuid4()),
            assessment_id=None,  # Available in Question Bank
            skill_id=gen_skill_id,
            question_text=raw_candidate["question_text"],
            options=raw_candidate.get("options"),
            correct_option_index=raw_candidate.get("correct_option_index"),
            correct_answer=str(raw_candidate.get("correct_answer") or raw_candidate.get("correct_option_index", "")),
            explanation=raw_candidate.get("explanation"),
            difficulty_weight=0.3 if difficulty == "BEGINNER" else (0.6 if difficulty == "INTERMEDIATE" else 0.9),
            course_id=raw_candidate["course_id"],
            syllabus_id=raw_candidate["syllabus_id"],
            syllabus_version=raw_candidate["syllabus_version"],
            module_id=raw_candidate["module_id"],
            topic_id=raw_candidate["topic_id"],
            objective_id=raw_candidate["objective_id"],
            skill_ids=raw_candidate["skill_ids"],
            question_type=question_type,
            difficulty=difficulty,
            marks=marks,
            test_cases=raw_candidate.get("test_cases"),
            rubric=raw_candidate.get("rubric"),
            code_template=raw_candidate.get("code_template"),
            code_language=raw_candidate.get("code_language"),
            source="AI_GENERATED" if self.groq_provider.api_key else "TEMPLATE",
            verification_status="AI_ASSISTED",
            generation_method="AI_GENERATED" if self.groq_provider.api_key else "TEMPLATE"
        )
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def _fallback_template_candidate(
        self,
        obj: LearningObjective,
        topic: Optional[SyllabusTopic],
        q_type: str,
        diff: str
    ) -> Dict[str, Any]:
        """Provides deterministic fallback candidate if external AI service is unavailable."""
        topic_title = topic.title if topic else "Curriculum Concept"
        if q_type == "CODING":
            return {
                "question_text": f"Write a function to implement and test {obj.objective}.",
                "code_template": "def solution(*args):\n    # Write your solution here\n    pass",
                "code_language": "python",
                "correct_answer": "def solution(*args):\n    return True",
                "test_cases": [{"input": "test_input", "expected": "True", "hidden": False}],
                "explanation": f"Verifies practical implementation of {topic_title}."
            }
        elif q_type == "SCENARIO":
            return {
                "question_text": f"In an enterprise system managing {topic_title}, how would you solve: {obj.objective}?",
                "options": [
                    "A: Apply standard decoupled architecture with verification checks",
                    "B: Bypass prerequisite validation constraints",
                    "C: Hardcode static parameters without error handling",
                    "D: Drop transaction logging"
                ],
                "correct_option_index": 0,
                "correct_answer": "0",
                "explanation": f"Decoupled architecture with checks satisfies {obj.objective}."
            }
        else:
            return {
                "question_text": f"Which statement accurately reflects: {obj.objective} in {topic_title}?",
                "options": [
                    f"Option A: Correct application of {obj.objective}",
                    f"Option B: Incomplete implementation without error boundary",
                    f"Option C: Deprecated pattern conflicting with modern standards",
                    f"Option D: None of the above"
                ],
                "correct_option_index": 0,
                "correct_answer": "0",
                "explanation": f"Grounded in syllabus objective '{obj.objective}'."
            }
