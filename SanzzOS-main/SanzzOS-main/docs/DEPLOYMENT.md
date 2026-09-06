# Deployment Guide - Sanju Career OS v1.7.2

This guide covers three deployment scenarios:
1. **Local Development** — run everything on your machine
2. **Local Production** — Docker Compose full stack
3. **Cloud Deployment** — Frontend on Vercel, Backend on Render/Railway

---

## Prerequisites

| Tool | Minimum Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Frontend and backend runtime |
| npm | 9.x | Package manager (workspace-aware) |
| Docker Desktop | Latest | PostgreSQL container |
| WSL 2 + Ubuntu 24.04 | — | Required on Windows for Docker |
| Git | 2.x | Version control |

### Verify prerequisites

```powershell
node --version          # expect v20.x
npm --version           # expect 9.x or 10.x
docker --version        # expect Docker 24.x+
docker compose version  # expect v2.x
wsl --list --verbose    # Ubuntu-24.04 should show Running
```

---

## 1. Local Development Setup

### Step 1 — Clone and install

```powershell
git clone https://github.com/your-org/sanju-career-os.git
cd sanju-career-os
npm install
```

### Step 2 — Start PostgreSQL

```powershell
npm run db:up
```

This starts the Postgres container defined in `docker-compose.yml`:
- Host: `localhost:5432`
- Database: `sanju_career_os`
- Username: `postgres`
- Password: `password` (dev only)

### Step 3 — Configure backend environment

```powershell
cd backend
Copy-Item .env.example .env
```

Edit `backend/.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/sanju_career_os?schema=public"
GROQ_API_KEY="gsk_your_real_groq_key_here"
GROQ_MODEL="llama3-70b-8192"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

> **Security**: Never commit `backend/.env`. It is listed in `.gitignore`.
> The Groq key must start with `gsk_`. Do not include the word `Bearer`.

### Step 4 — Run Prisma migrations

Run from the `backend/` directory so Prisma reads `backend/.env`:

```powershell
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

### Step 5 — Run the app

In two separate terminals from the project root:

```powershell
# Terminal 1 — Frontend dev server (hot reload)
npm run dev:frontend

# Terminal 2 — Backend dev server (tsx watch)
npm run dev:backend
```

### Step 6 — Verify

| Service | URL | Expected |
|---|---|---|
| Frontend | `http://localhost:5173` | App loads, landing page visible |
| Backend health | `http://localhost:5000/api/health` | JSON with `status: "ok"` |
| AI status | `http://localhost:5000/api/ai/status` | Groq model listed |
| Settings health check | Settings → System Health | All green |

---

## 2. Local Production (Docker Compose Full Stack)

Use `docker-compose.production.yml` for a closer-to-production test environment.

### Step 1 — Build the frontend bundle

```powershell
npm run build:frontend
```

Output lands in `frontend/dist/`.

### Step 2 — Build the backend TypeScript

```powershell
npm run build:backend
```

Output lands in `backend/build/`.

### Step 3 — Configure production environment

Copy and edit the production env file for the backend container:

```powershell
cd backend
Copy-Item .env.example .env.production
```

Edit with production values (real DB URL, real Groq key, correct CORS origin).

### Step 4 — Start the full stack

```powershell
docker compose -f docker-compose.production.yml up -d
```

---

## 3. Cloud Deployment

### Frontend — Vercel

1. Connect your Git repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Output Directory** to `dist`.
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://your-backend-domain.com/api`
6. Deploy.

> The frontend is a fully static SPA — no server-side rendering required.

### Backend — Render or Railway

