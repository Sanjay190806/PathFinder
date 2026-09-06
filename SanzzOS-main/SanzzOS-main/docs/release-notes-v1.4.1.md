# Sanju Career OS - Release Notes (v1.4.1)

## Overview
Sanju Career OS v1.4.1 focuses on **Stability, Refined Layouts, Custom State Routing, Security Hardening, State Versioning, and Performance Enhancements**. This release prepares the application for production reliability by auditing potential points of failure and streamlining the user interface.

## Key Changes & Enhancements

### 1. Unified Custom State Routing (Phase 1)
- Structured a clean popstate listener in `AppRouter.tsx` that coordinates with Zustand state updates.
- Separated public routes (`/`, `/landing`, `/portfolio`) from private routes (AppShell sections).
- Linked all navigation buttons with SPA-native helper triggers to prevent complete window reloads.

### 2. Premium Background & Aura Removal (Phase 2)
- Replaced custom pointer-tracker mouse ring aura inside `CursorAura.tsx` with a null component to conserve CPU cycles.
- Upgraded the childish canvas animation inside `NeonAtmosphere.tsx` with a static, gorgeous, dark theme CSS gradient and overlay grid.

### 3. Cinematic Landing Page Redesign (Phase 3)
- Overwrote `LandingPage.tsx` with a recruiter-ready landing page containing high-impact sections: Hero, Badge, Problem grid, Solution grid, Platform Module highlights, Shayla AI details, Tech Stack overview, and Portfolio CTA.
- Stripped all sidebars and private logs from the landing page.

### 4. Shayla AI Chat Interface Stabilization (Phase 4)
- Fixed vertical collapse bugs in `ShaylaAIPage.tsx` by setting explicit minimum heights and overflow bounds on the flex container layout.
- Renders assistant placeholder indicator immediately when streaming, showing typing animation.
- Restyled error/failed messages with visible red bounds and retry controls.

### 5. Production Dev Tools Guards (Phase 5)
- Hidden all developer testing tools, debug buttons, and log actions inside a strict `import.meta.env.DEV` check block.
- Audited the codebase to ensure no production leakage of local keys.

### 6. XSS Hardening & Safe Markdown Parser (Phase 6)
- Implemented robust `safeString`, `safeUrl`, and `escapeHTML` methods inside `securityUtils.ts`.
- Restructured `renderSafeMarkdown` to prevent undefined object property crashes.

### 7. Global Toast Notification System (Phase 7)
- Created a global zustand-powered `useToastStore.ts` with supporting Toast provider components.

### 8. Local State Schema Versioning & Migrations (Phase 8)
- Configured versioning schema `141` across persisted stores.
- Created `stateMigrationUtils.ts` and `migrations.ts` to execute schema fallback corrections.
- Added a "System Health & State Migrations" maintenance panel in the Settings page.

### 9. Lazy Loading Dynamic Imports (Phase 9)
- Configured React Suspense and lazy imports for heavy workspace pages.
- Created a custom loading fallback indicator.

### 10. AI Model Metadata Indicators (Phase 10)
- Embedded metadata indicators under the Shayla topbar showing context tokens, latency, cost model, and temperature.

### 11. Keyboard Shortcuts Help Interface (Phase 11)
- Implemented a custom hook `useGlobalShortcuts.ts` for quick-key routing navigation.
- Created an accessible global modal dialog.

### 12. Workspace UX Refinements (Phase 12)
- Optional tracking: German counter grouped under expandable container card.
- Mock interviews: Compact 4-column chip-counter slots with reduced height.
- Collapsible briefing logs: chevron header toggles to save vertical scrolling space.
- Placement Calendar: Day status legend and "Go to Today" shortcut button.
- Calendar details: Grouped tasks inside drawer by prep topic headers.
- Sidebar links: Organized into Core, Prep, Assets, and collapsible AI tools groups.
