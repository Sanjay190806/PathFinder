export interface RouteDef {
  path: string;
  sectionId: string;
}

/**
 * Full route definition list — synchronized with AppRouter.tsx section map.
 * Last updated: v1.7.2
 *
 * Public routes (no AppShell):
 *   /           → landing
 *   /landing    → landing (alias)
 *   /portfolio  → portfolio
 *   /offline    → offline
 *
 * Workspace console routes (inside AppShell):
 *   All entries below are rendered by AppShell and lazy-loaded via React.lazy.
 */
export const routes: RouteDef[] = [
  // ── Public / shell-less ──────────────────────────────────────────────────
  { path: '/',                   sectionId: 'landing' },
  { path: '/landing',            sectionId: 'landing' },
  { path: '/portfolio',          sectionId: 'portfolio' },
  { path: '/offline',            sectionId: 'offline' },

  // ── Dashboard ────────────────────────────────────────────────────────────
  { path: '/overview',           sectionId: 'overview' },
  { path: '/today',              sectionId: 'today' },

  // ── AI Systems ───────────────────────────────────────────────────────────
  { path: '/ai-brain',           sectionId: 'ai_brain' },
  { path: '/ai',                 sectionId: 'ai' },
  { path: '/ai-settings',        sectionId: 'ai_settings' },
  { path: '/shayla-memory',      sectionId: 'shayla_memory' },
  { path: '/ai-playground',      sectionId: 'ai_playground' },
  { path: '/ai-benchmark',       sectionId: 'ai_benchmark' },

  // ── Planning & OS ────────────────────────────────────────────────────────
  { path: '/smart-planner',      sectionId: 'smart_planner' },
  { path: '/placement-os',       sectionId: 'placement_os' },
  { path: '/learning-os',        sectionId: 'learning_os' },

  // ── Analytics & Reports ──────────────────────────────────────────────────
  { path: '/analytics',          sectionId: 'analytics' },
  { path: '/reports',            sectionId: 'reports' },

  // ── Skill Building ───────────────────────────────────────────────────────
  { path: '/dsa-tracker',        sectionId: 'dsa_tracker' },
  { path: '/skillrack',          sectionId: 'skillrack' },
  { path: '/aptitude',           sectionId: 'aptitude' },
  { path: '/sql',                sectionId: 'sql' },
  { path: '/cs-core',            sectionId: 'cscore' },
  { path: '/skill-tree',         sectionId: 'skill_tree' },
  { path: '/coding-mentor',      sectionId: 'coding_mentor' },

  // ── Learning ─────────────────────────────────────────────────────────────
  { path: '/german',             sectionId: 'german' },
  { path: '/roadmap',            sectionId: 'roadmap' },

  // ── Placement & Applications ─────────────────────────────────────────────
  { path: '/companies',          sectionId: 'companies' },
  { path: '/applications',       sectionId: 'applications' },
  { path: '/placement-calendar', sectionId: 'placement_calendar' },
  { path: '/calendar',           sectionId: 'calendar' },
  { path: '/interview-coach',    sectionId: 'interview_coach' },

  // ── Career Management ─────────────────────────────────────────────────────
  { path: '/career-intelligence', sectionId: 'career_intelligence' },
  { path: '/resume',             sectionId: 'resume' },
  { path: '/projects',           sectionId: 'projects' },

  // ── Gamification & History ────────────────────────────────────────────────
  { path: '/achievements',       sectionId: 'achievements' },
  { path: '/history',            sectionId: 'history' },

  // ── App Management ────────────────────────────────────────────────────────
  { path: '/integrations',       sectionId: 'integrations' },
  { path: '/settings',           sectionId: 'settings' },
  { path: '/admin',              sectionId: 'admin' },
  { path: '/portfolio-os',       sectionId: 'portfolio_os' },
  { path: '/ai-mentor',          sectionId: 'ai_mentor' },
];
