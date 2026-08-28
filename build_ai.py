# -*- coding: utf-8 -*-
import os

ai_files = {}

ai_files['backend/app/ai/provider.py'] = """from abc import ABC, abstractmethod
from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class RecommendationContext(BaseModel):
    learner_name: str
    target_role: str
    resource_title: str
    resource_provider: str
    skills_taught: List[str]
    missing_skills: List[str]
    weekly_hours: int
    scores: Dict[str, float]
    structured_reasons: List[str]

class AssistantContext(BaseModel):
    learner_name: str
    target_role: str
    education_level: Optional[str]
    weekly_hours: int
    skills_known: List[str]
    skill_gaps: List[str]
    active_phase: str
    current_roadmap_items: List[str]
    completed_items: List[str]
    user_query: str
    current_resource_id: Optional[str] = None

class AssistantResponsePayload(BaseModel):
    reply: str
    suggested_focus: Optional[List[str]] = None
    suggested_actions: Optional[List[Dict[str, Any]]] = None
    grounding_references: List[str] = []
    is_fallback: bool = False

class AIProvider(ABC):
    @abstractmethod
    def explain_recommendation(self, context: RecommendationContext) -> str:
        pass

    @abstractmethod
    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        pass
"""

ai_files['backend/app/ai/deterministic_provider.py'] = """from typing import List, Dict, Any
from backend.app.ai.provider import AIProvider, RecommendationContext, AssistantContext, AssistantResponsePayload

class DeterministicProvider(AIProvider):
    def explain_recommendation(self, context: RecommendationContext) -> str:
        reasons_text = "\\n".join([f"- {r}" for r in context.structured_reasons])
        return (
            f"Why {context.resource_title} is recommended for you:\\n"
            f"{reasons_text}\\n"
            f"This course prepares you for your target role as a {context.target_role} "
            f"and aligns with your {context.weekly_hours} hours/week study commitment."
        )

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        query_lower = context.user_query.lower()
        actions = []
        grounding = []

        if "5 hours" in query_lower or "adjust" in query_lower or "time" in query_lower or "hours" in query_lower:
            reply = (
                f"Based on your profile, I have tailored a focused plan for {context.learner_name}. "
                f"With limited hours this week, prioritize high-impact foundational concepts in {context.active_phase}. "
                f"Focus on '{context.current_roadmap_items[0] if context.current_roadmap_items else 'core foundations'}' "
                f"to maintain steady velocity without burnout."
            )
            actions.append({
                "action_type": "adjust_weekly_hours",
                "label": "Set Weekly Commitment to 5 Hours",
                "payload": {"weekly_hours": 5}
            })
            if context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

        elif "struggling" in query_lower or "difficult" in query_lower or "neural" in query_lower:
            reply = (
                f"It's completely normal to find advanced topics challenging! "
                f"I recommend reinforcing your math and programming prerequisites. "
                f"You can review Linear Algebra and Python for ML before jumping straight into deep architectures."
            )
            actions.append({
                "action_type": "add_prerequisite_practice",
                "label": "Review Linear Algebra & Fundamentals",
                "payload": {"target_skill": "linear-algebra"}
            })
            grounding.extend(["Python for ML", "Linear Algebra & Probability"])

        elif "what should i learn next" in query_lower or "next" in query_lower:
            next_topic = context.current_roadmap_items[0] if context.current_roadmap_items else "Foundations"
            reply = (
                f"Your immediate priority on your path to {context.target_role} is: **{next_topic}**. "
                f"This covers your identified skill gap in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'core competencies'}."
            )
            if context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

        elif "project" in query_lower or "portfolio" in query_lower or "practice" in query_lower:
            reply = (
                f"For your {context.target_role} portfolio, a strong project is an **End-to-End LLM-Powered Pipeline with FastAPI and Docker**. "
                f"This demonstrates data preprocessing, model inference, API serving, and deployment skills."
            )
            grounding.append("End-to-End LLM Agent Project")

        elif "skip" in query_lower:
            reply = (
                f"You can skip topics if you already feel confident, but be aware that skipping foundational prerequisites "
                f"may make Phase 3 (Deep Specialization) significantly harder. I suggest taking a quick assessment first!"
            )
        else:
            reply = (
                f"Hello {context.learner_name}! I am your PathFinder AI Learning Coach. "
                f"I am actively tracking your goal to become a {context.target_role}, your current phase ({context.active_phase}), "
                f"and your skill gaps in {', '.join(context.skill_gaps[:3]) if context.skill_gaps else 'relevant areas'}. "
                f"How can I help you adjust or accelerate your roadmap today?"
            )

        return AssistantResponsePayload(
            reply=reply,
            suggested_focus=context.skill_gaps[:3] if context.skill_gaps else ["Foundations"],
            suggested_actions=actions,
            grounding_references=grounding,
            is_fallback=True
        )
"""

