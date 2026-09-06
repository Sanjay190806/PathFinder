import { logMigration } from '../../utils/stateMigrationUtils';

function resetSeededCareerDefaults(state: any) {
  const seededProjectNames = ['CareSync AI', 'SmartEdu AI', 'Sanju Career OS'];
  const projects = state.projects && typeof state.projects === 'object' ? state.projects : {};
  const projectNames = Object.values(projects).map((project: any) => project?.name);
  const hasOnlySeededProjects = projectNames.length > 0 && projectNames.every((name) => seededProjectNames.includes(String(name)));

  const next = { ...state };
  const hasSeededResumeScore = next.resume?.atsScore === 70;

  if (hasOnlySeededProjects) {
    next.projects = {};
  }

  if (hasSeededResumeScore) {
    next.resume = {
      ...next.resume,
      atsScore: 0,
      targetRole: '',
      sections: {
        contact: 0,
        education: 0,
        skills: 0,
        projects: 0,
        achievements: 0,
        formatting: 0,
      },
    };
  }

  if (hasOnlySeededProjects || hasSeededResumeScore) {
    next.dailyLogs = {};
    next.problemLogs = {};
    next.sqlProgress = {};
    next.aptitudeProgress = {};
    next.csCoreProgress = {};
    next.skillRackStats = { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} };
    next.dsaPatternMastery = {};
    next.xp = 0;
    next.level = 1;
    next.badges = [];
    next.unlockedBadges = {};
  } else if (Number(next.xp || 0) > 0 && Object.keys(next.dailyLogs || {}).length === 0) {
    next.xp = 0;
    next.level = 1;
    next.badges = [];
    next.unlockedBadges = {};
  }

  return next;
}

