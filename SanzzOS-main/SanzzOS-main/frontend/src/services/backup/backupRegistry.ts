import { storagePerformance } from '../../utils/storagePerformance';

export const APP_NAME = 'Sanju Career OS';
export const BACKUP_VERSION = '1.7.2';
export const BACKUP_SCHEMA_VERSION = 5;
export const MAX_BACKUP_BYTES = 25 * 1024 * 1024;

export const PRE_RESTORE_BACKUP_KEY = 'sanzz_os_pre_restore_backup_v1';

export interface BackupRegistryEntry {
  id: string;
  storageKey: string;
  module: string;
  description: string;
  isJson: boolean;
}

export const BACKUP_STORAGE_KEYS: BackupRegistryEntry[] = [
  { id: 'career', storageKey: 'sanju-career-os-persist', module: 'Career OS', description: 'Core career tracker state', isJson: true },
  { id: 'aiSettings', storageKey: 'sanju-ai-settings-persist-v3', module: 'AI Settings', description: 'Shayla AI provider settings', isJson: true },
  { id: 'shaylaAgent', storageKey: 'sanju-shayla-agent-persist-v1', module: 'Shayla Agent', description: 'Agent notification preferences', isJson: true },
  { id: 'shaylaChat', storageKey: 'shayla-ai-chat-v1', module: 'Shayla Chat', description: 'AI mentor chat history', isJson: true },
  { id: 'shaylaMemoryEnabled', storageKey: 'shayla-memory-enabled', module: 'Shayla Memory', description: 'Memory feature toggle', isJson: false },
  { id: 'personalization', storageKey: 'sanzz_os_personalization_v1', module: 'Personalization', description: 'User personalization profile', isJson: true },
  { id: 'achievements', storageKey: 'sanzz_os_achievements_v1', module: 'Achievements', description: 'Unlocked badges and progress', isJson: true },
  { id: 'xpEvents', storageKey: 'sanzz_os_xp_events_v1', module: 'Gamification', description: 'XP event history', isJson: true },
  { id: 'uiPreferences', storageKey: 'sanzz_os_ui_preferences_v1', module: 'UI', description: 'Layout density preferences', isJson: true },
  { id: 'themeSettings', storageKey: 'sanzz_os_theme_settings_v1', module: 'Theme', description: 'Theme preset settings', isJson: true },
  { id: 'performanceSettings', storageKey: 'sanzz_os_performance_settings_v1', module: 'Performance', description: 'Rendering performance mode', isJson: true },
  { id: 'uiState', storageKey: 'sanju-career-os-ui-state', module: 'UI', description: 'Navigation and UI state', isJson: true },
  { id: 'aiBrain', storageKey: 'sanzz_os_ai_brain_v1', module: 'AI Brain', description: 'AI Brain summary cache', isJson: true },
  { id: 'smartPlanner', storageKey: 'sanzz_os_smart_planner_v1', module: 'Smart Planner', description: 'Daily planner tasks', isJson: true },
  { id: 'placementOs', storageKey: 'sanzz_os_placement_os_v1', module: 'Placement OS', description: 'Placement readiness data', isJson: true },
  { id: 'learningOs', storageKey: 'sanzz_os_learning_os_v1', module: 'Learning OS', description: 'Learning path mastery', isJson: true },
  { id: 'learningSessions', storageKey: 'sanzz_os_learning_sessions_v1', module: 'Learning OS', description: 'Learning session logs', isJson: true },
  { id: 'revisionItems', storageKey: 'sanzz_os_revision_items_v1', module: 'Learning OS', description: 'Revision queue items', isJson: true },
  { id: 'analyticsCache', storageKey: 'sanzz_os_analytics_cache_v1', module: 'Analytics', description: 'Analytics cache snapshot', isJson: true },
  { id: 'integrations', storageKey: 'sanju-career-os-integrations-v15', module: 'Integrations', description: 'Integration profile links', isJson: true },
  { id: 'resumeAnalysis', storageKey: 'sanju-career-os-resume-analysis-v15', module: 'Resume', description: 'Resume analysis results', isJson: true },
  { id: 'resumeStudio', storageKey: 'sanju-resume-studio-v1', module: 'Resume', description: 'Resume studio drafts', isJson: true },
  { id: 'interviewCoach', storageKey: 'sanju-interview-coach-v1', module: 'Interview', description: 'Interview coach sessions', isJson: true },
  { id: 'feedback', storageKey: 'sanju-feedback-persist', module: 'Feedback', description: 'User feedback entries', isJson: true },
  { id: 'benchmark', storageKey: 'sanzz-benchmark-store', module: 'AI Playground', description: 'AI benchmark runs', isJson: true },
  { id: 'comparison', storageKey: 'sanzz-comparison-store', module: 'AI Playground', description: 'Model comparison runs', isJson: true },
  { id: 'migrations', storageKey: 'sanju-career-os-migrations', module: 'System', description: 'Migration audit log', isJson: true },
  { id: 'syncMode', storageKey: 'sanzz_os_sync_mode_v1', module: 'Sync', description: 'Sync mode preference', isJson: false },
  { id: 'lastSync', storageKey: 'sanzz_os_last_sync_v1', module: 'Sync', description: 'Last DB snapshot sync time', isJson: false },
  { id: 'syncQueue', storageKey: 'sanzz_os_sync_queue_v1', module: 'Sync', description: 'Pending offline sync queue', isJson: true },
  { id: 'accountMode', storageKey: 'sanzz_os_account_mode_v1', module: 'Account', description: 'Local-only or account sync mode preference', isJson: false },
  { id: 'deviceId', storageKey: 'sanzz_os_device_id_v1', module: 'Account', description: 'Anonymous local device identifier for sync metadata', isJson: false },
  { id: 'onboarding', storageKey: 'sanzz_os_onboarding_v1', module: 'Onboarding', description: 'Onboarding completion and dashboard preference', isJson: true },
  { id: 'legacyCareer', storageKey: 'sanju-career-os-v1', module: 'Legacy', description: 'Legacy career export key', isJson: true },
  { id: 'calendarEvents', storageKey: 'sanzz_os_calendar_events_v1', module: 'Calendar', description: 'Calendar events database', isJson: true },
  { id: 'notificationStore', storageKey: 'sanzz_os_notification_store_v1', module: 'Notifications', description: 'Notifications history and reviews', isJson: true },
  { id: 'mockInterview', storageKey: 'sanzz_os_mock_interview_v1', module: 'Interview', description: 'Mock interview session configs', isJson: true },
  { id: 'interviewQuestions', storageKey: 'sanzz_os_interview_questions_v1', module: 'Interview', description: 'Interview questions bank database', isJson: true },
  { id: 'communicationPractice', storageKey: 'sanzz_os_communication_practice_v1', module: 'Interview', description: 'Speech coach metrics logs', isJson: true },
  { id: 'projectExplanation', storageKey: 'sanzz_os_project_explanation_practice_v1', module: 'Interview', description: 'Project elevator pitch practices', isJson: true },
  { id: 'companyIntelligence', storageKey: 'sanzz_os_company_intelligence_v1', module: 'Company', description: 'Target company intelligence profiles', isJson: true },
  { id: 'companyPrepPlans', storageKey: 'sanzz_os_company_prep_plans_v1', module: 'Company', description: 'Target company study timelines', isJson: true },
  { id: 'companyReadiness', storageKey: 'sanzz_os_company_readiness_v1', module: 'Company', description: 'Readiness levels and checklist tasks', isJson: true },
  { id: 'oaAttempts', storageKey: 'sanzz_os_oa_attempts_v1', module: 'Company', description: 'Online assessments tracking attempts logs', isJson: true },
  { id: 'placementStrategy', storageKey: 'sanzz_os_placement_strategy_v1', module: 'Company', description: 'Job applications strategic pipeline', isJson: true },
  { id: 'portfolioOS', storageKey: 'sanzz_os_portfolio_os_v1', module: 'Portfolio', description: 'Portfolio configurations and summaries', isJson: true },
  { id: 'portfolioSnapshots', storageKey: 'sanzz_os_public_portfolio_snapshots_v1', module: 'Portfolio', description: 'Recruiter-facing snapshots', isJson: true },
  { id: 'githubOS', storageKey: 'sanzz_os_github_os_v1', module: 'Portfolio', description: 'GitHub OS guidelines checklist', isJson: true },
  { id: 'linkedinDrafts', storageKey: 'sanzz_os_linkedin_drafts_v1', module: 'Portfolio', description: 'LinkedIn post drafts', isJson: true },
  { id: 'aiMentorProfile', storageKey: 'sanzz_os_ai_mentor_v3', module: 'Mentor', description: 'AI Mentor 3.0 profile parameters', isJson: true },
  { id: 'mentorReviews', storageKey: 'sanzz_os_mentor_reviews_v1', module: 'Mentor', description: 'Weekly/monthly performance summaries', isJson: true },
  { id: 'automationRules', storageKey: 'sanzz_os_automation_rules_v1', module: 'Mentor', description: 'Local automation rules triggers list', isJson: true },
  { id: 'automationRuns', storageKey: 'sanzz_os_automation_runs_v1', module: 'Mentor', description: 'Automation execution history logs', isJson: true },
  { id: 'mentorMissions', storageKey: 'sanzz_os_mentor_missions_v1', module: 'Mentor', description: 'AI mentor target missions checklists', isJson: true },
  { id: 'portfolioSettings', storageKey: 'sanzz_os_portfolio_settings_v1', module: 'Portfolio', description: 'Portfolio settings preference', isJson: true },
  { id: 'aiMentorSettings', storageKey: 'sanzz_os_ai_mentor_settings_v1', module: 'Mentor', description: 'AI Mentor settings preference', isJson: true },
];

