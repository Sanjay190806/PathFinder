from pydantic import ConfigDict, BaseModel
from typing import List, Optional

class AssessmentQuestionOut(BaseModel):
    id: str
    skill_id: Optional[str] = "general-skill"
    skill_name: Optional[str] = "General"
    question_text: str
    options: Optional[List[str]] = []

class AssessmentOut(BaseModel):
    id: str
    title: str
    domain: str
    questions: List[AssessmentQuestionOut] = []

class AnswerSubmission(BaseModel):
    question_id: str
    selected_option_index: int

class AssessmentSubmit(BaseModel):
    assessment_id: str
    answers: List[AnswerSubmission]

class AssessmentResultOut(BaseModel):
    assessment_id: str
    total_questions: int
    correct_count: int
    score_percentage: float
    skill_confidence_updates: List[dict]
    adaptation_triggered: bool
    summary_message: str
