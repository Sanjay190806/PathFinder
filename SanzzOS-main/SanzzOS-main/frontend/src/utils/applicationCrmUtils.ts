import {
  ApplicationPriority,
  ApplicationSource,
  CareerApplicationStatus,
  CareerApplication,
} from '../types';

export const APPLICATION_STATUSES: CareerApplicationStatus[] = [
  'Wishlist',
  'Applied',
  'OA',
  'Interview',
  'HR',
  'Offer',
  'Rejected',
  'Ghosted',
];

export const APPLICATION_PRIORITY_OPTIONS: ApplicationPriority[] = ['Low', 'Medium', 'High', 'Dream'];

export const APPLICATION_SOURCE_OPTIONS: ApplicationSource[] = [
  'Company Site',
  'LinkedIn',
  'Referral',
  'Naukri',
  'Indeed',
  'Campus',
  'Email',
  'Other',
];

export interface ApplicationNextAction {
  label: string;
  reason: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ApplicationQualityIssue {
  applicationId: string;
  company: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ApplicationPipelineMetrics {
  total: number;
  active: number;
  offers: number;
  interviews: number;
  stale: number;
  needsFollowUp: number;
  callbackRate: number;
  offerRate: number;
  ghostRate: number;
  averageResponseDays: number | null;
  bestSource: string;
}

export interface CompanyPrepPlan {
  focus: string;
  dsa: string[];
  aptitude: string[];
  interview: string[];
  resume: string[];
  communication: string[];
}

export interface ApplicationReminder {
  applicationId: string;
  company: string;
  label: string;
  dueDate?: string;
  urgency: 'low' | 'medium' | 'high';
}

export interface ResumeVersionMetric {
  version: string;
  total: number;
  callbacks: number;
  offers: number;
  callbackRate: number;
  offerRate: number;
}

const BACKUP_REMINDER_KEY = 'sanzz_os_last_backup_nudge_v1';
const BACKUP_EXPORTED_KEY = 'sanzz_os_last_backup_export_v1';

function parseDate(value?: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(start?: string, end = new Date()) {
  const date = parseDate(start);
  if (!date) return null;
  return Math.floor((end.getTime() - date.getTime()) / 86400000);
}

function isTerminal(status: CareerApplicationStatus) {
  return status === 'Offer' || status === 'Rejected' || status === 'Ghosted';
}

export function normalizeApplicationStatus(value: string): CareerApplicationStatus {
  const raw = value.toLowerCase();
  if (raw.includes('wish') || raw.includes('save')) return 'Wishlist';
  if (raw.includes('oa') || raw.includes('assessment') || raw.includes('test')) return 'OA';
  if (raw.includes('interview') || raw.includes('technical') || raw.includes('round')) return 'Interview';
  if (raw.includes('hr')) return 'HR';
  if (raw.includes('offer') || raw.includes('select')) return 'Offer';
  if (raw.includes('reject')) return 'Rejected';
  if (raw.includes('ghost') || raw.includes('no reply')) return 'Ghosted';
  return 'Applied';
}

export function createTimelineEvent(
  type: CareerApplicationStatus | 'Note' | 'Follow-up' | 'Resume' | 'JD Review',
  title: string,
  note?: string,
) {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString().split('T')[0],
    type,
    title,
    note,
  };
}

export function ensureApplicationDefaults(app: CareerApplication): CareerApplication {
  const timeline = app.timeline?.length
    ? app.timeline
    : [createTimelineEvent(app.status, `${app.status} - ${app.company}`, app.role)];

  return {
    source: 'Other',
    priority: 'Medium',
    workMode: '',
    risk: 'Low',
    jdKeywords: [],
    rounds: [],
    notes: '',
    ...app,
    timeline,
    lastUpdatedAt: app.lastUpdatedAt || new Date().toISOString(),
  };
}

export function getNextAction(app: CareerApplication): ApplicationNextAction {
  const appliedAge = daysBetween(app.date);
  const followUpAge = daysBetween(app.nextFollowUpDate);
  const hasFollowUpDue = followUpAge !== null && followUpAge >= 0;

  if (app.status === 'Wishlist') {
    return {
      label: 'Prepare resume version',
      reason: 'Wishlist companies need a targeted resume, JD keywords, and referral plan before applying.',
      urgency: app.priority === 'Dream' ? 'high' : 'medium',
    };
  }

  if (hasFollowUpDue && !isTerminal(app.status)) {
    return {
      label: 'Send follow-up',
      reason: `Follow-up date is due${app.nextFollowUpDate ? ` (${app.nextFollowUpDate})` : ''}.`,
      urgency: 'high',
    };
  }

  if (app.status === 'Applied' && appliedAge !== null && appliedAge >= 7) {
    return {
      label: 'Follow up or mark ghosted',
      reason: `Applied ${appliedAge} days ago with no later stage logged.`,
      urgency: appliedAge >= 14 ? 'high' : 'medium',
    };
  }

  if (app.status === 'OA') {
    return {
      label: 'Run OA prep block',
      reason: 'OA stage needs timed DSA, aptitude, and company-pattern practice.',
      urgency: 'high',
    };
  }

  if (app.status === 'Interview' || app.status === 'HR') {
    return {
      label: 'Prepare interview packet',
      reason: 'Create STAR stories, project pitch, role questions, and salary notes.',
      urgency: 'high',
    };
  }

  if (app.status === 'Offer') {
    return {
      label: 'Review offer details',
      reason: 'Compare compensation, joining date, role fit, and negotiation points.',
      urgency: 'medium',
    };
  }

  if (app.status === 'Rejected') {
    return {
      label: 'Extract rejection learning',
      reason: 'Log the reason, missing skill, and one corrective action for future attempts.',
      urgency: 'medium',
    };
  }

  if (app.status === 'Ghosted') {
    return {
      label: 'Archive or revive',
      reason: 'Decide whether to send one final note or close this pipeline item.',
      urgency: 'low',
    };
  }

  return {
    label: 'Keep warm',
    reason: 'Application is active. Keep notes, links, and next checkpoint current.',
    urgency: 'low',
  };
}

export function getPipelineMetrics(applications: CareerApplication[]): ApplicationPipelineMetrics {
  const normalized = applications.map(ensureApplicationDefaults);
  const total = normalized.length;
  const interviews = normalized.filter((app) => ['OA', 'Interview', 'HR', 'Offer'].includes(app.status)).length;
  const offers = normalized.filter((app) => app.status === 'Offer').length;
  const ghosted = normalized.filter((app) => app.status === 'Ghosted').length;
  const active = normalized.filter((app) => !isTerminal(app.status)).length;
  const nextActions = normalized.map(getNextAction);
  const needsFollowUp = nextActions.filter((action) => action.label.toLowerCase().includes('follow')).length;
  const stale = normalized.filter((app) => {
    const age = daysBetween(app.date);
    return app.status === 'Applied' && age !== null && age >= 10;
  }).length;

  const sourceCounts = normalized.reduce<Record<string, { total: number; callbacks: number }>>((acc, app) => {
    const source = app.source || 'Other';
    acc[source] = acc[source] || { total: 0, callbacks: 0 };
    acc[source].total += 1;
    if (['OA', 'Interview', 'HR', 'Offer'].includes(app.status)) acc[source].callbacks += 1;
    return acc;
  }, {});

  const bestSource = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => (b.callbacks / Math.max(b.total, 1)) - (a.callbacks / Math.max(a.total, 1)))[0]?.[0] || 'Not enough data';

  const responseDays = normalized
    .filter((app) => ['OA', 'Interview', 'HR', 'Offer'].includes(app.status))
    .map((app) => {
      const firstResponse = app.timeline?.find((event) => ['OA', 'Interview', 'HR', 'Offer'].includes(event.type));
      if (!firstResponse) return null;
      const applied = parseDate(app.date);
      const response = parseDate(firstResponse.date);
      if (!applied || !response) return null;
      return Math.max(0, Math.floor((response.getTime() - applied.getTime()) / 86400000));
    })
    .filter((value): value is number => value !== null);

  return {
    total,
    active,
    offers,
    interviews,
    stale,
    needsFollowUp,
    callbackRate: total ? Math.round((interviews / total) * 100) : 0,
    offerRate: total ? Math.round((offers / total) * 100) : 0,
    ghostRate: total ? Math.round((ghosted / total) * 100) : 0,
    averageResponseDays: responseDays.length ? Math.round(responseDays.reduce((sum, value) => sum + value, 0) / responseDays.length) : null,
    bestSource,
  };
}

export function getCompanyPrepPlan(app: CareerApplication): CompanyPrepPlan {
  const text = `${app.company} ${app.role} ${app.jdText || ''} ${(app.jdKeywords || []).join(' ')}`.toLowerCase();
  const isData = /data|analyst|sql|power bi|excel|pandas|statistics|dashboard/.test(text);
  const isBackend = /backend|api|node|java|spring|database|system design/.test(text);
  const isFrontend = /frontend|react|ui|typescript|javascript|css/.test(text);
  const isAI = /ai|ml|machine learning|python|model|llm|nlp/.test(text);

  const dsa = isData
    ? ['Arrays and hashing', 'SQL window-function drills', 'Basic probability puzzles']
    : isFrontend
      ? ['Arrays/strings', 'DOM-style problem solving', 'Frontend system design basics']
      : isBackend
        ? ['Hashmaps', 'Trees/graphs', 'API and database design questions']
        : ['Arrays', 'Strings', 'Recursion/backtracking'];

  return {
    focus: isAI ? 'AI/ML role prep' : isData ? 'Data/analyst role prep' : isBackend ? 'Backend role prep' : isFrontend ? 'Frontend role prep' : 'General placement prep',
    dsa,
    aptitude: ['Timed quantitative set', 'Logical reasoning speed round', 'Company OA mistakes review'],
    interview: [
      'Prepare one project walkthrough',
      'Prepare STAR answers for conflict, leadership, and failure',
      app.status === 'HR' ? 'Salary, joining date, and relocation notes' : 'Role-specific technical questions',
    ],
    resume: [
      app.resumeVersion ? `Review resume version: ${app.resumeVersion}` : 'Link a resume version before applying',
      'Mirror top JD keywords in project bullets',
      'Keep one measurable impact bullet ready',
    ],
    communication: ['60-second self intro', 'Why this company answer', 'Two thoughtful recruiter questions'],
  };
}

export function getApplicationReminders(applications: CareerApplication[]): ApplicationReminder[] {
  return applications
    .filter((app) => !isTerminal(app.status))
    .flatMap((app) => {
      const reminders: ApplicationReminder[] = [];
      const nextAction = getNextAction(app);
      if (nextAction.urgency !== 'low') {
        reminders.push({
          applicationId: app.id,
          company: app.company,
          label: nextAction.label,
          dueDate: app.nextFollowUpDate,
          urgency: nextAction.urgency,
        });
      }
      const deadlineAge = daysBetween(app.deadline);
      if (deadlineAge !== null && deadlineAge >= -2 && deadlineAge <= 0) {
        reminders.push({
          applicationId: app.id,
          company: app.company,
          label: 'Deadline is close',
          dueDate: app.deadline,
          urgency: 'high',
        });
      }
      return reminders;
    })
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[a.urgency] - rank[b.urgency];
    });
}

