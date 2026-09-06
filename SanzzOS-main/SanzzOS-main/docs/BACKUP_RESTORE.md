# Backup & Restore (v1.7.2)

## Export

Settings → **Backup & Restore → Export Backup JSON**

Exports all known `localStorage` module keys via `frontend/src/services/backup/backupRegistry.ts`.

Backup format:

```json
{
  "appName": "Sanju Career OS",
  "version": "1.6.4",
  "schemaVersion": 2,
  "createdAt": "ISO timestamp",
  "mode": "local_backup",
  "keysIncluded": ["..."],
  "keysMissing": ["..."],
  "data": {
    "sanju-career-os-persist": "...raw localStorage string..."
  }
}
```

## Import safety

Before restore:

1. JSON syntax validation
2. `appName` must match
3. Schema version check (rejects newer unsupported schemas)
4. Secret-like key/content rejection
5. Confirmation dialog with key summary
6. Automatic pre-restore local snapshot (`sanzz_os_pre_restore_backup_v1`)

## Not included

- `.env` files
- API keys / tokens
- Session-only storage
- Backend database contents (use Manual DB Snapshot separately)

## Legacy export

Settings → **Export Legacy Career JSON** exports only the core Zustand career store. Prefer the full Backup & Restore panel.
# v1.7.2 Cloud Backup Notes

Local JSON backup remains supported. Account cloud backups are available after login from Settings.

Cloud backups:

- Are user-owned through authenticated `/api/cloud/backups`.
- Store full app backup snapshots.
- Reject secret-like payloads.
- Require UI confirmation before restore.
- Save a pre-restore local backup before replacing local keys.
