# Architecture — Sanju Career OS v1.6.4

## Overview

Sanju Career OS is a **local-first, offline-capable** full-stack career tracking application. The architecture follows a **client-first progressive enhancement** model: all core functionality works entirely in the browser using localStorage, with optional cloud sync and backend AI proxy when the server is available.

---

## High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User's Browser                               │
│                                                                     │
│  ┌───────────────────┐    ┌────────────────────────────────────┐   │
│  │   React 18 + Vite │    │   Zustand Persistence Layer        │   │
│  │   (TypeScript)    │◄──►│   (localStorage, versioned keys)   │   │
│  │                   │    └────────────────────────────────────┘   │
│  │   Lazy-loaded     │    ┌────────────────────────────────────┐   │
│  │   Page Routes     │    │   PWA Service Worker               │   │
│  │   (37 pages)      │    │   (sw.js, cache-first strategy)    │   │
│  └────────┬──────────┘    └────────────────────────────────────┘   │
└───────────┼─────────────────────────────────────────────────────────┘
            │ HTTP / SSE (optional — degrades gracefully)
            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    Express Backend API (Node.js)                   │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐  │
│  │  AI Proxy    │   │  Sync/Backup │   │  Feature Controllers │  │
│  │  /api/ai/*   │   │  /api/sync   │   │  /api/placement/     │  │
│  │  (Groq SSE)  │   │              │   │  /api/learning/      │  │
│  └──────┬───────┘   └──────┬───────┘   │  /api/german/ ...    │  │
└─────────┼──────────────────┼───────────┴──────────────────────────┘
          │                  │
          ▼                  ▼
   ┌─────────────┐   ┌────────────────────┐
   │  Groq API   │   │  PostgreSQL (Docker)│
   │  (Llama-3)  │   │  + Prisma ORM      │
   └─────────────┘   └────────────────────┘
```

---

## Frontend Architecture

### Tech Stack
| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 18.3.1 |
| Language | TypeScript | 5.2.2 |
| Build Tool | Vite | 5.3.1 |
| Styling | Tailwind CSS | 3.4.4 |
| Animation | Framer Motion | 11.2.10 |
| State Management | Zustand | 4.5.4 |
| Charts | Recharts | 2.12.7 |
| Icons | Lucide React | 0.395.0 |

### State Management — Zustand Stores

All state is managed via **23 Zustand stores** in `frontend/src/app/store/`. Each store persists independently to localStorage using versioned keys (`sanzz_os_*_v1`).

The primary store is `useCareerStore.ts` (~40 KB) which tracks the main `CareerState`:
- DSA progress, SkillRack, Aptitude, SQL, CS Core checklists
- Daily logs, projects, resume, German learning
- XP, streaks, roadmap progress

Auxiliary stores handle isolated domains: AI settings, achievements, interviews, resume studio, UI preferences, theme, toast notifications, feedback, integrations, and benchmark results.

### Routing

The app uses a **custom popstate-based router** (`AppRouter.tsx`) — not `react-router-dom`'s `<BrowserRouter>`. This was a deliberate decision to give full control over URL ↔ Zustand section synchronization:

- URL pathname → `activeSection` in `useUIStore` on mount and `popstate`
- `activeSection` changes → `window.history.pushState` to update URL
- All workspace pages are **lazy-loaded** via `React.lazy + Suspense`
- Public pages (`LandingPage`, `PortfolioModePage`) are statically imported for zero-latency

Route-to-section mapping is defined in `frontend/src/utils/navigation.ts`. All route definitions are catalogued in `frontend/src/routes/routeConfig.ts` (41 routes as of v1.6.4).

### Component Structure

```
frontend/src/
├── app/store/          23 Zustand stores
├── components/         36 subdirectories (domain-grouped)
│   ├── layout/         AppShell, Sidebar, Topbar, NeonAtmosphere
│   ├── ui/             28 shared UI primitives
│   ├── sync/           BackupRestorePanel, SyncSettingsPanel
│   └── ...             domain-specific components
├── data/               21 static data files (roadmap, german lessons, companies, etc.)
├── hooks/              14 custom hooks
├── pages/              39 page components (lazy-loaded)
├── pwa/                registerServiceWorker.ts
├── routes/             AppRouter.tsx, routeConfig.ts
├── services/           25 service modules + 3 subdirs (analytics, pwa, sync)
├── styles/             9 CSS files (tokens, globals, animations, etc.)
├── types/              24 TypeScript type definition files
└── utils/              29 utility modules
```

---

## Backend Architecture

### Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js (ESModule) |
| Framework | Express 4.x |
| Language | TypeScript 5.4.x |
| ORM | Prisma 5.x |
| Database | PostgreSQL 15 (Docker) |
| AI Integration | Groq API (Llama-3) |
| Validation | Zod |
| Dev Server | tsx (ts-node watch mode) |

### API Surface (15 route files)

| Route Prefix | Module | Key Endpoints |
|---|---|---|
| `/api/health` | Health | `GET /api/health` — status, DB, Groq, uptime |
| `/api/ai/*` | AI Proxy | `POST /chat`, `POST /test`, `GET /stream`, `GET /status` |
| `/api/sync` | Cloud Sync | `GET /sync?userId`, `POST /sync` |
| `/api/ai-brain` | AI Brain | Context generation |
| `/api/placement` | Placement OS | Company status, readiness |
| `/api/learning` | Learning OS | Sessions, mastery, revision |
| `/api/smart-planner` | Smart Planner | Plan generation |
| `/api/interview` | Interview Coach | Session management |
| `/api/german` | German Academy | Lesson progress |
| `/api/analytics` | Analytics 2.0 | Insights, burnout signals |
| `/api/resume` | Resume Manager | Review, analysis |
| `/api/agent` | Agent API | Agent task orchestration |
| `/api/feedback` | Feedback | In-app feedback submission |
| `/api/integration` | Integrations | Third-party webhooks |

### AI Proxy Pattern

The frontend **never holds** the Groq API key. All AI requests flow through:

```
Frontend → POST /api/ai/chat (body: messages[]) 
         → Backend attaches Authorization: Bearer $GROQ_API_KEY
         → Groq API (SSE stream)
         → Backend pipes SSE chunks → Frontend EventSource
```

This keeps the key server-side while allowing streaming responses to the UI.

---

## Persistence Model

### Local-First Architecture

```
Priority 1 (always): localStorage (Zustand persisted stores)
Priority 2 (when available): Backend PostgreSQL via /api/sync
```

Data is **always readable and writable offline**. The backend is an optional enhancement — if it's down, the app degrades gracefully with local-only mode.

### localStorage Key Inventory (20 keys)

| Key | Purpose |
|---|---|
| `sanju-career-os-v1` | Main `CareerState` (primary data store) |
| `sanzz_os_ai_brain_v1` | AI Brain summaries |
| `sanzz_os_achievements_v1` | Achievement states (120 items) |
| `sanzz_os_analytics_cache_v1` | Analytics 2.0 cache |
| `sanzz_os_learning_os_v1` | Learning OS state |
| `sanzz_os_learning_sessions_v1` | Session logs |
| `sanzz_os_revision_items_v1` | Revision queue |
| `sanzz_os_personalization_v1` | User profile customization |
| `sanzz_os_placement_os_v1` | Placement OS state |
| `sanzz_os_smart_planner_v1` | Daily plan |
| `sanzz_os_xp_events_v1` | XP event log |
| `sanzz_os_sync_queue_v1` | Offline operation queue |
| `sanzz_os_sync_mode_v1` | Sync mode (local-only / cloud) |
| `sanzz_os_last_sync_v1` | Last sync timestamp |
| `sanzz_os_theme_settings_v1` | Theme color/preset |
| `sanzz_os_performance_settings_v1` | Performance mode |
| `sanzz_os_ui_preferences_v1` | UI density preference |
| `sanju-career-os-migrations` | State migration audit log |
| `shayla-memory-enabled` | Shayla memory feature toggle |
| `sanju-placement-v3` | Legacy migration source key |

### State Migration System

`stateMigrationUtils.ts` handles versioned schema evolution. Migrations run at store hydration time, reading from `sanju-career-os-migrations` to track which transforms have already applied. This prevents data loss when the schema evolves across versions.

---

## Cloud Sync Layer (v1.6.3+)

The sync layer in `services/sync/` provides a pluggable adapter pattern:

```
SyncService (mode manager)
  ├── LocalSyncAdapter   → reads/writes versioned localStorage keys
  ├── CloudSyncAdapter   → pushes/pulls snapshots via /api/sync
  ├── SyncQueue          → queues offline operations for replay
  └── ConflictResolver   → timestamp-based last-write-wins
```

The UI exposes sync controls via `SyncSettingsPanel` and backup/restore via `BackupRestorePanel` in Settings.

---

## PWA Strategy

| Component | File | Role |
|---|---|---|
| Web App Manifest | `public/manifest.json` | App name, icons, display mode, shortcuts |
| Service Worker | `public/sw.js` | Cache-first for shell assets, bypass for `/api/*` |
| Registration | `pwa/registerServiceWorker.ts` | Registers SW on app boot |
| Offline Fallback | `public/offline.html` | Shown when network + cache miss |

Cache strategy: **Cache-first** for static shell assets (`/`, `/index.html`, `/manifest.json`, `/offline`). API calls are always network-first with no caching. This gives instant load for the shell with live data from the server.

---

## Security Architecture

| Area | Approach |
|---|---|
| API Key Storage | Server-side only via `backend/.env` |
| Frontend → Backend | No auth tokens exposed in source |
| XSS Prevention | `securityUtils.ts` sanitizes all Markdown before render |
| Prototype Pollution | JSON body scanning in sync endpoints rejects `__proto__`, `constructor` keys |
| CORS | Configured via `CORS_ORIGIN` env var (defaults to `http://localhost:5173`) |
| `.env` protection | `.gitignore` excludes all `.env` files except `.env.example` templates |
