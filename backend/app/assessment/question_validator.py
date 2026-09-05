import re
from typing import Dict, Any, List, Optional, Tuple, Set


VALID_QUESTION_TYPES = {
    "MCQ", "MULTIPLE_SELECT", "TRUE_FALSE", "CODE_OUTPUT",
    "SHORT_ANSWER", "CODING", "SCENARIO", "PRACTICAL"
}

VALID_DIFFICULTIES = {"BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"}


class QuestionValidationError(Exception):
    def __init__(self, errors: List[str]):
        self.errors = errors
        super().__init__("; ".join(errors))


class QuestionValidator:
    """
    Authoritative deterministic validator for assessment questions.
    Enforces structural integrity, correct-answer consistency, and duplicate detection.
    """

    @staticmethod
    def normalize_text(text: str) -> str:
        """Lowercases, removes non-alphanumeric chars, and collapses whitespaces."""
        cleaned = re.sub(r"[^a-zA-Z0-9\s]", "", text.lower())
        return " ".join(cleaned.split())

    @classmethod
    def calculate_similarity(cls, text_a: str, text_b: str) -> float:
        """Computes Jaccard word similarity between two question texts."""
        words_a = set(cls.normalize_text(text_a).split())
        words_b = set(cls.normalize_text(text_b).split())
        if not words_a or not words_b:
            return 0.0
        intersection = words_a.intersection(words_b)
        union = words_a.union(words_b)
        return len(intersection) / len(union)

    @classmethod
    def check_duplicate(
        cls,
        candidate_text: str,
        existing_texts: List[str],
        threshold: float = 0.82
    ) -> Tuple[bool, Optional[str], float]:
        """
        Detects exact or near duplicates against a pool of existing question texts.
        Returns (is_duplicate, matching_text, max_similarity).
        """
        max_sim = 0.0
        best_match = None
        for ex in existing_texts:
            sim = cls.calculate_similarity(candidate_text, ex)
            if sim > max_sim:
                max_sim = sim
                best_match = ex
            if sim >= threshold:
                return True, best_match, round(sim, 4)
        return False, best_match, round(max_sim, 4)

    @classmethod
    def validate_question_data(cls, data: Dict[str, Any]) -> List[str]:
        """
        Validates all fields of a question payload. Returns a list of error strings (empty if valid).
        """
        errors: List[str] = []

        # 1. Question Text
        text = (data.get("question_text") or "").strip()
        if not text or len(text) < 10:
            errors.append("question_text must be at least 10 characters long")

        # 2. Question Type
        q_type = (data.get("question_type") or "MCQ").upper()
        if q_type not in VALID_QUESTION_TYPES:
            errors.append(f"Invalid question_type '{q_type}'. Allowed: {sorted(VALID_QUESTION_TYPES)}")

        # 3. Difficulty
        diff = (data.get("difficulty") or "INTERMEDIATE").upper()
        if diff not in VALID_DIFFICULTIES:
            errors.append(f"Invalid difficulty '{diff}'. Allowed: {sorted(VALID_DIFFICULTIES)}")

        # 4. Marks
        marks = data.get("marks")
        if marks is None or not isinstance(marks, (int, float)) or marks <= 0:
            errors.append("marks must be a positive number > 0")

        # 5. Type-Specific Rules
        if q_type == "MCQ":
            options = data.get("options")
            if not options or not isinstance(options, list) or len(options) < 2:
                errors.append("MCQ requires at least 2 options")
            else:
                correct_idx = data.get("correct_option_index")
                correct_ans = data.get("correct_answer")
                if correct_idx is None and not correct_ans:
                    errors.append("MCQ must specify correct_option_index or correct_answer")
                elif correct_idx is not None and not (0 <= correct_idx < len(options)):
                    errors.append(f"correct_option_index {correct_idx} out of range (0 to {len(options)-1})")

        elif q_type == "MULTIPLE_SELECT":
            options = data.get("options")
            if not options or not isinstance(options, list) or len(options) < 2:
                errors.append("MULTIPLE_SELECT requires at least 2 options")
            correct_ans = data.get("correct_answer")
            if not correct_ans:
                errors.append("MULTIPLE_SELECT must specify correct_answer (comma-separated indices or JSON array)")

        elif q_type == "TRUE_FALSE":
            correct_ans = str(data.get("correct_answer") or "").strip().lower()
            if correct_ans not in {"true", "false"}:
                errors.append("TRUE_FALSE correct_answer must be 'True' or 'False'")

        elif q_type == "CODING":
            lang = data.get("code_language")
            if not lang:
                errors.append("CODING question requires 'code_language' (e.g. python, java, sql, cpp)")
            test_cases = data.get("test_cases")
            if not test_cases or not isinstance(test_cases, list) or len(test_cases) == 0:
                errors.append("CODING question requires at least one test case with input and expected output")

        elif q_type in {"SCENARIO", "PRACTICAL"}:
            rubric = data.get("rubric")
            correct_ans = data.get("correct_answer")
            options = data.get("options")
            if not rubric and not correct_ans and not options:
                errors.append(f"{q_type} question requires evaluation rubric, options, or model solution in correct_answer")

        return errors
