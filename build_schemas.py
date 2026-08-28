import os

schemas = {}

schemas['backend/app/schemas/auth.py'] = """from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    is_demo: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None
"""

schemas['backend/app/schemas/skill.py'] = """from pydantic import BaseModel
from typing import List, Optional

class SkillOut(BaseModel):
    id: str
    name: str
    slug: str
    category: str
    description: Optional[str] = None
    difficulty_tier: str

    class Config:
        from_attributes = True

class SkillPrerequisiteOut(BaseModel):
    skill_id: str
    prerequisite_skill_id: str
    prerequisite_name: str
    is_mandatory: bool

class LearnerSkillIn(BaseModel):
    skill_id: str
    self_rating: str # Beginner, Intermediate, Advanced

class LearnerSkillOut(BaseModel):
    skill_id: str
    skill_name: str
    skill_slug: str
    category: str
    self_rating: str
    assessed_confidence: float
    verified: bool

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/goal.py'] = """from pydantic import BaseModel
from typing import List, Optional

class GoalCreate(BaseModel):
    title: str
    target_role: str
    description: Optional[str] = None
    target_skills: List[str] = []

class GoalOut(BaseModel):
    id: str
    profile_id: str
    title: str
    description: Optional[str] = None
    target_role: str
    target_skills: List[str] = []
    is_primary: bool
    status: str

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/resource.py'] = """from pydantic import BaseModel
from typing import List, Optional, Any

class ResourceOut(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    provider: str
    url: str
    resource_type: str
    difficulty: str
    estimated_hours: float
    quality_score: float
    career_relevance: List[str] = []
    format: str
    skills: List[str] = []

    class Config:
        from_attributes = True

class ResourceDetailOut(ResourceOut):
    prerequisites: List[str] = []
    learner_status: Optional[str] = None
    time_spent_minutes: int = 0
    feedback_history: List[Any] = []
"""

schemas['backend/app/schemas/learning_path.py'] = """from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ExplanationOut(BaseModel):
    goal_relevance_score: float
    skill_gap_score: float
    prereq_score: float
    difficulty_score: float
    pref_score: float
    time_score: float
    engagement_score: float
    diversity_score: float
    composite_score: float
    structured_reasons: List[str]
    human_readable_explanation: str

    class Config:
        from_attributes = True

class LearningPathItemOut(BaseModel):
    id: str
    version_id: str
    resource_id: str
    resource_title: str
    resource_description: str
    resource_provider: str
    resource_url: str
    resource_type: str
    difficulty: str
    estimated_hours: float
    format: str
    skills: List[str]
    prerequisites: List[str]
    phase_number: int
    phase_name: str
    sequence_order: int
    is_completed: bool
    is_skipped: bool
    is_locked: bool
    explanation: Optional[ExplanationOut] = None

    class Config:
        from_attributes = True

class RoadmapChangeOut(BaseModel):
    id: str
    previous_item_id: Optional[str] = None
    new_item_id: Optional[str] = None
    change_type: str # inserted, removed, reordered, phase_shifted
    reason: str
    trigger: str
    timestamp: Any

    class Config:
        from_attributes = True

class LearningPathVersionOut(BaseModel):
    id: str
    learning_path_id: str
    version_number: int
    version_hash: Optional[str] = None
    trigger: str
    change_summary: Optional[str] = None
    is_active: bool
    created_at: Any
    items: List[LearningPathItemOut] = []
    roadmap_changes: List[RoadmapChangeOut] = []

    class Config:
        from_attributes = True

class LearningPathOut(BaseModel):
    id: str
    profile_id: str
    goal_id: str
    goal_title: str
    title: str
    is_active: bool
    algorithm_version: str
    current_version: Optional[LearningPathVersionOut] = None
    all_versions_count: int = 1

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/profile.py'] = """from pydantic import BaseModel
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
    target_role: str = "AI/ML Engineer"
    skills: List[LearnerSkillIn] = []

class ProfileUpdate(BaseModel):
    education_level: Optional[str] = None
    field_of_study: Optional[str] = None
    experience_level: Optional[str] = None
    weekly_hours: Optional[int] = None
    preferred_formats: Optional[List[str]] = None
    learning_objective: Optional[str] = None
    difficulty_tolerance: Optional[float] = None

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
    skills: List[LearnerSkillOut] = []
    primary_goal: Optional[GoalOut] = None

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/progress.py'] = """from pydantic import BaseModel
from typing import Optional

class ProgressUpdate(BaseModel):
    resource_id: str
    status: str # not_started, in_progress, completed, skipped
    time_spent_minutes: Optional[int] = None
    completion_percentage: Optional[float] = None

class ProgressOut(BaseModel):
    id: str
    profile_id: str
    resource_id: str
    status: str
    time_spent_minutes: int
    completion_percentage: float

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/feedback.py'] = """from pydantic import BaseModel
from typing import Optional

class FeedbackCreate(BaseModel):
    resource_id: str
    feedback_type: str # helpful, too_difficult, too_easy, not_relevant, outdated
    rating: int = 5 # 1-5
    comment: Optional[str] = None
    idempotency_key: Optional[str] = None

class FeedbackOut(BaseModel):
    id: str
    profile_id: str
    resource_id: str
    feedback_type: str
    rating: int
    comment: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True
"""

schemas['backend/app/schemas/assessment.py'] = """from pydantic import BaseModel
from typing import List, Optional

class AssessmentQuestionOut(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    question_text: str
    options: List[str]

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
"""

schemas['backend/app/schemas/analytics.py'] = """from pydantic import BaseModel
from typing import List, Dict

class SkillMasteryPoint(BaseModel):
    skill: str
    category: str
    confidence: float
    target_confidence: float

class AnalyticsSummaryOut(BaseModel):
    total_resources: int
    completed_resources: int
    in_progress_resources: int
    total_learning_hours: float
    hours_completed: float
    current_streak_days: int
    active_phase: str
    overall_progress_percentage: float
    skill_mastery: List[SkillMasteryPoint]
    strengths: List[str]
    weaknesses: List[str]
    acceptance_rate: float
    weekly_velocity: float
"""

schemas['backend/app/schemas/ai.py'] = """from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    current_resource_id: Optional[str] = None

class ActionSuggestion(BaseModel):
    action_type: str # adjust_weekly_hours, swap_resource, add_prerequisite_practice
    label: str
    payload: Dict[str, Any]

class ChatResponse(BaseModel):
    reply: str
    suggested_focus: Optional[List[str]] = None
    suggested_actions: Optional[List[ActionSuggestion]] = None
    grounding_references: List[str] = []
    is_fallback: bool = False
"""

for filepath, content in schemas.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filepath}")
