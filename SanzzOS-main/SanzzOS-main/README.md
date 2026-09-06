# SanzzOS (Sanju Career OS)

<p align="center">
  <img src="frontend/public/icon-192.png" alt="SanzzOS Logo" width="120" style="border-radius: 24%; margin-bottom: 20px;"/>
</p>

<p align="center">
  <strong>A Local-First AI Career Operating System for students, placements, productivity, language learning, interview preparation, and AI-assisted planning.</strong>
</p>

<p align="center">
  <a href="https://github.com/Sanjay190806/SanzzOS/releases"><img src="https://img.shields.io/badge/version-v1.7.2-00bcd4.svg?style=flat-square" alt="Version"/></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-61dafb.svg?style=flat-square&logo=react" alt="React"/></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6.svg?style=flat-square&logo=typescript" alt="TypeScript"/></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-5-646cff.svg?style=flat-square&logo=vite" alt="Vite"/></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-4-000000.svg?style=flat-square&logo=express" alt="Express"/></a>
  <a href="https://www.postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-15-4169e1.svg?style=flat-square&logo=postgresql" alt="PostgreSQL"/></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-5-2d3748.svg?style=flat-square&logo=prisma" alt="Prisma"/></a>
  <a href="https://github.com/pmndrs/zustand"><img src="https://img.shields.io/badge/Zustand-4-443e38.svg?style=flat-square" alt="Zustand"/></a>
  <a href="https://groq.com"><img src="https://img.shields.io/badge/Groq%20AI-Llama--3-f55036.svg?style=flat-square" alt="Groq"/></a>
  <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-WSL2-2496ed.svg?style=flat-square&logo=docker" alt="Docker"/></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg?style=flat-square" alt="License"/></a>
  <a href="https://github.com/Sanjay190806/SanzzOS"><img src="https://img.shields.io/badge/build-passing-brightgreen.svg?style=flat-square" alt="Build Status"/></a>
  <a href="docs/LOCAL_MODE.md"><img src="https://img.shields.io/badge/Local--First-persisted-blueviolet.svg?style=flat-square" alt="Local First"/></a>
  <a href="docs/OFFLINE_MODE.md"><img src="https://img.shields.io/badge/Offline-Shell%20Ready-success.svg?style=flat-square" alt="Offline Support"/></a>
</p>

---

## 🚀 Latest Stable Release: v1.7.2

