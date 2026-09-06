# Backend HTTP & SSE API Routes

All endpoints use `/api` base mapping.

## Health Status
- `GET /health` -> Checks backend online status.

## AI Chat & Completions
- `POST /ai/chat` -> Non-streaming chat responses.
- `POST /ai/chat/stream` -> Server-Sent Events stream chunk tokens (`text/event-stream`).

## Sync Backup Snapshot
- `GET /sync?userId=<id>` -> Returns JSON database snapshot.
- `POST /sync` -> Stores JSON Zustand snapshot mapping.
