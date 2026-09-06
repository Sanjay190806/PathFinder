# Changelog

All notable changes to this project will be documented in this file.

## v1.7.2 - Stable Base Release

### Fixed
- Prisma environment loading consistency by routing root Prisma scripts through `backend/`.
- Windows Prisma generate recovery guidance with `npm run prisma:generate:safe`.
- PostgreSQL diagnostics now return safe host/user/database metadata without exposing passwords.
- Auth endpoints return safe 503 database errors instead of crashing when PostgreSQL is unavailable.
- Cloud sync endpoints return safe database-unavailable responses.
- Version mismatch across root, backend, frontend, and backup metadata.
- Backend health diagnostics now classify common PostgreSQL setup failures.

## v1.7.1 - Auth Stability + Google Sign-In

### Added
- Google Sign-In OAuth 2.0 integration with Authorization Code Flow
- Backend port conflict error handling with clear diagnostic messages
- Frontend backend health check on login/signup pages
- Google Sign-In button on login and signup pages with Google branding
- Provider field in User model (email/google) and providerId for Google users
- Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)
- Backend Google auth routes (/api/auth/google, /api/auth/google/callback)
- Google auth service with secure token exchange and ID verification
- Auth callback page for handling OAuth redirects with error handling
- Provider badge in Account Settings panel showing auth method
- Last login timestamp display in settings panel
- Google OAuth setup documentation (docs/GOOGLE_AUTH.md)
- Improved error messages for network failures and HTTP status codes (401, 403, 404, 500, 503)

### Changed
- Updated auth types to include AuthProvider ('email' | 'google' | null)
- Updated AccountSettingsPanel to show provider and last login info
- Updated launcher script to check if backend is already running before starting
- Updated AUTH.md documentation with Google Sign-In information
- Improved API client error handling with specific messages for different status codes
- Made auth.service.ts publicUser function compatible with new provider field

### Fixed
- Backend now handles EADDRINUSE port conflicts gracefully with helpful error messages
- Frontend shows backend health status (online/offline) on login/signup pages
- "Failed to fetch" errors now show specific messages about backend reachability
- HTTP status codes now have user-friendly error messages
- Launcher script prevents duplicate backend instances

### Security
- Google OAuth uses Authorization Code Flow (secure, server-side)
- Google secrets never exposed to frontend
- ID tokens verified with Google's tokeninfo endpoint
- Email conflict checking prevents Google users from hijacking email accounts
- Service worker continues to bypass auth/cloud/sync API caching

### Database
- Added `provider` field to User model (default: 'email')
- Added `providerId` field to User model for Google user IDs
- Migration pending: Run `npx prisma migrate dev` when database is available

### Notes
- Prisma client needs regeneration after database is available (file lock prevented generation during development)
- Google Sign-In gracefully degrades if not configured (shows 501 error)
- Email/password and local-only modes continue to work without Google OAuth
- All existing v1.7.0 features remain stable

## v1.7.0 - Career OS Pro: Real Auth + Cloud Sync

### Added
- Real backend signup/login/logout/session restore endpoints.
- Account-owned cloud snapshot APIs, cloud backups, device tracking, and sync status.
- Local-to-cloud migration wizard with explicit upload/pull/local-only choices.
- Auth pages, onboarding flow, account settings, cloud sync settings, device management, cloud backup panel, and dashboard sync widget.
- AI command intents for account, sync, migration, device, backup, and security workflows.

### Changed
- Preserved legacy local/manual DB snapshot mode while adding authenticated `/api/cloud/*` routes.
- Service worker now bypasses auth/cloud/sync APIs and authorized requests.
- Backup registry includes safe account mode/device/onboarding metadata and continues to reject secret-like payloads.

### Security
- Removed fake authenticated frontend state.
- Cloud endpoints scope all data from authenticated user identity.
- Passwords are hashed with `crypto.scrypt`; plaintext passwords are never stored.
- Placeholder-only env examples include `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`, and `VITE_API_BASE_URL`.

## v1.6.4 - Stability: Sync, Backup, PWA, Build

### Fixed
- Aligned frontend cloud sync adapter with backend routes (`/api/sync/health`, `/push`, `/pull`).
- Unified dual sync services under `syncCoreService` with compatibility wrapper in `services/syncService.ts`.
- Expanded backup export to 30 known localStorage keys via `backupRegistry.ts`.
- Safe restore: validation summary, pre-restore snapshot, secret rejection, schema checks.
- Mounted `PWAInstallPrompt` and `PWAUpdatePrompt` in `App.tsx`.
- Removed duplicate `manifest.json`; canonical manifest is `manifest.webmanifest`.
- Added PNG PWA icons and improved service worker shell caching.
- Added root `npm run build`, `check:all`, and frontend lightweight tests.

