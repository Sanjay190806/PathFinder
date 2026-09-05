# PathFinder AI & Coach Architecture
**Phase 10: Multi-Model Orchestration, Guardrails & Grounded Context**

---

## 1. Overview
PathFinder integrates Generative AI as an advisory assistant and pedagogical coach. The AI is strictly decoupled from authoritative state transitions.

## 2. Guardrails & Safety
- **No Autonomous State Mutation**: The AI cannot mark courses completed, modify assessment marks, alter mastery scores, or invalidate exams.
- **Context Grounding**: AI coach prompts receive sanitized, authoritative profiles and learning milestones directly from the backend database.
- **PromptGuard**: Defends against prompt injection, jailbreak attempts, and out-of-domain queries.

## 3. Supported Providers
- **Groq**: Llama 3.3 70B Versatile for high-speed, cost-effective reasoning.
- **Google Gemini**: Gemini 1.5 Flash for multimodal and long-context processing.
- **Deterministic Fallback**: Provides reliable responses even when AI provider APIs are temporarily unreachable.
