# QA & Testing Strategy — Sanju Career OS v1.6.4

This document defines the quality assurance strategy for Sanju Career OS. Since the project is a local-first single-user app without a dedicated test framework installed, the strategy combines **automated compile-time gates** with **structured manual regression checklists**.

---

## 1. Automated Gates (CI-Safe)

These run without a browser or database — they only need Node.js.

### 1.1 TypeScript Compile Check

```powershell
npm run lint --workspace=frontend
# Expected: zero errors, zero warnings
# Config: tsconfig.json strict: true, noUnusedLocals: true, noUnusedParameters: true
```

**What it catches:**
- Type errors across all 39 pages, 25 services, 29 utilities
- Unused imports and dead variables (compile fails on these)
- Missing exports, interface mismatches, null safety violations

**Status (v1.6.4):** ✅ PASS — 0 errors

### 1.2 Production Build

```powershell
npm run build:frontend
# Expected: all chunks emitted, "built in X.XXs" with no errors
```

**What it catches:**
- Tree-shaking failures
- Dynamic import resolution errors
- Missing asset references

**Status (v1.6.4):** ✅ PASS — 32 chunks built in 4.87s

### 1.3 Backend TypeScript Compile

```powershell
npm run build:backend
# Expected: backend/build/ populated, exit code 0
```

**Status (v1.6.4):** Run and verify on each release.

---

## 2. Manual Route Regression Checklist

Run this checklist after every significant feature addition or before a release. Navigate to each section via the Sidebar and verify the page renders without a blank screen or console error.

### 2.1 Public Routes (No AppShell)

| Route | Expected | Check |
|---|---|---|
| `/` or `/landing` | Landing page loads, no sidebar | ☐ |
| `/portfolio` | Portfolio page loads, no sidebar | ☐ |
| `/offline` | Offline page loads, no sidebar | ☐ |

### 2.2 Dashboard

| Section | Expected | Check |
|---|---|---|
| Overview | Dashboard widgets render, XP bar visible | ☐ |
| Today | Today's tasks, streak strip, daily log visible | ☐ |

### 2.3 AI Systems

| Section | Expected | Check |
|---|---|---|
| AI Brain | Career context summary renders | ☐ |
| Shayla AI | Chat interface loads | ☐ |
| AI Settings | Model settings panel visible | ☐ |
| Shayla Memory | Memory toggle renders | ☐ |
| AI Playground | Prompt test area loads | ☐ |
| AI Benchmark | Benchmark runner loads | ☐ |

### 2.4 Planning & OS

| Section | Expected | Check |
|---|---|---|
| Smart Planner | Planner modes visible, task list renders | ☐ |
| Placement OS | Company list and readiness score render | ☐ |
| Learning OS | Learning paths list renders | ☐ |

### 2.5 Analytics & Reports

| Section | Expected | Check |
|---|---|---|
| Analytics 2.0 | Charts render, burnout signal visible | ☐ |
| Reports | Report cards visible | ☐ |

### 2.6 Skill Building

| Section | Expected | Check |
|---|---|---|
| DSA Tracker | Problem list renders | ☐ |
| SkillRack | SkillRack table visible | ☐ |
| Aptitude | Aptitude checklist renders | ☐ |
| SQL | SQL topic list renders | ☐ |
| CS Core | CS Core subjects render | ☐ |
| Skill Tree | Skill tree nodes render | ☐ |
| Coding Mentor | Mentor panel loads | ☐ |

### 2.7 Learning

| Section | Expected | Check |
|---|---|---|
| German Academy | Lesson list visible, Lesson 1 unlocked | ☐ |
| Roadmap | Roadmap days/phases render | ☐ |

### 2.8 Placement & Applications

| Section | Expected | Check |
|---|---|---|
| Companies | Company cards render | ☐ |
| Applications | Applications board renders | ☐ |
| Placement Calendar | Calendar view renders | ☐ |
| Calendar | Focus calendar loads | ☐ |
| Interview Coach | Interview session interface loads | ☐ |

### 2.9 Career Management

| Section | Expected | Check |
|---|---|---|
| Career Intelligence | Career signals render | ☐ |
| Resume | Resume editor renders | ☐ |
| Projects | Project cards render | ☐ |

### 2.10 Gamification & History

