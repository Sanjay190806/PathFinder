# AI Architecture Documentation

This document describes the design of the AI mentor chatbot and security mechanisms implemented inside Sanju Career OS.

## 1. Secure completions proxy layout

```
[ Browser Client ]
       │  (Requests text prompts + context builder stats)
       ▼
[ Express Server Proxy ]  <── Reads GROQ_API_KEY from .env
       │  (Injects Shayla's FAANG Bestie System Prompt)
       ▼
[ Groq API Endpoints ]
```

To prevent key leaks, the browser never calls Groq directly and does not store the API key in `localStorage`. The server proxies prompts via `/api/ai/chat`.

---

## 2. Injected system prompts & context parameters

The server injects a custom system prompt template that defines Shayla's identity (bestie, FAANG mentor, German native speaker) and maps local state variables:
- **currentDay**: Day X of the 180 program.
- **leetcodeSolved**: Current solves count.
- **resumeScore**: ATS check weights.
- **streak**: Active daily streak.

---

## 3. Germany goal & A1/A2 German vocabulary lessons

Shayla integrates beginner-friendly German terms naturally. Example translations:
- *"Gut gemacht!"* (Well done!)
- *"Viel Erfolg!"* (Much success!)
- *"Du schaffst das!"* (You can do it!)
- *"fleißig"* (hardworking)
- *"das Ziel"* (the goal)
- *"die Informatik"* (computer science)
