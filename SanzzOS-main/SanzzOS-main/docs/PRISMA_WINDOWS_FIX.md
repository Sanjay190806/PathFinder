# Prisma Windows EPERM Fix

`npx prisma generate` can fail on Windows with `EPERM` while renaming `query_engine-windows.dll.node` when a Node process is holding the Prisma client DLL.

Run Prisma commands from `backend/` or through the root scripts:

```bash
npm run prisma:validate
npm run prisma:generate
npm run db:status
```

For the safer Windows wrapper, use:

```bash
npm run prisma:generate:safe
```

If it still fails:

1. Stop the backend dev server.
2. Close terminals running backend code.
3. Close editors or watchers touching `node_modules/.prisma`.
4. Re-run `npm run prisma:generate:safe`.
5. If you accept stopping all Node processes manually, run `taskkill /IM node.exe /F`.
6. Reboot Windows if the DLL remains locked.

This is a file-lock problem, not a schema problem. Do not run migrations or reset the database to fix a DLL lock.