export function getResumeVersionMetrics(applications: CareerApplication[]): ResumeVersionMetric[] {
  const grouped = applications.reduce<Record<string, ResumeVersionMetric>>((acc, app) => {
    const version = app.resumeVersion?.trim() || 'Unlinked';
    acc[version] = acc[version] || { version, total: 0, callbacks: 0, offers: 0, callbackRate: 0, offerRate: 0 };
    acc[version].total += 1;
    if (['OA', 'Interview', 'HR', 'Offer'].includes(app.status)) acc[version].callbacks += 1;
    if (app.status === 'Offer') acc[version].offers += 1;
    return acc;
  }, {});

  return Object.values(grouped)
    .map((metric) => ({
      ...metric,
      callbackRate: metric.total ? Math.round((metric.callbacks / metric.total) * 100) : 0,
      offerRate: metric.total ? Math.round((metric.offers / metric.total) * 100) : 0,
    }))
    .sort((a, b) => b.callbackRate - a.callbackRate || b.total - a.total);
}

export function getLastBackupExportDate() {
  return localStorage.getItem(BACKUP_EXPORTED_KEY) || '';
}

export function markBackupExported(date = new Date().toISOString()) {
  localStorage.setItem(BACKUP_EXPORTED_KEY, date);
  localStorage.setItem(BACKUP_REMINDER_KEY, date);
}

