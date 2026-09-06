# Cloud Sync

Architecture: existing Express backend + Prisma + PostgreSQL.

v1.7.2 uses a safe hybrid snapshot model instead of normalizing every tracker module:

- `User`
- `UserAppSnapshot`
- `UserDevice`
- `SyncEvent`
- `BackupSnapshot`

Authenticated endpoints:

- `GET /api/cloud/sync/status`
- `GET /api/cloud/snapshot`
- `POST /api/cloud/snapshot`
- `POST /api/cloud/snapshot/merge`
- `POST /api/cloud/sync/push`
- `GET /api/cloud/sync/pull`

All account data is scoped from the auth token. The server does not trust a frontend `userId`.