1. Create a new **Web Service** pointing to the `backend/` directory.
2. Set the **Build Command** to `npm run build`.
3. Set the **Start Command** to `node build/server.js`.
4. Add environment variables:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=postgresql://...  (from your managed Postgres)
   GROQ_API_KEY=gsk_...
   GROQ_MODEL=llama3-70b-8192
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   FRONTEND_URL=https://your-frontend-domain.vercel.app
   ```
5. Attach a **managed PostgreSQL** instance (Render Postgres, Railway Postgres, or Supabase).
6. Run Prisma migrations on first deploy:
   ```
   npx prisma migrate deploy
   ```

---

## Environment Variable Reference

| Variable | Required | Default (dev) | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `development` or `production` |
| `PORT` | No | `5000` | Backend HTTP port |
| `DATABASE_URL` | Yes | `postgresql://postgres:password@localhost:5432/sanju_career_os?schema=public` | Prisma connection string |
| `GROQ_API_KEY` | Yes | *(none)* | Groq API key (starts with `gsk_`) |
| `GROQ_MODEL` | No | `llama3-70b-8192` | Groq model identifier |
| `CORS_ORIGIN` | Yes | `http://localhost:5173` | Allowed frontend origin |
| `FRONTEND_URL` | No | `http://localhost:5173` | Used for redirect references |
| `VITE_API_BASE_URL` | No | `http://localhost:5000/api` | Frontend API base URL (Vite env) |

---

## Useful NPM Scripts

```powershell
npm run dev:frontend          # Vite dev server with HMR
npm run dev:backend           # tsx watch mode backend
npm run build:frontend        # TypeScript + Vite production build
npm run build:backend         # TypeScript compile backend
npm run lint                  # tsc --noEmit (frontend TypeScript check)
npm run db:up                 # Start Docker Postgres
npm run db:down               # Stop Docker Postgres
npm run db:logs               # Tail Postgres container logs
npm run db:restart            # Restart Postgres container
npm run prisma:generate       # Regenerate Prisma client
npm run prisma:migrate        # Run pending migrations
npm run prisma:studio         # Open Prisma Studio UI
npm run prisma:seed           # Seed database
```

---

## Health Checks

| Endpoint | Method | Expected Response |
|---|---|---|
| `/api/health` | GET | `{ api: { status: "ok" }, database: {...}, groq: {...}, uptime: N }` |
| `/api/ai/status` | GET | `{ model: "llama3-70b-8192", status: "connected" }` |

---

## Rollback Procedure

### Frontend

Vercel maintains deployment history. To roll back:
1. Open Vercel dashboard → Deployments.
2. Select the previous successful deployment.
3. Click **Promote to Production**.

### Backend

If using Render or Railway:
1. Navigate to the service's deploy history.
2. Select the previous deploy and redeploy.
3. If the database schema changed, run `npx prisma migrate resolve` to mark the bad migration as rolled back.

### Local data recovery

Use **Settings → Backup & Restore** to export/import a JSON snapshot of all localStorage data. This provides a manual recovery path if state corruption occurs.

---

## Common Issues

| Symptom | Cause | Fix |
|---|---|---|
| Frontend blank screen | API base URL wrong | Check `VITE_API_BASE_URL` in frontend env |
| Groq 401 error | Invalid API key | Verify `GROQ_API_KEY` starts with `gsk_` |
| Prisma EPERM on Windows | Node lock on `.prisma` | `taskkill /F /IM node.exe` then re-generate |
| Port 5000 in use | Another process | Change `PORT` in `backend/.env` |
| DB connection refused | Docker not running | `npm run db:up` |
# v1.7.2 Auth And Cloud Sync Notes

Required backend env:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="replace_with_secure_random_secret"
FRONTEND_URL="https://your-frontend.example"
NODE_ENV="production"
PORT="5000"
```

Required frontend env:

```bash
VITE_API_BASE_URL="https://your-backend.example"
```

Run before deploying the backend:

```bash
npm run prisma:generate --workspace=backend
npm run prisma:validate --workspace=backend
npm run prisma:migrate --workspace=backend -- --name v1_7_auth_cloud_sync
```

Do not deploy with placeholder `JWT_SECRET` or a local `DATABASE_URL`.
