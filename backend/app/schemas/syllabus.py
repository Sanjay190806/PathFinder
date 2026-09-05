from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime


# --- Learning Objectives ---
class LearningObjectiveBase(BaseModel):
    objective: str = Field(..., description="Action-oriented learning outcome statement")
    objective_type: str = Field("UNDERSTAND", description="UNDERSTAND, EXPLAIN, APPLY, ANALYZE, IMPLEMENT, DEBUG, DESIGN, EVALUATE, PRACTICE")
    skill_ids: List[str] = Field(default_factory=list, description="Associated skill slugs or IDs")
    difficulty: str = Field("Intermediate", description="Beginner, Intermediate, Advanced")
    importance: str = Field("MEDIUM", description="HIGH, MEDIUM, LOW")


class LearningObjectiveCreate(LearningObjectiveBase):
    pass


class LearningObjectiveOut(LearningObjectiveBase):
    id: str
    topic_id: str

    model_config = ConfigDict(from_attributes=True)


# --- Subtopics ---
class SyllabusSubtopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 1
    difficulty: str = "Intermediate"


class SyllabusSubtopicCreate(SyllabusSubtopicBase):
    pass


class SyllabusSubtopicOut(SyllabusSubtopicBase):
    id: str
    topic_id: str

    model_config = ConfigDict(from_attributes=True)


# --- Topic Skills ---
class SyllabusTopicSkillBase(BaseModel):
    skill_id: str
    relationship_type: str = "REQUIRED"  # REQUIRED, SUPPORTING, PREREQUISITE, OPTIONAL
    importance: float = 1.0
    confidence: float = 1.0
    source: str = "CATALOG"


class SyllabusTopicSkillCreate(SyllabusTopicSkillBase):
    pass


class SyllabusTopicSkillOut(SyllabusTopicSkillBase):
    id: str
    topic_id: str
    skill_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- Topics ---
class SyllabusTopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 1
    weight: float = 0.0  # Percentage within module (0-100)
    difficulty: str = "Intermediate"
    estimated_learning_hours: float = 1.5


class SyllabusTopicCreate(SyllabusTopicBase):
    subtopics: List[SyllabusSubtopicCreate] = Field(default_factory=list)
    objectives: List[LearningObjectiveCreate] = Field(default_factory=list)
    skills: List[SyllabusTopicSkillCreate] = Field(default_factory=list)


class SyllabusTopicOut(SyllabusTopicBase):
    id: str
    module_id: str
    subtopics: List[SyllabusSubtopicOut] = Field(default_factory=list)
    objectives: List[LearningObjectiveOut] = Field(default_factory=list)
    skills: List[SyllabusTopicSkillOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Modules ---
class SyllabusModuleBase(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 1
    weight: float = 0.0  # Percentage of syllabus (0-100)
    estimated_learning_hours: float = 5.0
    prerequisite_module_ids: List[str] = Field(default_factory=list)


class SyllabusModuleCreate(SyllabusModuleBase):
    topics: List[SyllabusTopicCreate] = Field(default_factory=list)


class SyllabusModuleOut(SyllabusModuleBase):
    id: str
    syllabus_id: str
    topics: List[SyllabusTopicOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Syllabuses ---
class CourseSyllabusBase(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    version: int = 1
    language: str = "English"
    source: str = "OFFICIAL_PROVIDER"
    source_url: Optional[str] = None
    provider: str = "NPTEL"
    verification_status: str = "UNVERIFIED"


class CourseSyllabusCreate(CourseSyllabusBase):
    modules: List[SyllabusModuleCreate] = Field(default_factory=list)


class CourseSyllabusUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    language: Optional[str] = None
    source: Optional[str] = None
    source_url: Optional[str] = None
    provider: Optional[str] = None
    verification_status: Optional[str] = None


class CourseSyllabusOut(CourseSyllabusBase):
    id: str
    is_active: bool
    validation_status: str
    validation_errors: List[str] = Field(default_factory=list)
    retrieved_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CourseSyllabusDetailOut(CourseSyllabusOut):
    modules: List[SyllabusModuleOut] = Field(default_factory=list)
    total_estimated_hours: float = 0.0
    total_modules: int = 0
    total_topics: int = 0
    total_objectives: int = 0


# --- Coverage & Learner Progress ---
class SyllabusCoverageOut(BaseModel):
    course_id: str
    syllabus_id: str
    syllabus_version: int
    course_state: str  # NOT_STARTED, IN_PROGRESS, ASSESSMENT_READY, ASSESSMENT_ATTEMPTED, PASSED, FAILED, COMPLETED
    total_modules: int
    completed_modules: int
    module_coverage_pct: float
    total_topics: int
    completed_topics: int
    topic_coverage_pct: float
    total_objectives: int
    mastered_objectives: int
    objective_coverage_pct: float
    weighted_coverage_pct: float
    is_assessment_ready: bool
    readiness_reasons: List[str] = Field(default_factory=list)
    completed_module_ids: List[str] = Field(default_factory=list)
    completed_topic_ids: List[str] = Field(default_factory=list)
    mastered_objective_ids: List[str] = Field(default_factory=list)


class LearnerSyllabusProgressUpdate(BaseModel):
    topic_id: Optional[str] = None
    is_topic_completed: Optional[bool] = None
    objective_id: Optional[str] = None
    is_objective_mastered: Optional[bool] = None
    module_id: Optional[str] = None
    is_module_completed: Optional[bool] = None


class LearnerCourseProgressOut(BaseModel):
    id: str
    profile_id: str
    course_id: str
    syllabus_id: str
    syllabus_version: int
    status: str
    completed_module_ids: List[str]
    completed_topic_ids: List[str]
    mastered_objective_ids: List[str]
    module_progress_pct: float
    topic_progress_pct: float
    objective_progress_pct: float
    overall_coverage_pct: float
    assessment_ready_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- AI Assistance ---
class AIExtractSyllabusRequest(BaseModel):
    course_title: str
    raw_content: str
    provider: Optional[str] = "Imported Course Content"
    source_url: Optional[str] = None
    language: Optional[str] = "English"


class AIExtractSyllabusResponse(BaseModel):
    syllabus_proposal: CourseSyllabusCreate
    is_ai_assisted: bool = True
    confidence_score: float = 0.85
    extracted_summary: str
    extraction_warnings: List[str] = Field(default_factory=list)
