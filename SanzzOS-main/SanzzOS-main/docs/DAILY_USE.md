# Daily Use - v1.7.2 Stable Base

Sanju Career OS is now a stable base for daily July career work. Use it to track work; do not keep adding tracker features during daily prep.

## Start

1. Double-click `Start-Sanzz-OS.bat`.
2. Keep the backend and frontend terminal windows open.
3. Open the app at `http://localhost:5173` if the browser does not open automatically.

## If Database Is Not Ready

Use **Continue Local Only** on the auth screen. Local-only mode works without PostgreSQL, Prisma, Google auth, or any backend database connection.

The backend may show the database as unavailable. That is acceptable for local-only daily tracking.

## Daily Rule

Do not run Prisma every day. Prisma commands are only needed when changing the database schema, repairing setup, or preparing a release.

## Weekly Backup

Export a backup weekly from the app settings. Backup export is local-first and skips secret-like data such as tokens, passwords, API keys, and `.env` content.

## Stop

Use `Stop-Sanzz-OS.bat` when done. It targets the local app ports and Sanzz OS terminal windows.

## Stable Base Boundary

v1.7.2 is the stable base release. Stop tracker development now and use the tracker for July 1 career work.
