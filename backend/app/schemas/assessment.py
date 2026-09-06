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

class SkillGapAnalysis(BaseModel):
    skill: str
    skill_slug: str
    score_percentage: float
    status: str  # "REMEDIAL_NEEDED", "DEVELOPING", "PROFICIENT", "MASTERED"
    recommended_action: str
    priority: str  # "HIGH", "MEDIUM", "LOW"

class AdaptedCurriculumModule(BaseModel):
    title: str
    skill: str
    estimated_hours: float
    provider: Optional[str] = "PathFinder Academy"
    format: Optional[str] = "Interactive Course"
    is_remedial: bool = True

class AssessmentResultOut(BaseModel):
    assessment_id: str
    total_questions: int
    correct_count: int
    score_percentage: float
    skill_confidence_updates: List[dict] = []
    adaptation_triggered: bool = False
    summary_message: str
    skill_gaps: Optional[List[SkillGapAnalysis]] = []
    roadmap_adapted: Optional[bool] = False
    planner_recalculated: Optional[bool] = False
    new_roadmap_version: Optional[int] = None
    adapted_modules: Optional[List[AdaptedCurriculumModule]] = []
    recommended_next_step: Optional[str] = None

