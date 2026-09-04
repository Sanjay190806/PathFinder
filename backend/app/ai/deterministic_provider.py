from typing import List, Dict, Any, Optional
from backend.app.ai.provider import (
    AIProvider, GroundedContext, AIResponse, GroundedSource, ActionProposal,
    RecommendationContext, AssistantContext, AssistantResponsePayload
)

class DeterministicProvider(AIProvider):
    def generate_coach_response(self, context: GroundedContext) -> AIResponse:
        # 1. Current data failure rule
        if not getattr(context, "current_data_verified", True):
            return AIResponse(
                message="Current information could not be verified.",
                provider="deterministic",
                confidence=0.8,
                grounded=True,
                sources=[],
                suggested_actions=[],
                is_fallback=True
            )

        intent = context.intent
        sources: List[GroundedSource] = []
        actions: List[ActionProposal] = []

        # Multilingual preference checks
        lang = (context.preferred_language or "English").lower().strip()
        is_tamil = "tamil" in lang or lang == "ta"
        is_hindi = "hindi" in lang or lang == "hi"
        is_telugu = "telugu" in lang or lang == "te"

        # Web citations if any attached by freshness routing
        if getattr(context, "web_citations", None):
            for wc in context.web_citations:
                sources.append(wc)

        if intent == "NEXT_LEARNING_STEP":
            if context.current_roadmap_items:
                first_item = context.current_roadmap_items[0]
                gaps_str = ', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'core competencies'
                if is_tamil:
                    message = (
                        f"உங்கள் இலக்கான **{context.target_role}**-க்கு அடுத்த பரிந்துரைக்கப்படும் படி: "
                        f"**{first_item['title']}** ({first_item.get('difficulty', 'Intermediate')}) - {first_item.get('phase_name', 'Foundations')}. "
                        f"இது உங்களின் **{gaps_str}** skill gaps-ஐ பூர்த்தி செய்ய உதவும்."
                    )
                elif is_hindi:
                    message = (
                        f"आपके लक्ष्य **{context.target_role}** के लिए अगला अनुशंसित कदम है: "
                        f"**{first_item['title']}** ({first_item.get('difficulty', 'Intermediate')}) - {first_item.get('phase_name', 'Foundations')}। "
                        f"यह आपके **{gaps_str}** skill gaps को पूरा करने में मदद करेगा।"
                    )
                elif is_telugu:
                    message = (
                        f"మీ లక్ష్యం **{context.target_role}** కోసం తదుపరి సిఫార్సు చేయబడిన స్టెప్: "
                        f"**{first_item['title']}** ({first_item.get('difficulty', 'Intermediate')}) - {first_item.get('phase_name', 'Foundations')}. "
                        f"ఇది మీ **{gaps_str}** skill gaps ను భర్తీ చేయడానికి సహాయపడుతుంది."
                    )
                else:
                    message = (
                        f"Based on your active curriculum for **{context.target_role}**, your next recommended learning step is "
                        f"**{first_item['title']}** ({first_item.get('difficulty', 'Intermediate')}) in {first_item.get('phase_name', 'Foundations')}. "
                        f"This directly addresses your prioritized skill gaps in {gaps_str}."
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

        elif intent == "READINESS_QUERY":
            r_score = context.readiness_score if context.readiness_score is not None else 50.0
            r_level = context.readiness_level or "Developing Readiness"
            blocker_text = f" Critical blockers needing attention: {', '.join(context.critical_blockers)}." if context.critical_blockers else " No critical prerequisite blockers are currently detected."
            message = (
                f"Your **PathFinder Readiness Estimate** for **{context.target_role}** is **{r_level} ({r_score}%)**.{blocker_text} "
                f"Your learning pace is {context.pacing_state.replace('_', ' ')}."
            )
            sources.append(GroundedSource(type="readiness", title=f"Readiness: {r_level}"))

        elif intent == "MOCK_INTERVIEW":
            message = (
                f"For your role as a **{context.target_role}**, our PathFinder Stage 10 Mock Interview Chamber evaluates your technical precision, "
                f"STAR structure, operational tradeoffs, and India-market scale relevance. "
                f"You can start an interactive technical or behavioral session to receive turn-by-turn rubrics and model answers."
            )
            sources.append(GroundedSource(type="mock_interview", title="Stage 10 Mock Interview Chamber"))
            actions.append(ActionProposal(action_type="NAVIGATE_TO_RESOURCE", payload={"route": "/preparation"}, description="Open Interview Chamber"))

        elif intent == "RESUME_ATS":
            message = (
                f"Our PathFinder Stage 10 Resume Intelligence engine audits your resume against target ATS keywords for **{context.target_role}**, "
                f"scans for action verb density and quantified metric impact, and maps your verified portfolio achievements without fabricating claims."
            )
            sources.append(GroundedSource(type="resume_intelligence", title="Resume ATS Audit Engine"))
            actions.append(ActionProposal(action_type="NAVIGATE_TO_RESOURCE", payload={"route": "/preparation"}, description="Run ATS Audit"))

        elif intent == "PREPARATION_READINESS":
            message = (
                f"Your PathFinder 9-dimension preparation readiness for **{context.target_role}** evaluates technical readiness, practical evidence, "
                f"project completion, mock interviews, resume ATS score, portfolio depth, and communication. "
                f"Visit the Preparation Hub to view your composite score and DecisionTrace audit."
            )
            sources.append(GroundedSource(type="readiness", title="9-Dimension Preparation Intelligence"))
            actions.append(ActionProposal(action_type="NAVIGATE_TO_RESOURCE", payload={"route": "/preparation"}, description="View Preparation Hub"))

        elif intent == "PREPARATION_GAPS":
            message = (
                f"Identified PathFinder preparation blockers for **{context.target_role}** are grouped across skills, capstone projects, "
                f"resume keyword density, portfolio artifacts, and mock interview communication. "
                f"Review your high-priority remediation plan on the Preparation dashboard."
            )
            sources.append(GroundedSource(type="preparation_gaps", title="Preparation Gap Matrix"))
            actions.append(ActionProposal(action_type="NAVIGATE_TO_RESOURCE", payload={"route": "/preparation"}, description="View Preparation Plan"))

        elif intent in ("SKILL_GAP", "SKILL_GAP_QUERY"):
            gaps = context.skill_gaps or ["core curriculum modules"]
            blockers = context.critical_blockers
            b_info = f" with critical blockers in **{', '.join(blockers)}**" if blockers else ""
            message = (
                f"For your target role as a **{context.target_role}**, your active skill gaps include **{', '.join(gaps[:3])}**{b_info}. "
                f"Completing these will unlock advanced curriculum modules."
            )
            for gap in gaps[:3]:
                sources.append(GroundedSource(type="skill", title=f"{context.target_role} Gap: {gap}"))

        elif intent == "MARKET_QUERY":
            sig_list = context.market_signals or []
            if sig_list:
                top_sig = sig_list[0]
                message = (
                    f"Industry signals for **{context.target_role}** indicate high demand for **{top_sig.get('skill_slug', 'core technologies')}** "
                    f"({top_sig.get('signal_value', 'High Relevance')}). Note: Market signals are provided via {top_sig.get('source_type', 'mock')} reference data."
                )
                sources.append(GroundedSource(type="market", title=f"{context.target_role} Market Signal"))
            else:
                message = f"Market demand for {context.target_role} emphasizes foundational competencies and hands-on implementation skills."

        elif intent == "REVIEW_NEEDED":
            if context.decay_alerts:
                message = (
                    f"Skill decay modeling recommends reviewing: **{', '.join(context.decay_alerts[:2])}**. "
                    f"Refreshing these competencies will maintain your prerequisite readiness."
                )
                actions.append(ActionProposal(
                    action_type="SUGGEST_REVIEW",
                    reason=f"Skill freshness decline for {context.decay_alerts[0]}"
                ))
            else:
                message = "All of your active skill competencies are fresh and within verified retention windows."

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
            known_sample = [s["slug"] for s in context.skills if s.get("confidence", 0) >= 0.40]
            unlocked_info = f"Foundational competencies (such as {', '.join(known_sample[:2])}) " if known_sample else "Foundational competencies "
            gap_info = f"before advanced specializations in {', '.join(context.skill_gaps[:2])} are unlocked." if context.skill_gaps else "before dependent specializations are unlocked."

            message = (
                f"In PathFinder, prerequisite rules enforce that {unlocked_info}reach at least 40% assessed confidence "
                f"{gap_info} This guarantees optimal conceptual retention and avoids cognitive overload on your path to becoming a {context.target_role}."
            )
            sources.append(GroundedSource(type="prerequisite", title="Skill Dependency DAG"))

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

        elif intent == "RESOURCE_SEARCH":
            res_item = context.catalog_sample[0] if context.catalog_sample else {"id": "res-demo", "title": "Verified Python Foundations", "provider": "NPTEL / JanSahay"}
            r_title = res_item.get("title", "Python Foundations")
            r_id = res_item.get("id", "res-demo")
            r_provider = res_item.get("provider", "NPTEL")
            
            if is_tamil:
                message = (
                    f"PathFinder-ல் சரிபார்க்கப்பட்ட **Tamil** / இலவச பாடநெறி: **{r_title}** ({r_provider}). "
                    f"விலை வகைப்பாடு: **100% Genuinely Free** (Verified). இது உங்கள் தொழில் இலக்குக்குத் தேவையான அடிப்படைகளை வழங்குகிறது."
                )
            elif is_hindi:
                message = (
                    f"PathFinder पर सत्यापित नि:शुल्क पाठ्यक्रम: **{r_title}** ({r_provider})। "
                    f"मूल्य वर्गीकरण: **100% Genuinely Free** (Verified). यह आपके करियर लक्ष्य के लिए उपयोगी है।"
                )
            else:
                message = (
                    f"Here is a verified learning resource from our catalog matching your request: **{r_title}** by {r_provider}. "
                    f"Pricing classification: **100% Genuinely Free** (verified). Full curriculum access is provided without mandatory subscription."
                )
            sources.append(GroundedSource(type="resource", id=r_id, title=r_title))
            actions.append(ActionProposal(
                action_type="RECOMMEND_RESOURCE",
                resource_id=r_id,
                reason="Matches queried subject and free pricing criteria"
            ))

        elif intent == "PRICE_CLASSIFICATION":
            message = (
                "In PathFinder, courses are strictly categorized using our verified pricing taxonomy:\n"
                "- **100% Genuinely Free**: Completely free access to full video lectures, exercises, and materials with zero mandatory fee or paywall.\n"
                "- **Free to Enroll (Paid Certificate)**: Free access to audit and learn (e.g. SWAYAM / NPTEL or Coursera Audit). An optional proctored exam fee is charged only if you request an accredited certificate.\n"
                "- **Paid / Subscription Required**: Proprietary platforms requiring an active paid subscription or upfront purchase."
            )
            sources.append(GroundedSource(type="resource", title="Verified Pricing Classification System"))

        elif intent == "PLANNER_TODAY":
            if context.today_plan:
                item_titles = [it.get("title", "Module") for it in context.today_plan]
                tot_mins = sum(it.get("estimated_minutes", 45) for it in context.today_plan)
                message = (
                    f"Here is your personalized **Today's Focus** plan for **{context.target_role}**:\n"
                    f"- Tasks: {', '.join(item_titles)}\n"
                    f"- Total Estimated Time: {tot_mins} minutes.\n"
                    f"Focus on these priority items to maintain your weekly target."
                )
            else:
                message = (
                    f"Your priority focus for today is targeting your critical skill gaps in "
                    f"**{', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'Core Fundamentals'}** "
                    f"to build progress towards your target role as a {context.target_role}."
                )
            sources.append(GroundedSource(type="roadmap", title="Today's Learning Plan"))

        elif intent == "PLANNER_WEEK":
            message = (
                f"Your weekly plan is structured around a budget of **{context.weekly_hours} hours/week**. "
                f"It balances core gap closure in {', '.join(context.skill_gaps[:2]) if context.skill_gaps else 'target skills'} "
                f"with spaced review and hands-on practice."
            )
            sources.append(GroundedSource(type="roadmap", title="Weekly Schedule Matrix"))

        elif intent == "OPPORTUNITIES_QUERY":
            stream_info = f" with your background in {context.stream or 'Science & Engineering'}" if context.stream else ""
            edu_info = f" ({context.education_level or 'Higher Education'})" if context.education_level else ""
            message = (
                f"Based on your profile{stream_info}{edu_info} and readiness for **{context.target_role}**, "
                f"we match you against verified entry-level internships and practical student fellowships. "
                f"Note: To protect your time, we strictly filter out senior roles that require credentials you haven't yet reached."
            )
            sources.append(GroundedSource(type="opportunity", title=f"{context.target_role} Verified Opportunities"))

        elif intent == "GENERAL_LEARNING_QUESTION":
            q_lower = context.user_query.lower()
            if "gradient descent" in q_lower:
                if is_tamil:
                    message = (
                        "**Gradient Descent** என்பது machine learning மற்றும் deep learning மாடல்களில் loss function-ஐ minimize "
                        "செய்ய பயன்படும் முக்கிய optimization algorithm ஆகும். இதன் முக்கிய வகைகள் Batch Gradient Descent, "
                        "Stochastic Gradient Descent (SGD) மற்றும் Adam."
                    )
                elif is_hindi:
                    message = (
                        "**Gradient Descent** मशीन लर्निंग में मॉडल के loss function को minimize करने के लिए उपयोग किया जाने वाला "
                        "एक प्रमुख optimization algorithm है। इसके मुख्य प्रकार Batch Gradient Descent, Stochastic Gradient Descent (SGD) और Adam हैं।"
                    )
                elif is_telugu:
                    message = (
                        "**Gradient Descent** అనేది machine learning మోడళ్లలో loss function ను తగ్గించడానికి ఉపయోగించే ప్రముఖ "
                        "optimization algorithm. దీని ముఖ్య రకాలు Batch Gradient Descent, Stochastic Gradient Descent (SGD) మరియు Adam."
                    )
                else:
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
            if is_tamil:
                message = (
                    f"வணக்கம் {context.learner_name}! நான் உங்கள் PathFinder AI Learning Coach. "
                    f"உங்கள் இலக்கான {context.target_role}-ஐ அடைய நான் உதவுகிறேன். "
                    f"இன்று உங்கள் தொழில்நுட்ப பயணத்தை எவ்வாறு தொடரலாம்?"
                )
            elif is_hindi:
                message = (
                    f"नमस्ते {context.learner_name}! मैं आपका PathFinder AI Learning Coach हूँ। "
                    f"मैं आपके लक्ष्य {context.target_role} को प्राप्त करने में सहायता के लिए यहाँ हूँ। "
                    f"आज हम आपकी पढ़ाई को कैसे आगे बढ़ाएं?"
                )
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
            stream_context = f" with your background in {context.specialization or context.education_stream}" if (context.specialization or context.education_stream) else ""
            reply = (
                f"Hello {context.learner_name}! I am your PathFinder AI Learning Coach. "
                f"I am tracking your goal to become a {context.target_role}{stream_context} in {context.active_phase}. "
                f"How can I assist your learning today?"
            )
        return AssistantResponsePayload(
            reply=reply,
            suggested_focus=context.skill_gaps[:3] if context.skill_gaps else ["Foundations"],
            suggested_actions=[],
            grounding_references=context.current_roadmap_items[:1] if context.current_roadmap_items else [],
            is_fallback=True
        )