export function dismissBackupReminder(date = new Date().toISOString()) {
  localStorage.setItem(BACKUP_REMINDER_KEY, date);
}

export function shouldShowWeeklyBackupReminder(now = new Date()) {
  const lastExport = parseDate(getLastBackupExportDate());
  const lastNudge = parseDate(localStorage.getItem(BACKUP_REMINDER_KEY) || '');
  if (!lastExport) return true;
  const daysSinceExport = Math.floor((now.getTime() - lastExport.getTime()) / 86400000);
  const daysSinceNudge = lastNudge ? Math.floor((now.getTime() - lastNudge.getTime()) / 86400000) : 999;
  return daysSinceExport >= 7 && daysSinceNudge >= 1;
}

export function extractKeywords(text: string, limit = 18) {
  const stop = new Set([
    'and',
    'the',
    'with',
    'for',
    'you',
    'are',
    'will',
    'our',
    'from',
    'that',
    'this',
    'have',
    'your',
    'work',
    'team',
    'role',
    'skills',
    'experience',
  ]);

  const counts = text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stop.has(word))
    .reduce<Record<string, number>>((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([word]) => word);
}

export function calculateJDMatch(app: CareerApplication) {
  const keywords = app.jdKeywords?.length ? app.jdKeywords : extractKeywords(app.jdText || '');
  if (!keywords.length) return { score: 0, matched: [] as string[], missing: [] as string[] };

  const haystack = `${app.role} ${app.notes || ''} ${app.resumeVersion || ''}`.toLowerCase();
  const matched = keywords.filter((keyword) => haystack.includes(keyword.toLowerCase()));
  const missing = keywords.filter((keyword) => !matched.includes(keyword));

  return {
    score: Math.round((matched.length / keywords.length) * 100),
    matched,
    missing,
  };
}