const SECRET_KEY_PATTERN = /(\.env|api[_-]?key|secret|token|password|authorization|groq|bearer|credential)/i;
const EXCLUDED_BACKUP_IDS = new Set(['aiSettings', 'preRestoreBackup']);

export interface BackupSnapshotV2 {
  appName: string;
  version: string;
  schemaVersion: number;
  createdAt: string;
  mode: 'local_backup';
  keysIncluded: string[];
  keysMissing: string[];
  data: Record<string, string>;
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  warnings: string[];
  keysToRestore: string[];
  keysToOverwrite: string[];
  versionMismatch: boolean;
  backupVersion?: string;
  schemaVersion?: number;
}

export interface RestoreResultV2 {
  success: boolean;
  restoredKeys: string[];
  skippedKeys: string[];
  warnings: string[];
  error?: string;
  preRestoreSaved: boolean;
}

export function getBackupRegistry(): BackupRegistryEntry[] {
  return BACKUP_STORAGE_KEYS;
}

export function getRegistryStorageKeys(): string[] {
  return BACKUP_STORAGE_KEYS
    .filter((entry) => !EXCLUDED_BACKUP_IDS.has(entry.id))
    .map((entry) => entry.storageKey);
}

function readStorageValue(key: string, isJson: boolean): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === '') return null;
    if (isJson) {
      JSON.parse(raw);
    }
    return raw;
  } catch {
    console.warn(`Skipping corrupted backup key: ${key}`);
    return null;
  }
}

