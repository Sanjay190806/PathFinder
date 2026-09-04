# PathFinder AI Architecture: Dual-Engine & Multilingual Coaching

## 1. Dual-Engine Architecture Overview

PathFinder implements a resilient hybrid AI architecture designed to maximize intelligence while guaranteeing 100% operational availability:

```
                      +-----------------------------+
                      |       User Chat Query       |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     PromptGuard Defense     |
                      | (Jailbreak / Leak Filter)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Freshness Classifier     |
                      |   (Temporal vs Static Query)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Grounded Context Builder  |
                      |  (Profile, Roadmap, Skills) |
                      +--------------+--------------+
                                     |
                 +-------------------+-------------------+
                 |                                       |
          (API Key Available)                     (Key Missing /
          (Network Healthy)                      Timeout / Error)
                 |                                       |
                 v                                       v
    +-------------------------+             +-------------------------+
    |      Groq Provider      |             |  Deterministic Provider |
    |   (Llama-3-70B / 8B)    |--- Fail --->| (Zero-Failure Fallback) |
    |  - Multilingual Hindi,  |             | - Catalog-grounded logic|
    |    Tamil, Telugu, Eng   |             | - 0ms network latency   |
    |  - Technical terms kept |             | - Guarantees 100% uptime|
    +-------------------------+             +-------------------------+
                 |                                       |
                 +-------------------+-------------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Action Proposal Engine  |
                      |  (Recommend Resource / Step)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Structured Response to UI  |
                      +-----------------------------+
```

---

## 2. Component Breakdown

### 2.1 PromptGuard (`backend/app/ai/prompt_guard.py`)
- First-line defense validating untrusted user input before LLM execution.
- Pattern matching against adversarial attacks, jailbreaks ("DAN mode"), rule override instructions, and database/token dumps.
- Strict 4,000-character boundary.

### 2.2 Freshness Classifier (`backend/app/ai/freshness_classifier.py`)
- Analyzes semantic intent to classify queries as:
  - **`FRESH`**: Inquires about current hiring trends, 2025/2026 salaries, active course cohorts, or application deadlines. Triggers live web research or market lookup.
  - **`STATIC`**: Conceptual or foundational questions (e.g. "What is backpropagation?"). Serviced directly from grounded context or model memory without redundant web lookups.

### 2.3 Groq Provider (`backend/app/ai/groq_provider.py`)
- High-throughput LLM provider utilizing Groq's LPU inference engine.
- Model: `llama-3.3-70b-versatile` / `llama-3.1-8b-instant`.
- Multilingual system prompt ensuring native conversational flow in Hindi, Tamil, Telugu, and English, with explicit directives to maintain technical identifiers in English script (*Python*, *Kubernetes*, *REST API*).

### 2.4 Deterministic Fallback Provider (`backend/app/ai/deterministic_provider.py`)
- Provides mathematically deterministic, catalog-anchored answers.
- Zero external dependencies; operates fully offline.
- Activates automatically upon network partition, rate limit, timeout, or missing API credentials.

### 2.5 Grounded Context Builder (`backend/app/ai/context_builder.py`)
- Aggregates learner profile attributes (education stage, stream, active goals, skill confidence vector, completed roadmap milestones) into a structured payload.
- Ensures the AI coach gives tailored advice without requiring the user to re-state their educational context.
