# Setup Guide — Sanju Career OS v1.6.4

A step-by-step guide to get Sanju Career OS running on your local machine from scratch.

---

## System Requirements

| Requirement | Version | Platform |
|---|---|---|
| Windows 10/11 | — | Required for this guide |
| WSL 2 | — | Required for Docker |
| Ubuntu 24.04 (WSL) | — | Recommended distro |
| Docker Desktop | Latest | PostgreSQL container |
| Node.js | 20.x LTS | JavaScript runtime |
| npm | 9.x or 10.x | Package manager |
| Git | 2.x | Version control |

---

## Step 1 — Install WSL 2 and Ubuntu

Open PowerShell as Administrator:

```powershell
wsl --install -d Ubuntu-24.04
```

Restart Windows when prompted. Then verify:

```powershell
wsl --list --verbose
```

Ubuntu-24.04 should show **Running** and version **2**.

---

## Step 2 — Install Docker Desktop

1. Download from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install with WSL 2 backend enabled.
3. Open Docker Desktop settings → Resources → WSL Integration → enable Ubuntu-24.04.
4. Restart Docker Desktop.
5. Verify:

```powershell
docker --version
docker compose version
```

---

## Step 3 — Install Node.js

Download Node.js 20 LTS from [https://nodejs.org](https://nodejs.org) and install.

Verify:

```powershell
node --version   # v20.x.x
npm --version    # 9.x or 10.x
```

---

## Step 4 — Clone the Repository

```powershell
git clone https://github.com/your-org/sanju-career-os.git
cd sanju-career-os
```

---

## Step 5 — Install Dependencies

From the project root (installs all workspaces: root, frontend, backend):

```powershell
npm install
```

This installs ~1,500 packages across three workspaces.

---

## Step 6 — Start the Database

```powershell
npm run db:up
```

This starts a PostgreSQL 15 container in Docker with:
- Host: `localhost`
- Port: `5432`
- Database: `sanju_career_os`
- Username: `postgres`
- Password: `password`

Verify it's running:

```powershell
docker ps
```

You should see a `postgres:15` container in **Up** status.

---

## Step 7 — Configure Backend Environment

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env` in your editor and fill in:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/sanju_career_os?schema=public"
GROQ_API_KEY="gsk_your_real_groq_api_key"
GROQ_MODEL="llama3-70b-8192"
CORS_ORIGIN="http://localhost:5173"
FRONTEND_URL="http://localhost:5173"
```

### Getting a Groq API Key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up or log in.
3. Navigate to API Keys → Create New Key.
4. Copy the key (starts with `gsk_`).
5. Paste it as the value of `GROQ_API_KEY` in `backend/.env`.

> **Security rule:** Never add the Groq key to any frontend file, `frontend/.env`, or commit it to git.

---

## Step 8 — Run Prisma Setup

All Prisma commands must be run from the `backend/` directory so they read `backend/.env`:

```powershell
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

| Command | Purpose |
|---|---|
| `prisma validate` | Confirms `schema.prisma` is valid |
| `prisma generate` | Generates the Prisma client |
| `prisma migrate dev` | Creates and applies the initial database schema |
| `prisma:seed` | Inserts default seed data |

---

## Step 9 — Start the Application

Open **two separate PowerShell terminals** from the project root:

**Terminal 1 — Frontend:**
```powershell
npm run dev:frontend
```

Wait for: `VITE ready in XXX ms` and `Local: http://localhost:5173/`

**Terminal 2 — Backend:**
```powershell
npm run dev:backend
```

Wait for: `Server running on port 5000`

---

## Step 10 — Verify Everything Works

Open your browser and go to [http://localhost:5173](http://localhost:5173).

You should see the **Sanju Career OS landing page**.

Run these health checks:

```powershell
# Backend API health
Invoke-WebRequest -Uri http://localhost:5000/api/health | ConvertFrom-Json

# AI status (Groq)
Invoke-WebRequest -Uri http://localhost:5000/api/ai/status | ConvertFrom-Json
```

Inside the app, go to **Settings → System Health** and run:
- ✅ Test Backend
- ✅ Test Groq
- ✅ Test Shayla

All three should show green status.

---

## Quick Start After First Setup

Once set up, every subsequent session only requires:

```powershell
# Start database (if not already running)
npm run db:up

# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:backend
```

---

## One-Click Launch (Windows)

Double-click **`Start-Sanzz-OS.bat`** in the project root. This script starts both the frontend and backend in one go.

To stop everything, double-click **`Stop-Sanzz-OS.bat`**.

---

## Troubleshooting

### Docker not found
```powershell
docker --version  # command not found
```
**Fix:** Install Docker Desktop, restart Windows, reopen terminal.

### WSL has no distributions
```powershell
wsl --install -d Ubuntu-24.04
```

### `DATABASE_URL` not found when running Prisma
**Fix:** Always run Prisma commands from the `backend/` directory, not the project root.

### Prisma EPERM on Windows
```powershell
taskkill /F /IM node.exe
Remove-Item -Recurse -Force .\node_modules\.prisma
cd backend
npx prisma generate
```

### Groq API key not working
1. Check the key starts with `gsk_`.
2. Do not include the word `Bearer`.
3. Remove any trailing spaces or newlines.
4. Restart the backend after editing `.env`.
5. Test at `http://localhost:5000/api/ai/status`.

### Frontend displays unstyled content
1. Check `frontend/src/main.tsx` imports `./styles/globals.css`.
2. Check `frontend/tailwind.config.js` includes `./src/**/*.{js,ts,jsx,tsx}`.
3. Check `frontend/postcss.config.js` exists.

### Port 5173 or 5000 already in use
```powershell
# Find and kill the process using the port
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Or change `PORT` in `backend/.env` (for backend) or `--port` in the Vite dev script (for frontend).

---

## What's Installed

After setup, your running stack is:

| Service | URL | Purpose |
|---|---|---|
| Frontend (Vite) | `http://localhost:5173` | React app with hot reload |
| Backend (Express) | `http://localhost:5000` | API server + Groq proxy |
| PostgreSQL (Docker) | `localhost:5432` | Database |
| Prisma Studio | `http://localhost:5555` | Database GUI (run `npm run prisma:studio`) |
