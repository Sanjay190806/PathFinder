from pydantic import ConfigDict, BaseModel, Field
from typing import List, Dict, Optional, Any
from backend.app.schemas.skill import LearnerSkillIn, LearnerSkillOut
from backend.app.schemas.goal import GoalOut

class ProfileCreate(BaseModel):
    education_level: Optional[str] = "Undergraduate"
    field_of_study: Optional[str] = "Computer Science"
    experience_level: str = "Beginner"
    weekly_hours: int = 10
    preferred_formats: List[str] = ["video", "hands-on", "projects"]
    learning_objective: str = "Placement"
    target_role: str = Field(..., description="Target career domain role")
    skills: List[LearnerSkillIn] = []

    # 🇮🇳 JanSahay / SIH26101 Indian Education Taxonomy attributes
    country: Optional[str] = "India"
    education_stage: Optional[str] = None
    education_domain: Optional[str] = None
    education_stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    current_role: Optional[str] = None
    work_domain: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None
    custom_education_label: Optional[str] = None
    education_profile: Optional[Dict[str, Any]] = None

    # Phase 9 Stage 1 Extended Attributes
    board: Optional[str] = None
    subject_combination: Optional[str] = None
    institution_type: Optional[str] = None
    current_year: Optional[str] = None
    subjects: Optional[List[str]] = None

class ProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    experience_level: Optional[str] = None
    weekly_hours: Optional[int] = None
    preferred_formats: Optional[List[str]] = None
    learning_objective: Optional[str] = None
    difficulty_tolerance: Optional[float] = None
    country: Optional[str] = None
    education_stage: Optional[str] = None
    education_domain: Optional[str] = None
    education_stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    current_role: Optional[str] = None
    work_domain: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None
    custom_education_label: Optional[str] = None
    education_profile: Optional[Dict[str, Any]] = None

    # Phase 9 Stage 1 Extended Attributes
    board: Optional[str] = None
    subject_combination: Optional[str] = None
    institution_type: Optional[str] = None
    current_year: Optional[str] = None
    subjects: Optional[List[str]] = None

class EducationProfileUpdate(BaseModel):
    country: Optional[str] = "India"
    education_stage: Optional[str] = None
    education_domain: Optional[str] = None
    education_stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    current_role: Optional[str] = None
    work_domain: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None
    custom_education_label: Optional[str] = None
    education_profile: Optional[Dict[str, Any]] = None

    # Phase 9 Stage 1 Extended Attributes
    board: Optional[str] = None
    subject_combination: Optional[str] = None
    institution_type: Optional[str] = None
    current_year: Optional[str] = None
    subjects: Optional[List[str]] = None

class ProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    experience_level: str
    weekly_hours: int
    preferred_formats: List[str]
    learning_objective: str
    skill_confidence_map: Dict[str, float]
    velocity_score: float
    difficulty_tolerance: float
    country: Optional[str] = "India"
    education_stage: Optional[str] = None
    education_domain: Optional[str] = None
    education_stream: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    current_role: Optional[str] = None
    work_domain: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[str] = None
    custom_education_label: Optional[str] = None
    education_profile: Optional[Dict[str, Any]] = None

    # Phase 9 Stage 1 Extended Attributes
    board: Optional[str] = None
    subject_combination: Optional[str] = None
    institution_type: Optional[str] = None
    current_year: Optional[str] = None
    subjects: Optional[List[str]] = None

    skills: List[LearnerSkillOut] = []
    primary_goal: Optional[GoalOut] = None

    model_config = ConfigDict(from_attributes=True)