SanzzOS v1.7.2 delivers full database and authentication stability. It provides robust error-handling fallback logic that isolates PostgreSQL connection issues, allowing the app to run seamlessly in **Local-First / Offline Mode** if the local database is offline. All historical changes from v1.1 to v1.7.2 are archived in the [CHANGELOG.md](file:///c:/SanzzGen/Projects/Career_OS-main/Career_OS-main/CHANGELOG.md).

---

## 📌 Table of Contents

- [1. Hero Section](#1-hero-section)
- [2. Project Overview](#2-project-overview)
- [3. Key Highlights](#3-key-highlights)
- [4. Feature Breakdown](#4-feature-breakdown)
- [5. Technology Stack](#5-technology-stack)
- [6. Architecture](#6-architecture)
- [7. Folder Structure](#7-folder-structure)
- [8. Installation Guide](#8-installation-guide)
- [9. Environment Variables](#9-environment-variables)
- [10. Groq API Setup](#10-groq-api-setup)
- [11. Daily Workflow Guide](#11-daily-workflow-guide)
- [12. AI Commands](#12-ai-commands)
- [13. Offline Mode](#13-offline-mode)
- [14. Security](#14-security)
- [15. Troubleshooting](#15-troubleshooting)
- [16. Roadmap](#16-roadmap)
- [17. Screenshots](#17-screenshots)
- [18. Contributing](#18-contributing)
- [19. License](#19-license)
- [20. Credits](#20-credits)

---

## 📖 Project Overview

### What is SanzzOS?
**SanzzOS (Sanju Career OS)** is a unified, local-first career management ecosystem designed to streamline coding preparation, project tracking, corporate recruitment applications, analytics, and language learning. 

### Why does it exist?
Preparing for modern technical placements is a highly fragmented process. Students are forced to juggle several platforms simultaneously: LeetCode for Data Structures & Algorithms, SkillRack for competitive coding, spreadsheets to track company applications, text editors for resumes, vocabulary apps for language studies, and generalized chatbots for mentorship. SanzzOS integrates all of these systems into a unified dashboard, operating locally on your machine with optional cloud synchronization.

### Who is it for?
- **Engineering Students & Placements Candidates:** Tracking applications, mock interviews, and DSA roadmaps.
- **Self-Directed Learners:** Logging technical learning paths and earning achievements.
- **Productivity Enthusiasts:** Utilizing adaptive planner algorithms to schedule tasks based on daily energy levels.

---

## 🌟 Key Highlights

- **🔒 Local-First, Privacy-First:** Your data is stored directly in your browser's local storage and syncs to a local PostgreSQL instance. No external cloud provider has access to your logs or notes.
- **🧠 Contextual AI Mentor:** Powered by the Groq Llama-3 inference model, Shayla AI serves as your dedicated guide across DSA, project design, resume auditing, and German language lessons.
- **⚡ Smart Daily Planner:** Generates specialized checklists using adaptive schedules (Normal, Busy, Low Energy, Placement Sprint, Project Build, and Revision modes).
- **📊 Analytics 2.0:** Tracks study hours, accumulated XP, skill proficiency breakdowns, readiness metrics, and mental burnout warnings.
- **🇩🇪 Integrated German Academy:** A complete, 30-lesson German learning curriculum complete with interactive lessons, quizzes, and AI conversation support.
- **🏆 Gamified Progress:** Includes a global XP system, daily streaks (with streak-freeze mechanics), and a 120-item achievement catalog.

---

## 🛠️ Feature Breakdown

| Module | Description | Current Status | Technologies | Future Roadmap |
| :--- | :--- | :--- | :--- | :--- |
| **Overview Dashboard** | Real-time widgets displaying daily briefing logs, current focus states, streak status, and XP progress. | ✅ Stable | React, Tailwind, Zustand | Add custom widget configuration layouts. |
| **Today Workspace** | Daily task checklists, focus timers, activity logs, and energy level personalizations. | ✅ Stable | Zustand, Web LocalStorage | Integrate custom Pomodoro configurations. |
| **Smart Daily Planner** | Mode-based adaptive planner that populates your workspace based on your selected energy or study target. | ✅ Stable | TypeScript, Groq Llama-3 | Export tasks directly to Google Calendar. |
| **Learning OS** | Tracks progress across 14 career pathways, logging study sessions, masteries, and weak areas. | ✅ Stable | Zustand Persistence | Support importing custom video roadmap schedules. |
| **Placement OS** | Direct board tracker for target companies, online assessments (OA), resumes, and interview checklists. | ✅ Stable | Zustand, PostgreSQL, Prisma | Integrate active web-scrapers for job openings. |
| **German Academy** | 30 structured lessons containing interactive grammar sections, vocabulary definitions, and quizzes. | ✅ Stable | React components, Local State | Voice-assisted pronunciation assessment. |
| **Analytics 2.0** | Aggregates daily study times, skill breakdowns, milestones, and burnout warnings. | ✅ Stable | SVG Charts, Cache Service | Machine learning-based productivity predictions. |
| **Shayla AI Mentor** | Chat interface providing streaming AI feedback. Connected directly with your career context. | ✅ Stable | Express Proxy, Groq SSE | Voice commands and text-to-speech feedback. |
| **AI Brain** | Summarizes career statistics, runs risk assessments, and calculates a Placement Readiness Score. | ✅ Stable | Groq Llama-3 Context | Incorporate deep network graphing. |
| **Resume & Projects** | Built-in resume editor and portfolio tracker with real-time AI-powered resume auditing. | ✅ Stable | Tailwind CSS, Groq API | Export clean, ATS-compliant PDF files. |
| **DSA & SkillRack** | LeetCode patterns checklists and SkillRack practice trackers. | ✅ Stable | Zustand Stores | Automated status checks using webhooks. |

---

## 💻 Technology Stack

### Frontend
- **Framework:** React 18 (TypeScript, Vite compiler)
- **Styling:** Tailwind CSS (Custom HSL Neon Dark Theme, glassmorphic UI design)
- **State Management:** Zustand (Persisted client-side cache stores with custom migration versioning)
- **Routing:** Custom Popstate Router (Synchronized state-routing enabling fast public routes `/`, `/landing`, `/portfolio`)

### Backend
- **Runtime:** Node.js (Express server framework written in TypeScript)
- **Database Client:** Prisma ORM (Schema validation, query builds, seeds, and database structural migrations)
- **AI Delivery:** Server-Sent Events (SSE stream reader for real-time AI mentoring chat tokens)

### Database
- **Engine:** PostgreSQL 15 (Relational persistence)

### AI Core
- **Inference Engine:** Groq API Cloud
- **LLM Model:** Llama-3-70b-8192 (Custom model selection supported via backend config)

### DevOps & Tooling
- **Containerization:** Docker & Docker Compose (PostgreSQL service management)
- **WSL 2 Support:** Ubuntu 24.04 compatibility configurations
- **Automation Scripts:** PowerShell and Command Prompt custom startup batches

---

## 📐 Architecture

SanzzOS operates using a secure, local-first client-server model. The frontend handles active rendering, routing, and offline storage. The backend routes database actions, maintains authentication, and acts as a secure, authenticated proxy to Groq AI.

```mermaid
graph TD
    User["User Interface"] -->|Interacts| FE["React Frontend (Zustand)"]
    FE -->|Syncs State / Backups / SSE Chats| BE["Express Backend"]
    FE -->|Persists Locally| LS[("Browser LocalStorage (Zustand Cache)")]
    BE -->|Queries & Migrations| ORM["Prisma Client"]
    ORM -->|Reads/Writes| DB[("PostgreSQL Database")]
    BE -->|Secure Proxy Requests| AI["Groq Cloud API (Llama-3)"]

    style FE fill:#61dafb,stroke:#333,stroke-width:2px,color:#000
    style BE fill:#83cd29,stroke:#333,stroke-width:2px,color:#000
    style DB fill:#4169e1,stroke:#333,stroke-width:2px,color:#fff
    style LS fill:#7952b3,stroke:#333,stroke-width:2px,color:#fff
    style AI fill:#f55036,stroke:#333,stroke-width:2px,color:#fff
```

### Architectural Layers
1. **Frontend Viewport:** Built using React 18, utilizing Zustand stores to persist UI state inside local storage.
2. **Backend Proxy:** An Express server that intercepts requests. Secrets like `GROQ_API_KEY`, OAuth credentials, and database passwords remain secured server-side.
3. **ORM Layer (Prisma):** Acts as the bridge to the relational database, running schema validation and database seed populations.
4. **Relational Database:** A Dockerized PostgreSQL instance storing profiles, synced snapshots, and logs.
5. **AI Interface:** Connects to Groq's low-latency endpoints using secure credentials.

---

## 📂 Folder Structure

```
SanzzOS/
├── .agents/                 # Custom AI agents configuration folder
├── backend/                 # Node.js + Express API backend server
│   ├── prisma/              # Prisma schema configurations, migrations, and database seeds
│   ├── src/                 # Express application routing, controllers, and services
│   ├── .env.example         # Template for backend secret environment variables
│   └── package.json         # Backend dependency manifest
├── data/                    # Shared datasets (180-day roadmaps, 120 achievements, lesson catalogs)
├── docs/                    # Technical guides (architecture, synchronization, testing, offline mode)
├── electron/                # Desktop integration wrappers (future implementation)
├── frontend/                # React Vite client workspace
│   ├── public/              # Public asset folder (PWA manifest, logo icons, offline fallback pages)
│   ├── src/                 # Frontend source (components, hooks, routing, store interfaces)
│   └── package.json         # Frontend dependency manifest
├── package.json             # Root workspace dependency and script configurations
├── Start-Sanzz-OS.bat       # Single-click application startup batch (Windows)
└── Stop-Sanzz-OS.bat        # Clean shutdown script for SanzzOS processes
```

---

## 📥 Installation Guide

Follow these steps to configure and run SanzzOS locally.

### 📋 Prerequisites
Ensure the following tools are installed on your machine:
- **Node.js:** v20.x LTS or higher
- **Git:** Version 2.x
- **Docker Desktop:** Installed and running (with WSL 2 integration enabled if you are on Windows)
- **WSL 2 (Optional/Recommended for Windows):** Ubuntu 24.04 LTS

To verify your installation, run:
```powershell
node --version
docker --version
docker compose version
```

---

### 🛠️ Step-by-Step Setup

#### 1. Clone the Repository
```powershell
git clone https://github.com/Sanjay190806/SanzzOS.git
cd SanzzOS
```

#### 2. Install Project Dependencies
Run the command below from the project root. This command will install dependencies across all npm workspaces (root, frontend, and backend):
```powershell
npm install
```

#### 3. Start the PostgreSQL Container
Start the PostgreSQL container in detached mode:
```powershell
npm run db:up
```
*(Alternative command: `docker compose up -d`)*

Verify that the database is running:
```powershell
docker ps
```
The database runs locally on port `5432` with username `postgres`, password `password`, and database `sanju_career_os`.

#### 4. Configure Backend Environment
Navigate to the `backend` folder, duplicate the example env file, and rename it:
```powershell
cd backend
copy .env.example .env
```
*(If you are using Git Bash or Linux, run: `cp .env.example .env`)*

Open `backend/.env` in your editor and configure the variables (see the [Environment Variables](#9-environment-variables) section below).

#### 5. Initialize the Database Schema (Prisma ORM)
Run all database commands from the `backend/` directory so Prisma can read your `.env` file:
```powershell
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

#### 6. Run the Application
Open **two separate terminals** from the project root:

- **Terminal 1 (Frontend):**
  ```powershell
  npm run dev:frontend
  ```
  *Wait for the client server to start at `http://localhost:5173`.*

- **Terminal 2 (Backend):**
  ```powershell
  npm run dev:backend
  ```
  *Wait for the server to confirm it is running on port `5000`.*

Open your web browser and go to [http://localhost:5173](http://localhost:5173).

---

### ⚡ One-Click Startup (Windows)
For subsequent sessions, you can launch the entire ecosystem in one go:
- Double-click **`Start-Sanzz-OS.bat`** in the project root to start the database, backend, and frontend.
- Double-click **`Stop-Sanzz-OS.bat`** to cleanly close all running servers.

---

## 🔑 Environment Variables

SanzzOS requires specific environment variables to run. The backend reads these from `backend/.env`.

> [!WARNING]
> Never commit your `.env` file containing active secrets to Git. The project contains a `.gitignore` rule that excludes `.env` files automatically.

| Variable | Description | Example / Placeholder Value |
| :--- | :--- | :--- |
| `NODE_ENV` | Mode of operation | `development` |
| `PORT` | Local port for Express backend | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/sanju_career_os?schema=public` |
| `GROQ_API_KEY` | Your unique Groq credentials | `gsk_your_api_key_here` *(See guide below)* |
| `GROQ_MODEL` | Default model identifier | `llama3-70b-8192` |
| `JWT_SECRET` | Token signature seed for login sessions | `your_long_jwt_secret_hash_key` |
| `CORS_ORIGIN` | Allowed client URL | `http://localhost:5173` |
| `FRONTEND_URL` | Base URL of the client app | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | OAuth Client ID (v1.7.1+) | `your_google_client_id_placeholder` |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret (v1.7.1+) | `your_google_client_secret_placeholder` |
| `GOOGLE_CALLBACK_URL` | OAuth redirection endpoint | `http://localhost:5000/api/auth/google/callback` |

---

## 🧠 Groq API Setup

To enable the AI mentor (Shayla AI), resume audits, and mock interview modules, you must configure a Groq API key.

### 📝 Step-by-Step API Key Generation Guide

1. Go to the [Groq Console](https://console.groq.com).
2. Sign up with your email or log in if you already have an account.
3. In the sidebar, navigate to **API Keys**.
4. Click the **Create API Key** button.
5. Provide a descriptive label (e.g., `SanzzOS-Local`).
6. Click **Generate** and **copy the API Key** immediately. 
   *(Note: The key starts with `gsk_`. You will not be able to view this key again).*
7. Open the `backend/.env` file on your local machine.
8. Paste the key directly as the value for `GROQ_API_KEY`:
   ```env
   GROQ_API_KEY="gsk_xxxxxxxxxxxxxxxxxxxxxx"
   ```
9. Save the file and restart the backend server.

---

### 🛡️ Secret Key Security Guidelines

> [!CAUTION]
> **Keep your keys secret:**
> - **Never** push the `.env` file to GitHub or any public repository.
> - **Never** add your API key to frontend folders, `frontend/.env`, or hardcode it in React files.
> - **Never** share screenshots or videos showing your raw API keys.
> - **Why it matters:** If your key is exposed, malicious actors can exhaust your API limits or access your account services.

### How does the Backend Proxy protect my key?
The application uses a **Server-Side API Proxy** pattern. The frontend client does not communicate with Groq directly. Instead, all client requests go to the Express server at `/api/ai/*`. The backend appends the `GROQ_API_KEY` to the request header and routes it securely to Groq, protecting your credentials.

---

## 📅 Daily Workflow Guide

SanzzOS is built to support a consistent daily preparation cycle. Here is the recommended workflow:

```
[ Morning ] ──────> [ Study Session ] ──────> [ Evening ]
Launch App          Log Coding Hours          Review Analytics
Select Energy       Earn Milestone XP         Create JSON Backup
Generate Plan       Practice Language         Shutdown Server
```

### 🌅 1. Morning Routine (Start & Plan)
- Launch the application using `Start-Sanzz-OS.bat`.
- Open `http://localhost:5173` and view the Overview dashboard.
- Assess your daily capacity and set your current energy mode (e.g., **Low Energy**, **Normal**, **Placement Sprint**).
- Open the **Smart Planner** and select **Generate Today's Plan** to build a structured set of daily tasks.

### 💻 2. Afternoon Session (Learn & Track)
- Complete tasks on your check list.
- Use the **Today** workspace focus timer to log deep work sessions.
- Open **Learning OS** to complete modules on your active learning path.
- Check off solved DSA problems under the **DSA Tracker**.
- Go to the **German Academy** and complete a quick vocabulary lesson.
- Earn XP for completed tasks and track your progress in real-time.

### 🌃 3. Evening Wrap-Up (Review & Backup)
- Open **Analytics 2.0** to inspect your study hours, XP gains, and burnout warning levels.
- Review notifications to see if you have unlocked any of the 120 gamified achievements.
- Go to **Settings → Backup & Restore** and select **Export Backup** to save a local JSON copy of your progress.
- Close the application using `Stop-Sanzz-OS.bat`.

---

## 🗣️ AI Command System

You can run commands using the search/command bar on the dashboard or by typing directly in the Shayla AI chat interface.

| Command Syntax | Target Module | Intended Outcome |
| :--- | :--- | :--- |
| `generate today's plan` | Smart Planner | Builds a plan matching your active energy level. |
| `show placement readiness` | AI Brain / Placement OS | Calculates and shows your placement readiness details. |
| `update company status Google Applied` | Placement OS | Updates application boards to reflect changes. |
| `log learning session DSA 60` | Learning OS | Logs a 60-minute DSA study session. |
| `show due revision` | Learning OS | Lists study cards that are due for revision. |
| `show weak skills` | Learning OS | Highlights paths with low mastery ratings. |
| `refresh AI Brain` | AI Brain | Re-analyzes your career statistics and profile. |
| `export backup` | Settings Backup | Exports your local progress as a JSON file. |
| `update German progress Lesson 5` | German Academy | Logs completion of Lesson 5, unlocking Lesson 6. |

---

## 📴 Offline Mode

SanzzOS is engineered as an **offline-first** application. 

### What works offline?
- The Popstate router and public/private pages.
- Zustand local storage cache persistence.
- Daily checklists, focus timers, and task logging.
- Target company application status boards.
- German Academy lesson cards, vocabulary indexes, and notes.
- The 120-item achievement engine.

### What requires an active connection?
- **Shayla AI Mentoring Chat:** Requires connection to Groq API.
- **Resume Reviews & Mock Interviews:** Requires connection to Groq API.
- **Google OAuth Login:** Requires active communication with Google Identity servers (v1.7.1+).
- **Backend Sync:** Saving snapshots to PostgreSQL (local Docker engine must be active).

---

## 🔒 Security

We prioritize data security and protection across all layers:

- **API Keys:** Stored exclusively in the backend `.env` file, isolating keys from the frontend browser bundle.
- **JWT Authorization:** Secured login sessions with signed tokens and secure, httpOnly cookie configurations (v1.7.0+).
- **Password Protection:** Plaintext passwords are never stored in the database. Passwords are hashed using the secure `crypto.scrypt` protocol.
- **XSS Protection:** Enforces URL and text sanitizations inside `securityUtils.ts` to prevent script injections during Markdown rendering.
- **Prototype Pollution Prevention:** Backup parsers inspect all keys to block dangerous identifiers (`__proto__`, `constructor`, `prototype`).
- **Data Privacy:** Your progress remains saved locally on your machine unless you configure PostgreSQL sync.

---

## 🔍 Troubleshooting

| Area | Issue Description | Potential Cause | Actionable Resolution |
| :--- | :--- | :--- | :--- |
| **Docker** | `docker --version` command not found. | Docker Desktop is not installed or not on path. | Install Docker Desktop and restart your machine. |
| **WSL2** | Ubuntu will not run or lists version errors. | WSL 2 features are disabled on your machine. | Run `wsl --install -d Ubuntu-24.04` in PowerShell as administrator, then restart your PC. |
| **PostgreSQL** | Backend shows database connection errors. | PostgreSQL container is offline or ports are blocked. | Run `npm run db:up` from the root folder. Verify with `docker ps`. |
| **Prisma** | `DATABASE_URL not found` when running migrations. | Run command from the wrong folder path. | Always run Prisma commands from the `backend/` folder, not the root. |
| **Prisma** | `EPERM` folder locked error on Windows. | Node.js processes are holding file locks on generated clients. | Run `taskkill /F /IM node.exe`, remove `.prisma` inside node_modules, then run `npx prisma generate`. |
| **Groq API** | `401 Unauthorized` or invalid key error. | Key is formatted incorrectly or missing from `.env`. | Verify that the key in `backend/.env` starts with `gsk_`. Do not prefix with `Bearer`. Restart the backend after saving. |
| **Node / npm** | Port `5000` or `5173` is already in use. | Multiple instances of the app are running. | Stop previous instances, or find the port PID with `netstat -ano \| findstr :5000` and end the process. |
| **Frontend** | UI appears unstyled or Tailwind classes are missing. | Tailwind CSS configurations are not loading correctly. | Verify that `frontend/src/main.tsx` imports `./styles/globals.css` and check your post-css configuration. |

---

## 🗺️ Roadmap

### 📦 Completed
- **v1.0.0:** Scaffolding, popstate router, basic tracking checklists.
- **v1.1.0:** Shayla AI mentor setup, 30 German lessons integration.
- **v1.6.0:** AI Brain career context generation, Smart Planner, Placement OS applications tracker.
- **v1.6.1:** Learning OS pathways addition, Analytics 2.0 charts integration.
- **v1.6.3:** PWA deployment configs, JSON backup integration, performance mode toggles.
- **v1.7.0:** User accounts integration, cloud sync capabilities, password hashing.
- **v1.7.1:** Google Sign-In integration using Authorization Code Flow.
- **v1.7.2:** Full PostgreSQL disconnect stability fallbacks.

### ⏳ In Progress
- **Desktop Application:** Wrapping the React dashboard inside an Electron shell.
- **Calendar Synchronization:** Integrating your tasks with external calendar tools (Google Calendar, Outlook).

### 📋 Planned
- **Automated Webhooks:** Direct parsing of SkillRack solutions and LeetCode solved problems.
- **Collaboration Mode:** Custom sharing filters allowing recruiters to view your placements progress.

---

## 📷 Screenshots

*We will update this section with screenshots once they are ready. Click the sections below to see mock layouts:*

<details>
<summary>💻 Dashboard UI Mockup</summary>

```
┌──────────────────────────────────────────────────────────┐
│  [Streak: 5🔥]  [XP: 2,400💎]               [Settings⚙️]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌───────────────────────┐   ┌────────────────────────┐  │
│  │   Smart Planner       │   │    Shayla Mentor       │  │
│  │   Mode: Normal        │   │    "How is your DSA    │  │
│  │   - Solve 2 LeetCode  │   │     prep going?"       │  │
│  │   - German Lesson 4   │   │                        │  │
│  └───────────────────────┘   └────────────────────────┘  │
│                                                          │
│  ┌───────────────────────┐   ┌────────────────────────┐  │
│  │   Placement Readiness │   │    Analytics 2.0       │  │
│  │   Score: 84%          │   │    Weekly Hours: 14.5  │  │
│  │   Resume: Audited     │   │    [░░░░░░░░░░░░░]     │  │
│  └───────────────────────┘   └────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```
</details>

<details>
<summary>📖 German Academy Lesson Drawer Mockup</summary>

```
┌──────────────────────────────────────────────────────────┐
│ German Academy 🇩🇪 > Lesson 4: Everyday Grammar           │
├──────────────────────────────────────────────────────────┤
│ [Vocabulary]    [Grammar Rules]     [Ask Shayla]         │
│                                                          │
│ - word: Hallo    - Conjugations:     Ask Mentor:         │
│   mean: Hello      ich bin           "Explain Dative     │
│                    du bist           case usage..."      │
│                                                          │
│ ──────────────────────────────────────────────────────── │
│ [ Mini Quiz ]                                            │
│ Q: Translate "You are":                                  │
│ ( ) ich bin   (x) du bist   ( ) er ist                   │
│                                                          │
│                                      [Complete Lesson✔️]  │
└──────────────────────────────────────────────────────────┘
```
</details>

---

## 🤝 Contributing

Contributions to SanzzOS are welcome! Please follow these guidelines:

1. **Fork the Repository** on GitHub.
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/NewFeature
   ```
3. **Write and Test Your Code:** Ensure there are no compilation errors:
   ```bash
   npm run check:all
   ```
4. **Commit Your Changes:**
   ```bash
   git commit -m "Add NewFeature"
   ```
5. **Push to Your Fork:**
   ```bash
   git push origin feature/NewFeature
   ```
6. **Open a Pull Request (PR)** detailing your changes.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](file:///c:/SanzzGen/Projects/Career_OS-main/Career_OS-main/LICENSE) file for details.

---

## 👥 Credits

- **Sanju (Sanjay190806):** Project Concept, Lead Architect, and Developer.
- **Open Source Communities:** Special thanks to the developers of React, Express, Prisma, Zustand, Tailwind CSS, Docker, and the Groq API for their frameworks and support.

---

<p align="center">
  Made with ❤️ by Sanju
</p>