export function collectBackupData(): BackupSnapshotV2 {
  const data: Record<string, string> = {};
  const keysIncluded: string[] = [];
  const keysMissing: string[] = [];

  for (const entry of BACKUP_STORAGE_KEYS) {
    if (EXCLUDED_BACKUP_IDS.has(entry.id) || SECRET_KEY_PATTERN.test(entry.storageKey)) {
      keysMissing.push(entry.storageKey);
      continue;
    }

    const value = readStorageValue(entry.storageKey, entry.isJson);
    if (value !== null) {
      const secretHit = detectSecretInStoredValue(value, entry);
      if (secretHit) {
        console.warn(`Skipping backup key with secret-like content: ${entry.storageKey}`);
        keysMissing.push(entry.storageKey);
      } else {
        data[entry.storageKey] = value;
        keysIncluded.push(entry.storageKey);
      }
    } else {
      keysMissing.push(entry.storageKey);
    }
  }

  return {
    appName: APP_NAME,
    version: BACKUP_VERSION,
    schemaVersion: BACKUP_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    mode: 'local_backup',
    keysIncluded,
    keysMissing,
    data,
  };
}

function containsSecretLikeContent(value: unknown, path = ''): string | null {
  if (typeof value === 'string') {
    if (SECRET_KEY_PATTERN.test(path)) return path;
    if (/gsk_[A-Za-z0-9]{10,}/.test(value)) return path || 'payload';
    if (/sk-[A-Za-z0-9]{10,}/.test(value)) return path || 'payload';
    return null;
  }
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = containsSecretLikeContent(value[i], `${path}[${i}]`);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (SECRET_KEY_PATTERN.test(key)) return key;
      const hit = containsSecretLikeContent(nested, path ? `${path}.${key}` : key);
      if (hit) return hit;
    }
  }
  return null;
}