### Changed
- Sync UI now honestly labels local-first storage and manual DB snapshots.
- Settings distinguishes legacy career snapshot vs full backup panel.

### Security
- No tracked secrets; backup restore rejects secret-like payloads.

## v1.6.4 - Final Stabilization, Documentation & Production Release

### Changed
- Bumped version to `1.6.4` across root, `frontend/`, and `backend/` package manifests (backend was lagging at `1.6.1`).
- Expanded `routeConfig.ts` from 15 routes to 41 — now fully synchronized with all section IDs in `AppRouter.tsx`, grouped by feature domain with inline comments.

### Added
- `docs/SETUP.md` — comprehensive first-time setup guide covering prerequisites, environment configuration, Prisma workflow, and troubleshooting.
- `docs/FEATURES.md` — complete feature reference listing all 30+ modules, AI commands, localStorage keys, and PWA capabilities.
- `docs/ARCHITECTURE.md` — expanded from a 676-byte stub to a full architecture document covering the frontend/backend split, persistence model, AI proxy pattern, sync layer, PWA strategy, and data flow.
- `docs/DEPLOYMENT.md` — expanded from a 364-byte stub to a full deployment guide covering local dev, Docker production compose, environment variable checklist, health checks, and rollback procedure.
- `docs/TESTING.md` — expanded from a 895-byte stub to a full QA testing strategy covering TypeScript compile gates, manual route regression checklist, AI command smoke tests, localStorage integrity checks, PWA offline tests, and backup/restore round-trip verification.
- `docs/AUDIT_REPORT.md` — replaced v1.0.0 report with the full v1.6.4 audit report (TypeScript pass, build pass, security scan, route coverage, 20-key localStorage inventory, notable findings, and sign-off).

### Fixed
- Removed `frontend/public/stress_seed.json` (178 KB dev fixture) from the production build output path — it was being served publicly in every deployment.
- Added `**/stress_seed.json` to `.gitignore` to prevent future re-addition; also untracked `docs/stress_seed.json` from git.

### Security
- Confirmed `backend/.env` (containing Groq API key) is not git-tracked. Key is correctly loaded from environment at runtime.
- Confirmed zero hardcoded API keys in any tracked frontend or backend source file.
- Confirmed `XSS` sanitization via `securityUtils.ts` is in place for all Markdown rendering paths.

### Quality
- TypeScript compile: **PASS** (0 errors, `tsc --noEmit`).
- Production build: **PASS** (32 lazy chunks emitted, 4.87s build time, `vite build`).
- Zero TODO/FIXME annotations remaining in `utils/` or `services/`.

---

## v1.6.3 - Cloud Sync + PWA + Performance

### Added
- Local and Cloud Sync adapters coordination for multi-device profile loads.
- Offline-first operations transaction queue caching study progress locally.
- Backup JSON import/export panel in settings with schema structure verification checks.
- PWA Web App manifest and service worker asset-caching filters.
- Fallback OfflinePage viewport intercepting network connection losses.
- Centralized localStorage safe JSON parsing to protect client data integrity.
- Lightweight rendering presets to disable floating background particle canvas effects on demand.
- extended AI command parse triggers for sync updates, backup downloads, and cache clears.

## v1.6.2.2 - Adaptive UI + Personalization Engine + Achievement Expansion
### Added
- Personalization panel in Settings allowing users to customize target careers (SWE/Analyst focus paths), energy status, and layout density thresholds.
- Dynamic layout engines responding to screen width breakpoints and setting compact padded borders reactively.
- Gamified progression board featuring 120 detailed DSA, SQL, German, and project quest achievements.
- Custom achievement evaluations checking problem logs on dashboard load, throwing unlock alert modal popups.
- Floating XP-gain toast alerts confirming credited achievements and logs.
- Speech Practice typing fallback inputs and diagnostics panel when microphone capture fails.
- Stoppers batch script `Stop-Sanzz-OS.bat` at the repository root folder.

### Fixed
- Fixed TypeScript warnings and unused icon imports across React component viewports.
- Restored valid JSON format inside root and frontend package manifests.

