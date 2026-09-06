# Shayla AI Mentor

Shayla AI Mentor is Sanju Career OS's backend-proxied AI assistant.

## Identity

Shayla is Sanju's German learning companion, daily accountability partner, Java DSA guide, resume/project reviewer, and supportive bestie-style mentor. She is respectful, non-romantic, practical, direct, and honest about tracker data.

## Backend-Only Groq Setup

Add the key only in `backend/.env`:

```env
GROQ_API_KEY="gsk_xxxxxxxxx"
```

Do not place API keys in frontend env files, localStorage, Zustand, or source code.

## Endpoints

- `GET /api/ai/status`
- `POST /api/ai/test`
- `POST /api/ai/chat`
- `POST /api/ai/chat/stream`

## Settings Tests

Use Settings to check backend status, Groq configuration, streaming support, Test Groq, Test Shayla, and Clear AI History.

## Troubleshooting

- Missing key: add `GROQ_API_KEY` to `backend/.env` and restart backend.
- Rejected key: remove `Bearer`, trim spaces, or create a fresh Groq key.
- Rate limit: wait and retry.
- Backend offline: start the backend dev server.

