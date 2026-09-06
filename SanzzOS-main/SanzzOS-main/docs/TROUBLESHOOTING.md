# Troubleshooting - v1.7.2 Stable Base

## Backend Already Running

If port `5000` is already running, `Start-Sanzz-OS.bat` skips starting another backend. This prevents duplicate backend crashes.

Check it with:

```bat
netstat -ano | findstr :5000
```

## Database Unavailable

Auth and cloud sync may return:

```json
{
  "success": false,
  "error": {
    "code": "database_unavailable",
    "message": "Database is unavailable. You can continue Local-only mode."
  }
}
```

Use **Continue Local Only** and keep working. Fix PostgreSQL later.

## Invalid PostgreSQL Credentials

Run:

```bash
npm run db:doctor
npm run db:status
```

If credentials are invalid, update only `backend/.env`. Never commit real `.env` files.

## Prisma EPERM On Windows

`npx prisma generate` can fail if a running Node process locks `query_engine-windows.dll.node`.

Manual fix:

1. Stop the backend.
2. Close terminals running backend or Prisma code.
3. Kill Node processes only if needed.
4. Re-run `npx prisma generate` from `backend/` or `npm run prisma:generate` from root.
5. Reboot if the DLL remains locked.

## Build Fails

Run from repo root:

```bash
npm run build
```

## Tests Fail

Run from repo root:

```bash
npm run test
```

## Backup Export

Use Settings backup/export. Backups skip secret-like content such as tokens, passwords, API keys, and `.env` data.

## Daily Use

Do not run Prisma every day. Start the app, use local-only if the DB is not ready, and focus on career work.
