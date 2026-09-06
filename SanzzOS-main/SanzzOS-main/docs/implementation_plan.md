# Implementation Plan — Phase 1: Project Scaffold & Initial Configuration

This plan outlines the steps to perform Phase 1 of migrating the monolithic `Sanju_Career_OS.html` into a full-stack production application.

## User Review Required

> [!IMPORTANT]
> **Prisma PostgreSQL Connection Strategy:**
> The backend will connect to a PostgreSQL database. For local development, we provide a `docker-compose.yml` file configuring a local postgres service. The database credentials in the configuration files match this default Docker layout.
> Please ensure you have Docker Desktop or a local PostgreSQL server running before starting the backend in development.
>
> **Zustand Persistence Strategy:**
> To support local-first data usage when the backend is disconnected, our Zustand stores on the frontend will employ a localStorage/localForage persistence middleware. They will sync to the database when the backend is active.

---

## Open Questions

> [!NOTE]
> 1. Do you want to configure database migrations to run automatically on backend server startup, or should they be run manually via `npx prisma migrate dev`? (Proposed: manual/script-based for cleaner error logs in development).
> 2. For the frontend design layout, should we keep standard Tailwind configuration defaults or install custom Shadcn UI utilities during the initial scaffold? (Proposed: standard utility styles with customized css variables to preserve the premium glassmorphism theme).

---

## Proposed Changes

### Component 1 — Root Configurations

#### [NEW] [package.json](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/package.json)
Workspace configuration definitions:
```json
{
  "name": "sanju-career-os",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "frontend",
    "backend"
  ],
  "scripts": {
    "install:all": "npm install",
    "dev:frontend": "npm run dev --workspace=frontend",
    "dev:backend": "npm run dev --workspace=backend",
    "dev:all": "npm run dev --workspaces"
  }
}
```

#### [NEW] [.gitignore](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/.gitignore)
Standard rule ignore files for node_modules, build packages, and environment settings.

#### [NEW] [docker-compose.yml](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/docker-compose.yml)
PostgreSQL Docker service configuration setup.

#### [NEW] [.env.example](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/.env.example)
Database connections and Groq key templates.

---

### Component 2 — Frontend Shell

#### [NEW] [vite.config.ts](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/frontend/vite.config.ts)
Configuration for React, TS, Tailwind, and path aliases.

#### [NEW] [tsconfig.json](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/frontend/tsconfig.json)
Compiler parameters for browser-based TypeScript targets.

#### [NEW] [roadmap.ts](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/frontend/src/data/roadmap.ts)
Extracted chronological 180-day problem roadmap dataset.

---

### Component 3 — Backend Shell

#### [NEW] [schema.prisma](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/backend/prisma/schema.prisma)
PostgreSQL schema mapping daily logs, roadmap logs, achievements, user configurations, and focus sessions.

#### [NEW] [health.routes.ts](file:///c:/SanzzGen/Projects/SanzzTracker/Sanju-Career-OS/backend/src/routes/health.routes.ts)
Basic ping check endpoint mapping database connectivity.

---

## Verification Plan

### Automated Tests
- Running `tsc --noEmit` checks inside frontend and backend directories.
- Confirming Prisma schema compiling validation using `npx prisma validate`.
- Executing Python check scripts verifying that all 180 roadmap keys are written without data loss.

### Manual Verification
- Verify the workspace packages install successfully.
- Verify `docker-compose up -d` starts PostgreSQL on port 5432.