| Section | Expected | Check |
|---|---|---|
| Achievements | Achievement grid renders, unlock statuses visible | ☐ |
| History | Daily log history renders | ☐ |

### 2.11 App Management

| Section | Expected | Check |
|---|---|---|
| Integrations | Integration list renders | ☐ |
| Settings | All panels render, backend health test works | ☐ |
| Admin | Admin panel renders | ☐ |

---

## 3. AI Command Smoke Tests

Open the AI command input (Today page or global command bar) and test these command types:

| Command Example | Expected Behavior |
|---|---|
| "generate today's plan" | Smart Planner populates with tasks |
| "show placement readiness" | Placement OS readiness score shown |
| "show analytics" | Analytics summary displayed |
| "show learning OS" | Learning OS paths shown |
| "set focus mode deep" | Focus mode activates |
| "export backup" | JSON download triggered |
| "show sync status" | Sync mode and last-sync time displayed |
| "show storage health" | Storage health summary shown |

---

## 4. localStorage Data Integrity Checks

Open browser DevTools → Application → Local Storage → `http://localhost:5173` and verify:

| Key | Should Exist | Expected Type |
|---|---|---|
| `sanju-career-os-v1` | ✅ | Valid JSON object with `careerData` |
| `sanzz_os_ai_brain_v1` | ✅ after first load | Valid JSON |
| `sanzz_os_achievements_v1` | ✅ | Array of achievement states |
| `sanzz_os_smart_planner_v1` | ✅ | JSON with planner tasks |
| `sanzz_os_sync_mode_v1` | ✅ | `"local-only"` or `"cloud"` |

**Data corruption test:**
1. Go to Settings → Danger Zone → Reset Individual Store
2. Choose a store (e.g., Smart Planner)
3. Verify the store resets to defaults and the page still loads normally

---

## 5. PWA Offline Test

1. Start the app, navigate to Overview.
2. Open Chrome DevTools → Network → switch to **Offline** mode.
3. Refresh the page.
4. **Expected**: `/offline` fallback page appears OR the cached shell loads.
5. Restore network → verify app recovers and loads normally.

---

## 6. Backup & Restore Round-Trip Test

1. Go to **Settings → Backup & Restore**.
2. Click **Export Backup** — a JSON file should download.
3. Open the JSON and verify it contains the expected `careerData` structure.
4. In Settings, use **Restore** to re-import the same file.
5. Verify all data remains intact after restore.

---

## 7. Backend Health Check (When Backend Is Running)

```powershell
# Health endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/health | Select-Object -ExpandProperty Content

# AI status endpoint
Invoke-WebRequest -Uri http://localhost:5000/api/ai/status | Select-Object -ExpandProperty Content
```

Expected: `{ "api": { "status": "ok" }, "database": { "status": "connected" }, "groq": { "status": "connected" } }`

---

## 8. Known Limitations

| Limitation | Reason | Mitigation |
|---|---|---|
| No automated E2E test suite | No Playwright/Cypress configured | Manual route regression checklist above |
| No unit test suite | No Vitest/Jest configured | TypeScript strict mode catches most logic errors |
| No CI pipeline | No GitHub Actions configured | Run `npm run lint` + `npm run build:frontend` manually before each release |
| `PlacementCalendarPage` bundle is 221 KB | Large date calculation library | Acceptable — lazy loaded, gzip reduces to 25.6 KB |
| `useCareerStore.ts` is ~40 KB | Monolithic store (legacy) | No split planned — stable and functional |

---

## 9. Release Gate Summary

Before tagging a release, all of these must pass:

| Gate | Command | Required |
|---|---|---|
| TypeScript compile | `npm run lint --workspace=frontend` | ✅ MUST PASS |
| Frontend build | `npm run build:frontend` | ✅ MUST PASS |
| Backend build | `npm run build:backend` | ✅ MUST PASS |
| Public routes smoke test | Manual | ✅ MUST PASS |
| Dashboard smoke test | Manual | ✅ MUST PASS |
| Settings health check | In-app | ✅ MUST PASS |
| No `gsk_` keys in tracked source | `git grep gsk_` | ✅ MUST PASS |
| `backend/.env` not committed | `git ls-files backend/.env` | ✅ MUST BE EMPTY |
