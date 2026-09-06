# Sync Architecture (v1.6.4)

Sanju Career OS is **local-first**. Browser `localStorage` is the primary persistence layer.

## What v1.6.4 supports

| Capability | Status |
|------------|--------|
| Local-first storage | Yes |
| Full JSON backup/export | Yes |
| Safe restore with confirmation | Yes |
| Manual PostgreSQL snapshot | Yes (optional) |
| Legacy career-state DB push/pull | Yes (Settings) |
| Account-based multi-device sync | **No** (planned v1.7) |
| Authentication | **No** |

## Storage modes

1. **Local-only** — default. All data stays in the browser.
2. **Manual DB snapshot** — pushes/pulls a full backup JSON blob to PostgreSQL when backend + database are available.

## Backend routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/sync/health` | Honest sync health (`manual_db_snapshot`, auth disabled) |
| POST | `/api/sync/push` | Push full backup snapshot `{ userId, snapshot }` |
| GET | `/api/sync/pull?userId=` | Pull full backup snapshot |
| GET | `/api/sync?userId=` | Legacy career-state pull |
| POST | `/api/sync` | Legacy career-state push `{ userId, data }` |

## Important limitations

- Default user id is `local-user` — not a real account.
- Pushing from laptop and pulling on phone only works if both use the same backend database and the same hardcoded user id. This is **not** secure multi-device sync.
- Conflict resolution UI is **not** active. Newer snapshot wins only during manual pull comparison.
- Offline queue stores pending operations locally; flush when backend/database recovers.

## v1.7 direction

Real auth, per-user accounts, and secure multi-device cloud sync.