export function runMigrationForStore(storeName: string, state: any, version: number | undefined): any {
  try {
    let migrated = { ...state };
    let success = true;
    let notes = '';

    if (storeName === 'sanju-career-os-ui-state') {
      migrated = {
        shaylaChatHeight: 600,
        shaylaRightPanelWidth: 360,
        shaylaRightPanelCollapsed: false,
        shaylaAgentNotificationsCollapsed: false,
        shaylaQuickActionsCollapsed: false,
        ...migrated
      };
      notes = 'Merged Shayla layout defaults';
    } else if (storeName === 'sanju-ai-settings-persist-v3') {
      const oldPrompt = typeof migrated.systemPrompt === 'string' ? migrated.systemPrompt : '';
      migrated = {
        activeProvider: 'groq',
        activeModel: 'openai/gpt-oss-20b',
        activeMode: 'Daily Coach',
        fallbackProvider: 'groq',
        fallbackModel: 'llama-3.1-8b-instant',
        streamingEnabled: true,
        temperature: 0.7,
        topP: 0.9,
        maxTokens: 1200,
        contextWindowMode: 'full',
        ...migrated
      };
      if (oldPrompt.includes('You are not romantic.') || oldPrompt.includes('Warm, direct, calm, practical.')) {
        delete migrated.systemPrompt;
      }
      notes = 'Merged AI settings defaults and refreshed Shayla bestie tone when old default was detected';
    } else if (storeName === 'sanju-shayla-agent-persist-v1') {
      migrated = {
        agentModeEnabled: true,
        dailyBriefingEnabled: true,
        eveningReviewEnabled: true,
        smartNotificationsEnabled: true,
        autoGenerateBriefingOnLaunch: false,
        notificationSensitivity: 'medium',
        enableRecoverySuggestions: true,
        enableGermanNudges: true,
        enableCsCoreNudges: true,
        enableResumeNudges: true,
        dismissedNotifications: [],
        briefingHistory: [],
        eveningReviewHistory: [],
        smartNotificationLog: [],
        ...migrated
      };
      notes = 'Merged agent settings defaults';
    } else if (storeName === 'sanju-career-os-persist') {
      migrated = {
        companyTargets: [],
        skillTree: {},
        weeklyReviews: {},
        weeklyFreezeUsage: {},
        chatHistory: [],
        dailyLogs: {},
        problemLogs: {},
        xp: 0,
        level: 1,
        badges: [],
        unlockedBadges: {},
        sqlProgress: {},
        aptitudeProgress: {},
        csCoreProgress: {},
        skillRackStats: { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} },
        dsaPatternMastery: {},
        ...migrated
      };
      migrated = resetSeededCareerDefaults(migrated);
      notes = 'Merged placement execution targets defaults and removed seeded demo career data';
    } else if (storeName === 'sanzz_os_calendar_events_v1') {
      migrated = {
        events: [],
        ...migrated
      };
      notes = 'Merged calendar events defaults';
    } else if (storeName === 'sanzz_os_notification_store_v1') {
      migrated = {
        notifications: [],
        settings: {
          studyReminders: true,
          germanReminders: true,
          interviewReminders: true,
          resumeReminders: true,
          projectReminders: true,
          revisionReminders: true,
          weekendReminders: true,
          achievementNotifications: true,
          browserNotifications: false,
          quietHoursEnabled: false,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          reminderFrequency: 'daily',
        },
        weeklyReports: {},
        monthlyReports: {},
        agendas: {},
        ...migrated
      };
      notes = 'Merged notification and review store defaults';
    } else if (storeName === 'sanzz_os_mock_interview_v1') {
      migrated = {
        sessions: [],
        answers: {},
        projectPitches: {},
        ...migrated
      };
      notes = 'Merged mock interview defaults';
    } else if (storeName === 'sanzz_os_interview_questions_v1') {
      migrated = {
        questions: [],
        ...migrated
      };
      notes = 'Merged interview questions defaults';
    } else if (storeName === 'sanzz_os_communication_practice_v1') {
      migrated = {
        logs: [],
        mistakes: [],
        ...migrated
      };
      notes = 'Merged communication practice defaults';
    } else if (storeName === 'sanzz_os_company_intelligence_v1') {
      const seededCompanyIds = new Set(['c-zoho', 'c-fractal', 'c-accenture']);
      const looksSeededCompanyIntel = Array.isArray(migrated.companies)
        && migrated.companies.length > 0
        && migrated.companies.every((company: any) => seededCompanyIds.has(company?.id))
        && Object.keys(migrated.prepPlans || {}).length === 0;
      migrated = {
        companies: [],
        prepPlans: {},
        strategy: { priorityCompanies: [], readySoon: [], longTermTargets: [], activePipelines: {} },
        ...migrated
      };
      if (looksSeededCompanyIntel) {
        migrated.companies = (migrated.companies || []).map((company: any) => ({
          ...company,
          readinessScore: 0,
          notes: '',
        }));
        migrated.strategy = { priorityCompanies: [], readySoon: [], longTermTargets: [], activePipelines: {} };
      }
      notes = 'Merged company intelligence defaults and cleared seeded readiness/pipeline data';
    } else if (storeName === 'sanzz_os_oa_attempts_v1') {
      migrated = {
        attempts: [],
        ...migrated
      };
      notes = 'Merged OA attempts defaults';
    } else if (storeName === 'sanzz_os_portfolio_os_v1') {
      migrated = {
        visibility: {},
        profile: {},
        caseStudies: {},
        githubRepos: [],
        linkedinDrafts: [],
        ...migrated
      };
      notes = 'Merged portfolio OS defaults';
    } else if (storeName === 'sanzz_os_ai_mentor_v3') {
      migrated = {
        profile: {},
        insights: [],
        missions: [],
        reviews: [],
        ...migrated
      };
      notes = 'Merged AI mentor defaults';
    } else if (storeName === 'sanzz_os_automation_rules_v1') {
      migrated = {
        rules: [],
        runs: [],
        ...migrated
      };
      notes = 'Merged automation rules defaults';
    } else {
      notes = 'No migration schema changes required';
    }

    logMigration({
      storeName,
      version: version ?? 'legacy',
      migratedAt: new Date().toISOString(),
      success,
      notes
    });

    return migrated;
  } catch (error: any) {
    logMigration({
      storeName,
      version: version ?? 'legacy',
      migratedAt: new Date().toISOString(),
      success: false,
      notes: `Error: ${error.message || error}`
    });
    return state;
  }
}
export default runMigrationForStore;
