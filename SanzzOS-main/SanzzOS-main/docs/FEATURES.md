# Features Reference — Sanju Career OS v1.6.4

A complete reference of all modules, AI commands, localStorage keys, and capabilities in the app.

---

## Feature Module Overview

| Module | Section ID | Route | Description |
|---|---|---|---|
| Overview Dashboard | `overview` | `/overview` | Daily briefing, widget grid, XP/streak bar |
| Today | `today` | `/today` | Task manager, daily logs, focus timer |
| AI Brain | `ai_brain` | `/ai-brain` | Career context summaries, risk assessment, readiness score |
| Shayla AI | `ai` | `/ai` | AI chat interface with streaming responses |
| AI Settings | `ai_settings` | `/ai-settings` | Model selection, token budget, memory config |
| Shayla Memory | `shayla_memory` | `/shayla-memory` | Toggle and inspect Shayla's memory |
| AI Playground | `ai_playground` | `/ai-playground` | Free-form AI prompt testing |
| AI Benchmark | `ai_benchmark` | `/ai-benchmark` | AI response quality benchmarking |
| Smart Planner | `smart_planner` | `/smart-planner` | Mode-based daily plan generation |
| Placement OS | `placement_os` | `/placement-os` | Company tracker, application board, readiness score |
| Learning OS | `learning_os` | `/learning-os` | Learning paths, mastery, revision queue, milestones |
| Analytics 2.0 | `analytics` | `/analytics` | Study hours, XP, burnout signals, focus balance |
| Reports | `reports` | `/reports` | Progress reports, weekly summaries |
| DSA Tracker | `dsa_tracker` | `/dsa-tracker` | LeetCode / DSA problem tracking |
| SkillRack | `skillrack` | `/skillrack` | SkillRack contest and practice tracking |
| Aptitude | `aptitude` | `/aptitude` | Aptitude topic checklist |
| SQL | `sql` | `/sql` | SQL topic checklist |
| CS Core | `cscore` | `/cs-core` | CS fundamentals checklist |
| Skill Tree | `skill_tree` | `/skill-tree` | Visual skill dependency tree |
| Coding Mentor | `coding_mentor` | `/coding-mentor` | Guided coding practice with AI |
| German Academy | `german` | `/german` | 30-lesson German course with vocabulary, grammar, quizzes |
| Roadmap | `roadmap` | `/roadmap` | 180-day career preparation roadmap |
| Companies | `companies` | `/companies` | Target company database with profiles |
| Applications | `applications` | `/applications` | Job application status board |
| Placement Calendar | `placement_calendar` | `/placement-calendar` | Placement event calendar |
| Calendar | `calendar` | `/calendar` | Focus and study session calendar |
| Interview Coach | `interview_coach` | `/interview-coach` | Mock interview sessions with AI feedback |
| Career Intelligence | `career_intelligence` | `/career-intelligence` | Market signals, opportunity analysis |
| Resume | `resume` | `/resume` | Resume editor and AI-powered review |
| Projects | `projects` | `/projects` | Project portfolio tracker |
| Achievements | `achievements` | `/achievements` | Gamified achievement board (120 items) |
| History | `history` | `/history` | Daily log history and activity timeline |
| Integrations | `integrations` | `/integrations` | Third-party integration management |
| Settings | `settings` | `/settings` | App config, health checks, sync, backup |
| Admin | `admin` | `/admin` | Internal admin controls |
| Portfolio | `portfolio` | `/portfolio` | Public-facing recruiter portfolio page |
| Landing | `landing` | `/` | Public landing page |

---

## AI Command System

The AI command system parses natural language inputs (via the command bar or AI chat) into structured commands. **34 command types** are supported:

### Daily & Planner Commands
| Command | Effect |
|---|---|
| `generate today's plan` | Creates a Smart Planner task list for the current day |
| `complete smart task <id>` | Marks a Smart Planner task as done |
| `set focus mode <mode>` | Switches focus mode (deep, light, sprint, etc.) |
| `set density <compact/comfortable>` | Changes UI density |

### Placement & Companies
| Command | Effect |
|---|---|
| `show placement readiness` | Displays Placement OS readiness score |
| `update company status <company> <status>` | Updates a company's application status |
| `add interview round <company> <round>` | Logs an interview round |
| `add OA result <company> <result>` | Logs an OA outcome |
| `recommend next action` | Shows AI-recommended next placement action |

### Learning OS
| Command | Effect |
|---|---|
| `log learning session <path> <minutes>` | Records a learning session |
| `show learning OS` | Shows Learning OS overview |
| `update skill mastery <skill> <level>` | Updates mastery level |
| `show due revision` | Shows items due for revision |
| `complete revision item <id>` | Marks a revision item as done |
| `show weak skills` | Lists skills with lowest mastery |
| `recommend learning task` | AI suggests next learning task |
| `generate learning plan` | Creates a learning plan |

### Analytics & AI Brain
| Command | Effect |
|---|---|
| `show analytics` | Displays analytics summary |
| `show weekly analytics` | Shows weekly progress charts |
| `refresh AI Brain` | Regenerates AI career context |

### System & Sync Commands
| Command | Effect |
|---|---|
| `show sync status` | Shows sync mode and last sync time |
| `export backup` | Downloads JSON backup file |
| `show storage health` | Reports localStorage usage |
| `clear app cache` | Clears cached data |
| `set performance mode <mode>` | Toggles performance optimizations |
| `claim all achievements` | Evaluates and unlocks earned achievements |