function detectSecretInStoredValue(value: string, entry: BackupRegistryEntry): string | null {
  if (SECRET_KEY_PATTERN.test(entry.id) || SECRET_KEY_PATTERN.test(entry.storageKey)) {
    return entry.storageKey;
  }

  try {
    return containsSecretLikeContent(JSON.parse(value), entry.storageKey);
  } catch {
    return SECRET_KEY_PATTERN.test(value) ? entry.storageKey : null;
  }
}

function normalizeIncomingBackup(raw: unknown): BackupSnapshotV2 | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;

  if (input.appName !== APP_NAME) return null;
  if (!input.data || typeof input.data !== 'object') return null;

  const data = input.data as Record<string, unknown>;
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (value !== null && value !== undefined) {
      normalized[key] = JSON.stringify(value);
    }
  }

  return {
    appName: APP_NAME,
    version: typeof input.version === 'string' ? input.version : 'unknown',
    schemaVersion: typeof input.schemaVersion === 'number' ? input.schemaVersion : 1,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    mode: 'local_backup',
    keysIncluded: Object.keys(normalized),
    keysMissing: [],
    data: normalized,
  };
}

export function validateBackupData(raw: unknown, options?: { forRestore?: boolean }): BackupValidationResult {
  const warnings: string[] = [];
  const snapshot = normalizeIncomingBackup(raw);

  if (!snapshot) {
    return {
      valid: false,
      error: 'Backup is missing appName, data payload, or uses an incompatible format.',
      warnings,
      keysToRestore: [],
      keysToOverwrite: [],
      versionMismatch: false,
    };
  }

  const payloadSize = JSON.stringify(snapshot.data).length;
  if (payloadSize > MAX_BACKUP_BYTES) {
    return {
      valid: false,
      error: 'Backup payload is too large to restore safely.',
      warnings,
      keysToRestore: [],
      keysToOverwrite: [],
      versionMismatch: false,
    };
  }

  if (snapshot.schemaVersion > BACKUP_SCHEMA_VERSION) {
    return {
      valid: false,
      error: `Unsupported backup schema version ${snapshot.schemaVersion}. Update the app before restoring this file.`,
      warnings,
      keysToRestore: [],
      keysToOverwrite: [],
      versionMismatch: true,
      backupVersion: snapshot.version,
      schemaVersion: snapshot.schemaVersion,
    };
  }

  const versionMismatch = snapshot.version !== BACKUP_VERSION;
  if (versionMismatch) {
    warnings.push(`Backup version ${snapshot.version} differs from app version ${BACKUP_VERSION}. Restore may still work for compatible keys.`);
  }

  const knownKeys = new Set(getRegistryStorageKeys());
  const keysToRestore = Object.keys(snapshot.data).filter((key) => knownKeys.has(key));
  const unknownKeys = Object.keys(snapshot.data).filter((key) => !knownKeys.has(key));

  if (unknownKeys.length > 0) {
    warnings.push(`Unknown keys will be skipped: ${unknownKeys.join(', ')}`);
  }

  if (keysToRestore.length === 0) {
    return {
      valid: false,
      error: 'Backup contains no recognized storage keys for this app version.',
      warnings,
      keysToRestore: [],
      keysToOverwrite: [],
      versionMismatch,
      backupVersion: snapshot.version,
      schemaVersion: snapshot.schemaVersion,
    };
  }

  for (const key of keysToRestore) {
    try {
      const parsed = JSON.parse(snapshot.data[key]);
      const secretHit = containsSecretLikeContent(parsed, key);
      if (secretHit) {
        return {
          valid: false,
          error: `Backup rejected: suspicious secret-like content detected near "${secretHit}".`,
          warnings,
          keysToRestore: [],
          keysToOverwrite: [],
          versionMismatch,
        };
      }
    } catch {
      if (SECRET_KEY_PATTERN.test(key)) {
        return {
          valid: false,
          error: `Backup rejected: suspicious key name "${key}".`,
          warnings,
          keysToRestore: [],
          keysToOverwrite: [],
          versionMismatch,
        };
      }
    }
  }

  const keysToOverwrite = keysToRestore.filter((key) => localStorage.getItem(key) !== null);

  if (options?.forRestore && keysToOverwrite.length === 0) {
    warnings.push('No existing local keys will be overwritten. Missing keys will be added.');
  }

  return {
    valid: true,
    warnings,
    keysToRestore,
    keysToOverwrite,
    versionMismatch,
    backupVersion: snapshot.version,
    schemaVersion: snapshot.schemaVersion,
  };
}

