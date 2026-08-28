from typing import List, Dict, Any, Optional
from backend.app.ai.provider import (
    AIProvider, GroundedContext, AIResponse, GroundedSource, ActionProposal,
    RecommendationContext, AssistantContext, AssistantResponsePayload
)

class DeterministicProvider(AIProvider):
    def generate_coach_response(self, context: GroundedContext) -> AIResponse:
        intent = context.intent
        sources: List[GroundedSource] = []
        actions: List[ActionProposal] = []

        if intent == "NEXT_LEARNING_STEP":
            if context.current_roadmap_items:
                first_item = context.current_roadmap_items[0]
                message = (
                    f"Based on your active curriculum for **{context.target_role}**, your next recommended learning step is "
                    f"**{first_item['title']}** ({first_item.get('difficulty', 'Intermediate')}) in {first_item.get('phase_name', 'Foundations')}. "
                    f"This directly addresses your prioritized skill gaps in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'core competencies'}."
                )
                sources.append(GroundedSource(type="resource", id=first_item["resource_id"], title=first_item["title"]))
                actions.append(ActionProposal(
                    action_type="EXPLAIN_ROADMAP_STEP",
                    resource_id=first_item["resource_id"],
                    reason=f"Step 1 in {first_item.get('phase_name', 'active phase')}"
                ))
            else:
                message = (
                    f"You have completed all currently active items in this phase for your goal as a {context.target_role}! "
                    f"The recommendation engine will unlock advanced modules as you assess new competencies."
                )
                sources.append(GroundedSource(type="roadmap", title=f"{context.target_role} Curriculum"))

        elif intent == "RECOMMENDATION_EXPLANATION":
            if context.recommendation_explanations:
                rec = context.recommendation_explanations[0]
                message = (
                    f"The recommendation engine selected **{rec['resource_title']}** because: {rec['explanation']} "
                    f"(Engine composite relevance score: {rec['composite_score']:.2f})."
                )
                sources.append(GroundedSource(type="resource", title=rec["resource_title"]))
            elif context.current_roadmap_items:
                item = context.current_roadmap_items[0]
                message = (
                    f"**{item['title']}** was prioritized because it matches your {context.target_role} career trajectory, "
                    f"fits your weekly commitment of {context.weekly_hours} hours, and satisfies all prerequisite dependencies."
                )
                sources.append(GroundedSource(type="resource", id=item["resource_id"], title=item["title"]))
            else:
                message = "Recommendations are generated deterministically based on skill gaps, prerequisite DAG readiness, and difficulty fit."

        elif intent == "ROADMAP_EXPLANATION":
            phases_seen = []
            for it in context.current_roadmap_items:
                p_name = it.get("phase_name", "Core")
                if p_name not in phases_seen:
                    phases_seen.append(p_name)
            
            message = (
                f"Your roadmap towards becoming a **{context.target_role}** is structured into progressive pedagogical phases: "
                f"{', '.join(phases_seen) if phases_seen else 'Foundations to Capstone'}. "
                f"Prerequisites are strictly ordered so fundamental concepts build seamlessly into advanced architectures."
            )
            sources.append(GroundedSource(type="roadmap", title=f"{context.target_role} Curriculum"))

        elif intent == "PREREQUISITE":
            # Dynamically derive prerequisite rules using actual learner skills and gaps
            known_sample = [s["slug"] for s in context.skills if s.get("confidence", 0) >= 0.40]
            unlocked_info = f"Foundational competencies (such as {', '.join(known_sample[:2])}) " if known_sample else "Foundational competencies "
            gap_info = f"before advanced specializations in {', '.join(context.skill_gaps[:2])} are unlocked." if context.skill_gaps else "before dependent specializations are unlocked."

            message = (
                f"In PathFinder, prerequisite rules enforce that {unlocked_info}reach at least 40% assessed confidence "
                f"{gap_info} This guarantees optimal conceptual retention and avoids cognitive overload on your path to becoming a {context.target_role}."
            )
            sources.append(GroundedSource(type="prerequisite", title="Skill Dependency DAG"))

        elif intent == "SKILL_GAP":
            message = (
                f"For your target role as a **{context.target_role}**, your highest-priority skill gaps are: "
                f"**{', '.join(context.skill_gaps) if context.skill_gaps else 'All core skills on track'}**. "
                f"Your active roadmap is sequenced to systematically close these gaps step-by-step."
            )
            for gap in context.skill_gaps[:3]:
                sources.append(GroundedSource(type="skill", title=gap))

        elif intent == "PROGRESS":
            comp_text = ', '.join(context.completed_items[:3]) if context.completed_items else 'None yet'
            message = (
                f"Here is your learning summary for **{context.target_role}**:\n"
                f"- Active Phase: {context.active_phase}\n"
                f"- Completed Modules: {len(context.completed_items)} ({comp_text})\n"
                f"- Current Modules in Progress: {len(context.current_roadmap_items)}\n"
                f"- Weekly Study Pace: {context.weekly_hours} hours/week."
            )
            sources.append(GroundedSource(type="roadmap", title="Learner Progress Snapshot"))

        elif intent == "PRACTICE_SUGGESTION":
            message = (
                f"For a standout **{context.target_role}** portfolio, we recommend building a comprehensive, "
                f"end-to-end capstone project applying your core competencies in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'your domain'}. "
                f"This demonstrates practical engineering, debugging, and production design skills."
            )
            actions.append(ActionProposal(
                action_type="SUGGEST_PRACTICE",
                reason=f"Capstone project alignment for {context.target_role}"
            ))

        elif intent == "GENERAL_LEARNING_QUESTION":
            q_lower = context.user_query.lower()
            if "gradient descent" in q_lower:
                message = (
                    "**Gradient Descent** is an iterative optimization algorithm used to minimize a loss function by updating "
                    "model parameters in the direction of the steepest negative gradient. "
                    "Standard variants include Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Adam."
                )
            elif "transformer" in q_lower or "attention" in q_lower:
                message = (
                    "**Transformers** are neural network architectures based entirely on the Self-Attention mechanism, "
                    "allowing parallel processing of sequential data. Key components include Scaled Dot-Product Attention, "
                    "Multi-Head Attention, Positional Encodings, and Feed-Forward layers."
                )
            elif "backpropagation" in q_lower:
                message = (
                    "**Backpropagation** is the algorithm used to compute the gradients of the loss function with respect to "
                    "each weight in a neural network using the calculus chain rule, enabling efficient optimization via gradient descent."
                )
            else:
                message = (
                    f"Regarding your question on **'{context.user_query}'**: In modern engineering for **{context.target_role}**, "
                    f"mastering core architectural principles, analytical problem-solving, and hands-on tooling allows you to build resilient, "
                    f"production-grade systems."
                )
            sources.append(GroundedSource(type="skill", title=f"{context.target_role} Core Principles"))

        else:
            message = (
                f"Hello {context.learner_name}! I am your PathFinder AI Learning Coach. "
                f"I am actively tracking your goal to become a {context.target_role}, your current phase ({context.active_phase}), "
                f"and your skill gaps in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'target skills'}. "
                f"How can I help you accelerate your technical roadmap today?"
            )

        return AIResponse(
            message=message,
            provider="deterministic",
            confidence=1.0,
            grounded=True,
            sources=sources,
            suggested_actions=actions,
            is_fallback=True
        )

    def explain_recommendation(self, context: RecommendationContext) -> str:
        reasons_text = "\n".join([f"- {r}" for r in context.structured_reasons])
        return (
            f"Why {context.resource_title} is recommended for you:\n"
            f"{reasons_text}\n"
            f"This course prepares you for your target role as a {context.target_role} "
            f"and aligns with your {context.weekly_hours} hours/week study commitment."
        )

    def generate_assistant_response(self, context: AssistantContext) -> AssistantResponsePayload:
        q_lower = context.user_query.lower()
        if "what should i learn next" in q_lower or "next" in q_lower:
            next_topic = context.current_roadmap_items[0] if context.current_roadmap_items else "Foundations"
            reply = (
                f"Your immediate priority on your path to {context.target_role} is: **{next_topic}**. "
                f"This covers your identified skill gap in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'core competencies'}."
            )
        elif "5 hours" in q_lower or "adjust" in q_lower or "time" in q_lower:
            reply = (
                f"Based on your profile, with limited hours this week, prioritize high-impact foundational concepts in {context.active_phase}. "
                f"Focus on '{context.current_roadmap_items[0] if context.current_roadmap_items else 'core foundations'}'."
            )
        else:
            reply = (
                f"Hello {context.learner_name}! I am your PathFinder AI Learning Coach. "
                f"I am tracking your goal to become a {context.target_role} in {context.active_phase}. "
                f"How can I assist your learning today?"
            )
        return AssistantResponsePayload(
            reply=reply,
            suggested_focus=context.skill_gaps[:3] if context.skill_gaps else ["Foundations"],
            suggested_actions=[],
            grounding_references=context.current_roadmap_items[:1] if context.current_roadmap_items else [],
            is_fallback=True
        )