## v1.6.1 - Learning OS + Analytics 2.0
### Added
- Learning OS workspace with 14 default career learning paths, skill mastery tracking, session logging, weak areas, milestones, resources, and revision queue.
- Versioned Learning OS persistence under `sanzz_os_learning_os_v1`, `sanzz_os_learning_sessions_v1`, and `sanzz_os_revision_items_v1`.
- Analytics 2.0 dashboard with study hours, XP, completion trends, skill/category breakdowns, readiness, burnout, focus balance, and insights.
- Dashboard widgets for Learning OS, due revision, weekly learning hours, weak skills, and Analytics 2.0 insights.
- Smart Planner integration with Learning OS mastery and revision backlog signals.
- AI Brain learning intelligence for weakest learning path, revision backlog, and learning-aware next actions.
- AI command support for learning sessions, due revision, weak skills, learning plans, and analytics.
- Safe backend fallback endpoints for Learning OS and Analytics 2.0.

### Fixed
- Verified v1.6.0 AI Brain, Smart Planner, Placement OS, dashboard widget, command, route, and build stability before extending.

### Security
- Verified no secrets in new files.
- Environment examples remain placeholder-only and `.env` files remain ignored.

## v1.6.0 - AI Brain + Smart Planner + Placement OS
### Added
- AI Brain career context engine with typed profile, skill insight, risk, recommendation, and readiness models.
- Smart Daily Planner with planner modes, generated tasks, XP rewards, completion tracking, and localStorage persistence.
- Placement OS workspace with default company database, application status board, interview/OA placeholders, resume checklist, and readiness scoring.
- Dashboard intelligence widgets for AI Brain, today's Smart Plan, Placement OS, priority company, and next action.
- AI command intents for planner generation, smart task completion, AI Brain refresh, placement readiness, company status, interview rounds, OA results, and next action recommendations.
- Safe backend fallback endpoints for AI Brain, Smart Planner, and Placement OS under `/api`.

### Fixed
- Verified v1.5 stability items: German lesson data exists, `/roadmap` is routed, default Sanju Career OS project exists, current frontend/backend builds pass, and new TypeScript additions compile.
- Aligned frontend `.env.example` API base URL with the existing API client default.

### Security
- Verified tracked environment examples use placeholder-only values.
- Added no hardcoded real API keys or secrets.

## v1.4.1 - Stabilization & UX Audit Release

### Added
- Global Shortcut Hook (`useGlobalShortcuts.ts`) and navigation helper modal (e.g., `g` then `d` for Dashboard).
- Global Toast notification store and frontend overlay for system error/success reporting.
- System Health Maintenance dashboard settings controls for inspecting state details.
- React Suspense lazy loading boundaries for heavy path imports.

### Changed
- Rebuilt popstate router enabling public landing pages (`/`, `/landing`, `/portfolio`) to bypass primary AppShell rendering logic.
- Redesigned cinematic landing page layout featuring modules showcases, tech stack grids, and recruitment calls to action.
- Replaced floating canvas background with an elegant static HSL dark gradient and grid alignment system.
- Shayla AI Chat styling to stabilize viewport scrolling heights, rendering model latency benchmarks, and active tokens.

### Fixed
- Input XSS injection vulnerabilities by enforcing sanitizers across all dynamic markdown output terminals.
- Collapsible Daily Briefing summaries height overlaps.
- German academy checklist drawers, mock interview telemetry widgets, and status calendars.

## v1.1 - AI Integration & German Academy Launch

### Added
- German Academy module loaded with 30 structured lessons, quizzes, vocabulary indices, notes, and Shayla support.
- Unified AI Mentor (Shayla AI) across 8 workspaces.
- Stable Groq API server-side reverse-proxy streaming tokens back to the webapp.

### Changed
- Refined career roadmap dataset filtering algorithms referencing 180 distinct preparation steps.
- Cleaned data layout interfaces for DSA patterns and SkillRack trackers.

### Fixed
- Settings check sync errors and prototype contamination false-positive checks.

## [1.0.0] - 2026-06-28
### Added
- Complete React + TypeScript frontend application with modular component viewports.
- Express API server featuring secure reverse-proxy Groq connections.
- Local-first Zustand state management tracking user profile daily logs.
- PostgreSQL database backup integrations using Prisma ORM schemas.
- Streaming AI Mentor completions using SSE flusher token decoders.
- Extended SQL, Aptitude, CS Core checklists, SkillRack, and DSA Pattern mastery pages.
