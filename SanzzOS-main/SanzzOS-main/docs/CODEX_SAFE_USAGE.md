# Codex Safe Usage

This project supports Codex-assisted development, but a few habits keep changes predictable.

## Recommended Flow

1. Inspect the target files first.
2. Make the smallest useful patch.
3. Run the relevant build or validation command.
4. Fix any type or runtime regressions before finishing.

## High-Risk Areas

- `frontend/src/services/aiService.ts`
- `frontend/src/services/syncService.ts`
- `frontend/src/routes/AppRouter.tsx`
- `backend/src/routes/health.routes.ts`
- `backend/prisma/schema.prisma`

Changes in these files should always be followed by validation.

## Secrets

- Keep external API keys in backend environment files.
- Never copy secrets into frontend components, stores, or static data.
- Treat `.env` files as local-only configuration.

## UI Notes

- Preserve deep-link behavior when changing navigation.
- Keep dashboard state, filters, and search in sync with the URL or store.
- If a page is meant to summarize progress, avoid debug counters or placeholder metrics.