export function savePreRestoreBackup(): boolean {
  try {
    const snapshot = collectBackupData();
    localStorage.setItem(PRE_RESTORE_BACKUP_KEY, JSON.stringify(snapshot));
    return true;
  } catch (e) {
    console.warn('Failed to save pre-restore backup:', e);
    return false;
  }
}

export function restoreBackupData(raw: unknown): RestoreResultV2 {
  const validation = validateBackupData(raw, { forRestore: true });
  if (!validation.valid) {
    return {
      success: false,
      restoredKeys: [],
      skippedKeys: [],
      warnings: validation.warnings,
      error: validation.error,
      preRestoreSaved: false,
    };
  }

  const snapshot = normalizeIncomingBackup(raw);
  if (!snapshot) {
    return {
      success: false,
      restoredKeys: [],
      skippedKeys: [],
      warnings: validation.warnings,
      error: 'Unable to parse backup payload.',
      preRestoreSaved: false,
    };
  }

  const preRestoreSaved = savePreRestoreBackup();
  const restoredKeys: string[] = [];
  const skippedKeys: string[] = [];
  const knownKeys = new Set(getRegistryStorageKeys());

  for (const [key, value] of Object.entries(snapshot.data)) {
    if (!knownKeys.has(key) || key === PRE_RESTORE_BACKUP_KEY) {
      skippedKeys.push(key);
      continue;
    }

    try {
      const entry = BACKUP_STORAGE_KEYS.find((item) => item.storageKey === key);
      if (entry?.isJson) {
        JSON.parse(value);
      }
      localStorage.setItem(key, value);
      restoredKeys.push(key);
    } catch {
      skippedKeys.push(key);
    }
  }

  window.dispatchEvent(new Event('local_sync_restored'));
  window.dispatchEvent(new Event('personalization_changed'));
  window.dispatchEvent(new Event('achievements_changed'));
  window.dispatchEvent(new Event('ui_preferences_changed'));
  window.dispatchEvent(new Event('performance_settings_changed'));
  window.dispatchEvent(new Event('sync_config_changed'));

  return {
    success: restoredKeys.length > 0,
    restoredKeys,
    skippedKeys,
    warnings: validation.warnings,
    error: restoredKeys.length > 0 ? undefined : 'No keys were restored.',
    preRestoreSaved,
  };
}

export function getBackupStorageSizeKB(): number {
  let total = 0;
  for (const entry of BACKUP_STORAGE_KEYS) {
    const val = localStorage.getItem(entry.storageKey);
    if (val) total += val.length * 2;
  }
  return Math.round((total / 1024) * 100) / 100;
}

export function formatBackupValidationSummary(validation: BackupValidationResult): string {
  const lines = [
    `Keys to restore: ${validation.keysToRestore.length}`,
    validation.keysToRestore.slice(0, 8).join(', ') + (validation.keysToRestore.length > 8 ? '…' : ''),
    `Existing keys to overwrite: ${validation.keysToOverwrite.length}`,
    validation.versionMismatch ? `Version warning: backup ${validation.backupVersion} vs app ${BACKUP_VERSION}` : 'Version: compatible',
  ];
  if (validation.warnings.length > 0) {
    lines.push(`Warnings: ${validation.warnings.join(' | ')}`);
  }
  return lines.join('\n');
}

export { storagePerformance };