### Progression Commands
| Command | Effect |
|---|---|
| `complete daily task <id>` | Marks a today task as done |
| `update German progress <lesson>` | Logs German lesson completion |
| `add weak word <word>` | Adds a German weak word |
| `add application <company>` | Adds a job application |
| `mark CS core topic <topic>` | Marks a CS topic as done |
| `update project progress <project> <pct>` | Updates project completion % |

---

## AI System Architecture

| Component | Role |
|---|---|
| Shayla AI | Primary chat interface — conversational AI mentor |
| AI Brain | Generates static career context summaries (career stage, risks, recommendations) |
| AI Command System | Parses chat input into structured actions |
| AI Playground | Free-form model testing without context |
| AI Benchmark | Evaluates AI response quality metrics |
| Backend AI Proxy | Routes all Groq API calls server-side |

**Model:** Groq Llama-3 (configured via `GROQ_MODEL` env var)
**Streaming:** Server-Sent Events (SSE) for real-time token delivery

---

## Gamification System

### XP & Progression
- XP is earned for completing tasks, logging learning sessions, passing quizzes, and streaks.
- XP events are stored in `sanzz_os_xp_events_v1`.
- The XP bar is visible in the Topbar and Today page.

### Streak System
- Daily login and task completion maintains a streak counter.
- Streak freeze utilities (`streakFreezeUtils.ts`) allow one-day freeze.

### Achievements (120 items)
Achievements are grouped across:
- DSA problem milestones (LeetCode Easy/Medium/Hard counts)
- SQL, Aptitude, CS Core completion milestones
- German lesson completion milestones
- Learning OS session milestones
- Placement OS milestones (applications submitted, interviews passed)
- Project milestones
- Streak milestones

Achievement evaluation runs at dashboard load via `achievementEngine.ts` and fires XP toast alerts for newly unlocked items.

---

## German Academy

30 structured lessons covering:
- Vocabulary sets with translation and pronunciation
- Grammar rules with examples
- Short stories for comprehension
- Mini quizzes per lesson
- Ask Shayla for lesson-specific AI help
- Notes field per lesson
- XP reward on lesson completion
- Progressive unlock (completing lesson N unlocks N+1)

Data: `data/germanLessons.ts` (16.8 KB), `data/germanVocabulary.ts`, `data/germanGrammar.ts`, `data/germanPhrases.ts`, `data/germanStories.ts`

---

## Cloud Sync & PWA (v1.6.3+)

### Sync Modes
| Mode | Behavior |
|---|---|
| `local-only` | All data in localStorage, no backend sync |
| `cloud` | Periodic push/pull snapshots with `/api/sync` |

### Backup & Restore
- **Export:** Downloads complete `CareerState` as timestamped JSON
- **Import:** Re-imports JSON and merges into localStorage
- Available in **Settings → Backup & Restore**

### PWA Capabilities
| Feature | Status |
|---|---|
| Installable (Add to Home Screen) | ✅ |
| Offline shell loading | ✅ |
| Background sync queue | ✅ |
| Push notifications | ❌ Not implemented |
| Background fetch | ❌ Not implemented |

---

## Settings Panel — Full Reference

| Section | What It Does |
|---|---|
| System Health | Tests backend, Groq, and Shayla connectivity |
| Personalization | Sets career path, energy level, UI density |
| Theme | Selects color preset (neon, aurora, mono, etc.) |
| Performance Mode | Disables heavy animations for low-end devices |
| Sync Settings | Switches sync mode, shows last-sync timestamp |
| Backup & Restore | Export/import full JSON backup |
| State Migration | Runs/reviews store migration history |
| Feature Flags | Toggles experimental features |
| Feedback | In-app feedback submission |
| Danger Zone | Reset individual stores or clear all data |

---

## Data Files Reference

| File | Size | Content |
|---|---|---|
| `data/roadmap.ts` | 62 KB | 180-day roadmap with 360 problems |
| `data/skillTree.ts` | 35.7 KB | Skill dependency graph |
| `data/achievementCatalog.ts` | 16 KB | 120 achievement definitions |
| `data/germanLessons.ts` | 16.8 KB | 30 German lesson structures |
| `data/companies.ts` | 10.9 KB | Target company database |
| `data/placementPlan.ts` | 265 KB | Placement preparation plan |
| `data/germanVocabulary.ts` | — | German vocabulary sets |
| `data/germanGrammar.ts` | — | German grammar rules |
| `data/germanPhrases.ts` | — | German phrase sets |
| `data/germanStories.ts` | — | German reading stories |

---

## localStorage Key Quick Reference

| Key | Module |
|---|---|
| `sanju-career-os-v1` | Main career state |
| `sanzz_os_ai_brain_v1` | AI Brain |
| `sanzz_os_achievements_v1` | Achievements |
| `sanzz_os_analytics_cache_v1` | Analytics 2.0 |
| `sanzz_os_learning_os_v1` | Learning OS |
| `sanzz_os_learning_sessions_v1` | Learning sessions |
| `sanzz_os_revision_items_v1` | Revision queue |
| `sanzz_os_personalization_v1` | Personalization |
| `sanzz_os_placement_os_v1` | Placement OS |
| `sanzz_os_smart_planner_v1` | Smart Planner |
| `sanzz_os_xp_events_v1` | XP events |
| `sanzz_os_sync_queue_v1` | Sync queue |
| `sanzz_os_sync_mode_v1` | Sync mode |
| `sanzz_os_last_sync_v1` | Last sync |
| `sanzz_os_theme_settings_v1` | Theme |
| `sanzz_os_performance_settings_v1` | Performance mode |
| `sanzz_os_ui_preferences_v1` | UI density |
| `sanju-career-os-migrations` | Migration log |
| `shayla-memory-enabled` | Shayla memory |
| `sanju-placement-v3` | Legacy migration source |
