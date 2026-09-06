# API Routes Documentation

This document describes the API endpoints exposed by the Sanju Career OS Express backend.

## 1. System Health

### GET `/api/health`
Checks backend services status.
- **Response**: `200 OK`
  ```json
  {
    "status": "healthy",
    "uptime": 124.5,
    "timestamp": "2026-06-28T21:30:15.000Z"
  }
  ```

---

## 2. Shayla AI Mentor Proxy

### POST `/api/ai/chat`
Proxies user prompts to Groq securely, injecting Shayla's mentor bestie prompt templates and real-time student parameters.
- **Request Body**:
  ```json
  {
    "messages": [
      { "role": "user", "content": "How do I optimize Day 8 Binary Search approach?" }
    ],
    "context": {
      "currentDay": 8,
      "currentTopic": "Binary Search",
      "currentStreak": 5,
      "leetcodeSolved": 12,
      "resumeScore": 70
    }
  }
  ```
- **Response**:
  ```json
  {
    "reply": "Intuition: Binary search operates on sorted spaces... Viel Erfolg!",
    "model": "llama-3.3-70b-versatile",
    "usage": {
      "promptTokens": 120,
      "completionTokens": 95,
      "totalTokens": 215
    }
  }
  ```

---

## 3. Database Synchronization

### GET `/api/sync`
Fetches the latest backed up Zustand snapshot.
- **Parameters**: `userId` query parameter (default: `local-user`).
- **Response**:
  ```json
  {
    "data": {
      "userProfile": { "name": "Sanju" },
      "dailyLogs": {}
    },
    "updatedAt": "2026-06-28T21:30:15.000Z"
  }
  ```

### POST `/api/sync`
Upserts a Zustand state snapshot to the PostgreSQL DB.
- **Request Body**:
  ```json
  {
    "userId": "local-user",
    "data": {
      "userProfile": { "name": "Sanju" },
      "dailyLogs": {}
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "updatedAt": "2026-06-28T21:30:15.000Z"
  }
  ```

### GET `/api/sync/health`
Returns honest sync capability status (`manual_db_snapshot`, `authEnabled: false`).

### GET `/api/sync/pull?userId=local-user`
Returns `{ "success": true, "snapshot": { ... }, "updatedAt": "..." }`.

### POST `/api/sync/push`
Body: `{ "userId": "local-user", "snapshot": { ...full backup... } }`.

Legacy `/api/sync` GET/POST remain for career-state-only sync.
