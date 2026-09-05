from backend.app.models.user import User
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.skill import Skill, SkillPrerequisite, LearnerSkill
from backend.app.models.resource import LearningResource, ResourceSkill, ResourcePrerequisite
from backend.app.models.learning_path import (
    LearningPath,
    LearningPathVersion,
    LearningPathItem,
    RoadmapChange,
    RecommendationExplanation,
)
from backend.app.models.recommendation import Recommendation
from backend.app.models.progress import Progress
from backend.app.models.feedback import Feedback
from backend.app.models.interaction import Interaction
from backend.app.models.behavior_event import BehaviorEvent
from backend.app.models.practical_competency import PracticalCompetency, PracticalEvidenceRecord
from backend.app.models.project import ProjectTemplate, LearnerProject, LearnerProjectMilestone
from backend.app.models.scenario import EngineeringScenario, ScenarioAttempt
from backend.app.models.practical_assessment import PracticalAssessment, PracticalAssessmentAttempt
from backend.app.models.portfolio import LearnerPortfolio, PortfolioArtifact
from backend.app.models.opportunity import Opportunity, LearnerOpportunityMatch
from backend.app.models.career_action import LearnerApplication, ResumeAudit, MockInterviewSession
from backend.app.models.assessment import (
    Assessment,
    AssessmentBlueprint,
    AssessmentQuestion,
    AssessmentResponse,
    AssessmentSession,
    AssessmentAttemptEvidence,
    AssessmentIntegrityEvent,
    AssessmentIntegrityPolicy,
)

from backend.app.models.preparation import PreparationHistoryRecord
from backend.app.models.syllabus import (
    CourseSyllabus,
    SyllabusModule,
    SyllabusTopic,
    SyllabusSubtopic,
    LearningObjective,
    SyllabusTopicSkill,
    LearnerCourseProgress,
)

__all__ = [
    "User",
    "LearnerProfile",
    "Goal",
    "Skill",
    "SkillPrerequisite",
    "LearnerSkill",
    "LearningResource",
    "ResourceSkill",
    "ResourcePrerequisite",
    "LearningPath",
    "LearningPathVersion",
    "LearningPathItem",
    "RoadmapChange",
    "Recommendation",
    "RecommendationExplanation",
    "Progress",
    "Feedback",
    "Interaction",
    "Assessment",
    "AssessmentBlueprint",
    "AssessmentQuestion",
    "AssessmentResponse",
    "AssessmentSession",
    "AssessmentAttemptEvidence",
    "AssessmentIntegrityEvent",
    "AssessmentIntegrityPolicy",
    "BehaviorEvent",
    "PracticalCompetency",
    "PracticalEvidenceRecord",
    "ProjectTemplate",
    "LearnerProject",
    "LearnerProjectMilestone",
    "EngineeringScenario",
    "ScenarioAttempt",
    "PracticalAssessment",
    "PracticalAssessmentAttempt",
    "LearnerPortfolio",
    "PortfolioArtifact",
    "Opportunity",
    "LearnerOpportunityMatch",
    "LearnerApplication",
    "ResumeAudit",
    "MockInterviewSession",
    "PreparationHistoryRecord",
    "CourseSyllabus",
    "SyllabusModule",
    "SyllabusTopic",
    "SyllabusSubtopic",
    "LearningObjective",
    "SyllabusTopicSkill",
    "LearnerCourseProgress",
]
