# Engineering Audit — Sanju_Career_OS.html

This audit analyzes the current monolithic structure of `Sanju_Career_OS.html` and maps out state fields, storage structures, security risks, and architectural requirements for a robust React/Express/PostgreSQL full-stack migration.

---

## 1. Existing Application Sections
The monolithic application defines 14 specific sections that map directly to the side navigation tabs:
1. **Overview** (`overview`): Welcome, placement readiness and consistency scores, stats cards, weekly trend, Shayla's advice card, GitHub-style activity heatmap, and journey milestones.
2. **Today's Mission** (`today`): Week day chip selector strip, LeetCode daily problems checklists, Pomodoro timer widget, mood & energy sliders, distraction counter, daily reflection textarea, and 9 daily activity tracker cards.
3. **Roadmap** (`roadmap`): 180-day chronological list grouped by topic/difficulty/pattern with search queries and category filters.
4. **DSA Tracker** (`dsa_tracker`): Tabular database list of all 360 problems showing topic, pattern, difficulty, confidence score, and solve status. Clicking a problem opens a detail drawer.
5. **SkillRack** (`skillrack`): Target controllers, 14-day history trend chart, best score highlights.
6. **Aptitude** (`aptitude`): Daily target question logs, topic breakdowns (Quantitative, Logical, Verbal).
7. **SQL** (`sql`): Target query logs, topic progress bars (bascis, joins, aggregations, windows functions, subqueries).
8. **CS Core** (`cscore`): Checklist sections for DBMS, Operating Systems, and Computer Networks.
9. **Projects** (`projects`): Workspace profiles for *CareSync AI*, *SmartEdu AI*, and custom projects with progress bars across 6 dimensions, stack tags, and links.
10. **Resume** (`resume`): ATS readiness score calculation wheel, resume content checklists, progress sliders.
11. **Applications** (`applications`): Job application board with Kanban column view (Wishlist, Applied, OA, Interview, HR, Offer, Rejected, Ghosted) and list tables.
12. **Calendar & Focus** (`calendar`): Monthly tracker cell calendar, adjustable Pomodoro study timer with session history.
13. **Achievements** (`achievements`): Rank progress bars, badge cabinet showing lock/unlock badges, and XP metrics.
14. **History** (`history`): Scrollable feed of previous day reflection notes and metrics.
15. **Settings** (`settings`): Name input, Groq key input, start date, factory reset, import/export buttons.

---

## 2. In-Memory State & Schema
The current local JavaScript `state` object contains:
- `app_version`: String (`'1.0.0'`)
- `user_profile`: `{ name: string, groqKey: string, startDate: string, totalDays: number }`
- `settings`: `{ sidebarCollapsed: boolean, theme: string }`
- `daily_logs`: `{ [day: string]: { counts: { leetcode: number, skillrack: number, aptitude: number, sql: number, cscore: number, german: number, project: number, resume: number }, lcStatus: number[], note: string, mood: number, energy: number, distractions: number, focusMinutes: number, status: string, savedAt: string, xpEarned: number } }`
- `problem_logs`: `{ [problemKey: string]: { solved: boolean, confidence: number, solveTime: number, attempts: number, notes: string, mistakeLog: string, revisitFlag: boolean } }` (Problem keys match `d_[dayNumber]_[problemIndex]`)
- `projects`: `{ [projKey: string]: { name: string, status: string, stack: string[], github: string, demo: string, progress: { backend: number, frontend: number, ai: number, testing: number, docs: number, deploy: number }, bullets: string[], description: string } }`
- `resume`: `{ version: string, atsScore: number, lastUpdated: string | null, targetRole: string, sections: { contact: number, education: number, skills: number, projects: number, achievements: number, formatting: number } }`
- `applications`: Array of `{ id: string, company: string, role: string, date: string, status: string, salary: string }`
- `achievements`: `{ xp: number, level: number, badges: string[], unlockedAt: { [badgeId: string]: string } }`
- `ai_history`: Array of `{ role: 'user' | 'assistant', content: string }`
- `analytics_cache`: `{ lastComputed: string | null, streak: number, longestStreak: number, placementScore: number, consistencyScore: number }`

---

## 3. Storage Keys & Migration
- **Keys**: Primary key: `sanju-career-os-v1`, secondary check key: `sanju-placement-v3`
- **Migration Logic**: `migrateOldData()` checks for existence of `sanju-placement-v3` data, maps the old counts structure to the new layout (e.g. mapping counts and setting default parameters for mood/energy/distractions), merges key properties, saves the updated layout back as `sanju-career-os-v1`, and deletes the older key.

---

## 4. Groq Integration & Prompts
- **Chat service**: Calls `https://api.groq.com/openai/v1/chat/completions` directly from the client.
- **Model**: `llama-3.3-70b-versatile`
- **System Prompt Builder**: `getShaylaSystemPrompt()` compiles today's day number, current streak, solved DSA topics, recent log statistics, German vocabulary targets, energy level, and daily reflections.
- **German learning banner**: Displays randomized phrases from `GERMAN_LESSONS` (e.g. *"Viel Erfolg!"*, *"Du schaffst das!"*).

---

## 5. Architectural Problems & Security Risks

### 🔴 Critical Security Vulnerabilities
1. **Frontend API Key Leakage**: Direct fetch calls require storing the `GROQ_API_KEY` in browser `localStorage`. Anyone with access to the console can extract the credential in plain text.
2. **XSS via Chat / Reflection Rendering**:
   - `appendShaylaMsg` uses a custom markdown parser that replaces characters, but renders directly as HTML.
   - Project bullets, daily notes, and Kanban cards are written dynamically to elements without comprehensive encoding/sanitization wrappers, opening paths for malicious DOM insertions.

### 🟠 Maintainability & Performance Gaps
1. **Monolithic state mutations**: The entire state is stored in a single object. React component split-ups require scoped state actions (e.g., Zustand slices or stores).
2. **In-Memory calculation overhead**: Scores (Consistency, Placement Score, Streak metrics) are recalculated on-the-fly during UI renders. A backend model with cached cache tables or indexed columns will resolve this.
3. **No Database validation**: The backup import takes any JSON blob and merges it into the state without structural field validation.

---

## 6. Verification & Syntax Inspection
- **spread operator check**: Verified that the spread operator is correctly implemented on line 4051 as `...recentMessages` in `Sanju_Career_OS.html`. No syntax errors exist in the source file related to this.