ai_files['backend/app/ai/gemini_provider.py'] = """import os
from typing import List, Dict, Any, Optional
from backend.app.ai.provider import AIProvider, RecommendationContext, AssistantContext, AssistantResponsePayload
from backend.app.ai.deterministic_provider import DeterministicProvider
from backend.app.core.config import settings

class GeminiProvider(AIProvider):
    def __init__(self):
        self.fallback = DeterministicProvider()
        self.client = None
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.client = genai.GenerativeModel('gemini-1.5-flash')
            except Exception:
                self.client = None

    def explain_recommendation(self, context: RecommendationContext) -> str:
        if not self.client:
            return self.fallback.explain_recommendation(context)

        try:
            prompt = (
                f"You are the PathFinder AI Learning Coach. Provide a concise, motivating, and transparent explanation "
                f"for why the following learning resource was recommended to {context.learner_name}:\\n"
                f"Resource: {context.resource_title} (by {context.resource_provider})\\n"
                f"Target Career Goal: {context.target_role}\\n"
                f"Skills Taught: {', '.join(context.skills_taught)}\\n"
                f"Weekly Hours: {context.weekly_hours}h\\n"
                f"Key Recommendation Signals: {', '.join(context.structured_reasons)}\\n\\n"
                f"Output 2-3 concise bullet points followed by a 1-sentence wrap-up."
            )
            response = self.client.generate_content(prompt)
            return response.text.strip()
        except Exception:
            return self.fallback.explain_recommendation(context)

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        if not self.client:
            return self.fallback.generate_assistant_response(context)

        try:
            prompt = (
                f"You are the PathFinder AI Tutor & Learning Coach for {context.learner_name}.\\n"
                f"Learner Profile:\\n"
                f"- Target Career Goal: {context.target_role}\\n"
                f"- Available Time: {context.weekly_hours} hours/week\\n"
                f"- Current Skills: {', '.join(context.skills_known)}\\n"
                f"- Priority Skill Gaps: {', '.join(context.skill_gaps)}\\n"
                f"- Active Roadmap Phase: {context.active_phase}\\n"
                f"- Current Path Items: {', '.join(context.current_roadmap_items)}\\n"
                f"- Completed Items: {', '.join(context.completed_items)}\\n\\n"
                f"Learner Query: \\\"{context.user_query}\\\"\\n\\n"
                f"Respond directly, supportively, and grounded strictly in their actual roadmap and catalog. "
                f"Keep your response under 150 words."
            )
            response = self.client.generate_content(prompt)
            
            # Grounding references from current roadmap
            grounding = [item for item in context.current_roadmap_items if item.lower() in response.text.lower()]
            if not grounding and context.current_roadmap_items:
                grounding.append(context.current_roadmap_items[0])

            return AssistantResponsePayload(
                reply=response.text.strip(),
                suggested_focus=context.skill_gaps[:3],
                suggested_actions=[],
                grounding_references=grounding,
                is_fallback=False
            )
        except Exception:
            return self.fallback.generate_assistant_response(context)
"""

ai_files['backend/app/ai/assistant.py'] = """from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.profile import LearnerProfile
from backend.app.models.goal import Goal
from backend.app.models.learning_path import LearningPath, LearningPathVersion
from backend.app.models.progress import Progress
from backend.app.ai.gemini_provider import GeminiProvider
from backend.app.ai.provider import AssistantContext, AssistantResponsePayload

ai_provider = GeminiProvider()

def chat_with_assistant(
    profile: LearnerProfile,
    goal: Goal,
    query: str,
    db: Session,
    current_resource_id: Optional[str] = None
) -> AssistantResponsePayload:
    active_path = db.query(LearningPath).filter(
        LearningPath.profile_id == profile.id,
        LearningPath.goal_id == goal.id,
        LearningPath.is_active == True
    ).first()

    current_items = []
    active_phase = "Phase 1: Strengthen Foundations"
    
    if active_path:
        active_version = db.query(LearningPathVersion).filter(
            LearningPathVersion.learning_path_id == active_path.id,
            LearningPathVersion.is_active == True
        ).first()
        if active_version and active_version.items:
            current_items = [it.resource.title for it in active_version.items if not it.is_completed][:5]
            if active_version.items:
                active_phase = f"Phase {active_version.items[0].phase_number}: {active_version.items[0].phase_name}"

    completed_records = db.query(Progress).filter(
        Progress.profile_id == profile.id,
        Progress.status == "completed"
    ).all()
    completed_titles = [p.resource.title for p in completed_records if p.resource]

    known_skills = [s for s, conf in (profile.skill_confidence_map or {}).items() if conf >= 0.50]
    gaps = [s for s in (goal.target_skills or []) if (profile.skill_confidence_map or {}).get(s, 0.0) < 0.50]

    context = AssistantContext(
        learner_name=profile.user.full_name if profile.user else "Learner",
        target_role=goal.target_role,
        education_level=profile.education_level,
        weekly_hours=profile.weekly_hours,
        skills_known=known_skills,
        skill_gaps=gaps,
        active_phase=active_phase,
        current_roadmap_items=current_items,
        completed_items=completed_titles,
        user_query=query,
        current_resource_id=current_resource_id
    )

    return ai_provider.generate_assistant_response(context)
"""

for filepath, content in ai_files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Created {filepath}")
