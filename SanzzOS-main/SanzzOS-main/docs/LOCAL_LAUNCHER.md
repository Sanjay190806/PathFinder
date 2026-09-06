# Local Launcher (v1.6.4)

## Daily use (Windows)

1. Double-click `Start-Sanzz-OS.bat` at repo root.
2. Opens frontend (Vite) and backend (Express).
3. App stores progress in browser localStorage automatically.

## Stop

Double-click `Stop-Sanzz-OS.bat`.

## Developer commands

```powershell
npm install
npm run dev:all
npm run build
npm run check:all
```

## Database (optional)

Only needed for manual DB snapshot sync or Prisma-backed features:

```powershell
npm run db:up
npm run prisma:migrate
npm run prisma:generate
```

Normal tracker usage without DB sync does not require Docker/PostgreSQL.