export function getApplicationQualityIssues(applications: CareerApplication[]): ApplicationQualityIssue[] {
  const issues: ApplicationQualityIssue[] = [];
  const seen = new Map<string, CareerApplication>();

  applications.forEach((app) => {
    const key = `${app.company.toLowerCase()}-${app.role.toLowerCase()}`;
    if (seen.has(key)) {
      issues.push({
        applicationId: app.id,
        company: app.company,
        message: 'Possible duplicate application for the same company and role.',
        severity: 'warning',
      });
    }
    seen.set(key, app);

    if (!app.role.trim()) {
      issues.push({ applicationId: app.id, company: app.company, message: 'Role/title is missing.', severity: 'critical' });
    }
    if (!app.resumeVersion && app.status !== 'Wishlist') {
      issues.push({ applicationId: app.id, company: app.company, message: 'No resume version linked to this application.', severity: 'info' });
    }
    if (!app.nextFollowUpDate && app.status === 'Applied') {
      issues.push({ applicationId: app.id, company: app.company, message: 'Applied application has no follow-up date.', severity: 'warning' });
    }
    if (getNextAction(app).urgency === 'high') {
      issues.push({ applicationId: app.id, company: app.company, message: getNextAction(app).reason, severity: 'warning' });
    }
  });

  return issues;
}
