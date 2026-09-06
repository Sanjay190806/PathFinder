export interface ParsedCommand {
  type:
    | 'completeDailyTask'
    | 'updateGermanProgress'
    | 'addWeakWord'
    | 'addApplication'
    | 'markCSCoreTopic'
    | 'updateProjectProgress'
    | 'generateTodayPlan'
    | 'completeSmartTask'
    | 'refreshAIBrain'
    | 'showPlacementReadiness'
    | 'updateCompanyStatus'
    | 'addInterviewRound'
    | 'addOAResult'
    | 'recommendNextAction'
    | 'logLearningSession'
    | 'showLearningOS'
    | 'updateSkillMastery'
    | 'showDueRevision'
    | 'completeRevisionItem'
    | 'showAnalytics'
    | 'showWeeklyAnalytics'
    | 'showWeakSkills'
    | 'recommendLearningTask'
    | 'generateLearningPlan'
    | 'setFocusMode'
    | 'setDensity'
    | 'claimAllAchievements'
    | 'setPerformanceMode'
    | 'showSyncStatus'
    | 'showAccountStatus'
    | 'showCloudSyncStatus'
    | 'syncNow'
    | 'createCloudBackup'
    | 'showCloudBackups'
    | 'startCloudMigration'
    | 'showDevices'
    | 'logoutHelp'
    | 'switchToLocalMode'
    | 'switchToCloudMode'
    | 'showSecuritySettings'
    | 'exportBackup'
    | 'showStorageHealth'
    | 'showPortfolioOS'
    | 'showPortfolioReadiness'
    | 'showApplicationFollowUps'
    | 'showStaleApplications'
    | 'showAIMentor'
    | 'generateWeeklyReview'
    | 'runAutomationCheck'
    | 'clearAppCache';
  payload: any;
  summary: string;
}

export function parseCommandOffline(text: string): ParsedCommand | null {
  const t = text.toLowerCase().trim();

  if (t.includes('show portfolio') || t.includes('portfolio os')) {
    return { type: 'showPortfolioOS', payload: {}, summary: 'Navigate to Recruiter Portfolio OS.' };
  }
  if (t.includes('portfolio readiness') || t.includes('portfolio score')) {
    return { type: 'showPortfolioReadiness', payload: {}, summary: 'Calculate and display portfolio readiness score details.' };
  }
  if (t.includes('application follow') || t.includes('follow up') || t.includes('follow-up')) {
    return { type: 'showApplicationFollowUps', payload: {}, summary: 'Show applications that need follow-up or next action review.' };
  }
  if (t.includes('stale application') || t.includes('ghost risk') || t.includes('no reply')) {
    return { type: 'showStaleApplications', payload: {}, summary: 'Show stale applications that may need follow-up or closure.' };
  }
  if (t.includes('show AI mentor') || t.includes('ai mentor')) {
    return { type: 'showAIMentor', payload: {}, summary: 'Navigate to AI Mentor 3.0 Workspace.' };
  }
  if (t.includes('weekly review') || t.includes('generate review')) {
    return { type: 'generateWeeklyReview', payload: {}, summary: 'Compile weekly performance review after confirmation.' };
  }
  if (t.includes('run automation') || t.includes('check automation')) {
    return { type: 'runAutomationCheck', payload: {}, summary: 'Run local automation rules check.' };
  }

  if ((t.includes('generate') || t.includes('create')) && t.includes('plan') && (t.includes('today') || t.includes('daily') || t.includes('low energy') || t.includes('low-energy') || t.includes('hour'))) {
    return {
      type: 'generateTodayPlan',
      payload: { mode: t.includes('busy') ? 'busy' : (t.includes('low energy') || t.includes('low-energy')) ? 'low_energy' : t.includes('sprint') ? 'placement_sprint' : 'normal' },
      summary: 'Generate a smart plan for today. This creates a preview and should be saved only after confirmation.'
    };
  }

  if (t.includes('studied') || t.includes('learning session') || t.includes('logged learning')) {
    const minutesMatch = t.match(/(\d+)\s*(?:minute|min)/);
    const confidence = t.includes('confidence low') || t.includes('low confidence') ? 'low' : t.includes('confidence high') || t.includes('high confidence') ? 'high' : 'medium';
    const knownPaths = ['sql', 'java', 'dsa', 'python', 'power bi', 'excel', 'aptitude', 'german', 'statistics', 'pandas', 'communication', 'interview'];
    const path = knownPaths.find((item) => t.includes(item)) || 'sql';
    const topicMatch = text.match(/studied\s+(.+?)\s+for/i);
    return {
      type: 'logLearningSession',
      payload: { path, topic: topicMatch?.[1]?.trim() || path, minutes: minutesMatch ? Number(minutesMatch[1]) : 30, confidence },
      summary: `Log ${minutesMatch ? minutesMatch[1] : 30} minutes of ${path} learning with ${confidence} confidence after confirmation.`
    };
  }

  if (t.includes('learning os') || t.includes('show learning')) {
    return { type: 'showLearningOS', payload: {}, summary: 'Show Learning OS overview.' };
  }

  if (t.includes('due revision') || t.includes('revision due')) {
    return { type: 'showDueRevision', payload: {}, summary: 'Show due revision items.' };
  }

  if (t.includes('complete') && t.includes('revision')) {
    return { type: 'completeRevisionItem', payload: {}, summary: 'Complete the first due revision item after confirmation.' };
  }

  if (t.includes('weekly analytics')) {
    return { type: 'showWeeklyAnalytics', payload: {}, summary: 'Show weekly analytics summary.' };
  }

  if (t.includes('analytics')) {
    return { type: 'showAnalytics', payload: {}, summary: 'Show Analytics 2.0 overview.' };
  }

  if (t.includes('weak skills') || t.includes('weakest skills')) {
    return { type: 'showWeakSkills', payload: {}, summary: 'Show weak skills from Learning OS and AI Brain.' };
  }

  if (t.includes('recommend learning') || t.includes('learning task')) {
    return { type: 'recommendLearningTask', payload: {}, summary: 'Recommend the next Learning OS task.' };
  }

  if (t.includes('generate learning plan')) {
    return { type: 'generateLearningPlan', payload: {}, summary: 'Generate a Learning OS-informed plan.' };
  }

  if (t.includes('completed') && (t.includes('sql task') || t.includes('dsa task') || t.includes('planner task') || t.includes('smart task'))) {
    const category = t.includes('sql') ? 'sql' : t.includes('dsa') ? 'coding' : undefined;
    return {
      type: 'completeSmartTask',
      payload: { category },
      summary: category ? `Mark today's ${category} smart task as complete after confirmation.` : 'Mark a matching smart task as complete after confirmation.'
    };
  }

  if ((t.includes('refresh') || t.includes('update')) && (t.includes('ai brain') || t.includes('career brain'))) {
    return {
      type: 'refreshAIBrain',
      payload: {},
      summary: 'Refresh AI Brain career summary.'
    };
  }

  if (t.includes('placement readiness') || t.includes('show readiness')) {
    return {
      type: 'showPlacementReadiness',
      payload: {},
      summary: 'Show placement readiness summary.'
    };
  }

  if (t.includes('next action') || t.includes('recommend')) {
    return {
      type: 'recommendNextAction',
      payload: {},
      summary: 'Recommend the next best career action.'
    };
  }

  if ((t.includes('update') || t.includes('mark')) && t.includes('company') && t.includes('status')) {
    const companyMatch = text.match(/company\s+([a-zA-Z0-9\s]+?)\s+status/i);
    const statusMatch = text.match(/status\s+([a-zA-Z_ ]+)/i);
    return {
      type: 'updateCompanyStatus',
      payload: { company: companyMatch?.[1]?.trim(), status: statusMatch?.[1]?.trim() },
      summary: `Update company status${companyMatch?.[1] ? ` for ${companyMatch[1].trim()}` : ''} after confirmation.`
    };
  }

  if (t.includes('interview') && (t.includes('add') || t.includes('round'))) {
    return {
      type: 'addInterviewRound',
      payload: { raw: text },
      summary: 'Add an interview round after confirmation.'
    };
  }

  if ((t.includes('oa') || t.includes('online assessment')) && (t.includes('add') || t.includes('score') || t.includes('result'))) {
    return {
      type: 'addOAResult',
      payload: { raw: text },
      summary: 'Add an OA result after confirmation.'
    };
  }

  // 1. Add Application
  // e.g., "add application Google for Software Engineer status Applied"
  // or "add company Apple"
  if (t.includes('add application') || t.includes('add company') || (t.includes('add') && t.includes('application'))) {
    const companyMatch = text.match(/(?:company|application)\s+([a-zA-Z0-9\s]+?)(?:\s+for|\s+status|\s+role|$)/i)
      || text.match(/add\s+([a-zA-Z0-9\s]+?)\s+application/i);
    const roleMatch = text.match(/for\s+([a-zA-Z0-9\s]+?)(?:\s+status|$)/i);
    const statusMatch = text.match(/status\s+([a-zA-Z0-9\s]+)/i);
    const sourceMatch = text.match(/source\s+([a-zA-Z0-9\s]+)/i);
    const priorityMatch = text.match(/priority\s+([a-zA-Z0-9\s]+)/i);

    const company = companyMatch ? companyMatch[1].trim() : 'Unknown Company';
    const role = roleMatch ? roleMatch[1].trim() : 'Software Engineer';
    const status = statusMatch ? statusMatch[1].trim() : 'Applied';

    return {
      type: 'addApplication',
      payload: { company, role, status, source: sourceMatch?.[1]?.trim(), priority: priorityMatch?.[1]?.trim() },
      summary: `Add application: "${company}" for "${role}" (Status: ${status})`
    };
  }

  // 2. German study log
  // e.g. "log 15 minutes of German" or "german 20 min"
  if (t.includes('german') && (t.includes('log') || t.includes('minute') || t.includes('min'))) {
    const minsMatch = t.match(/(\d+)\s*(?:minute|min)/);
    const minutes = minsMatch ? parseInt(minsMatch[1], 10) : 15;
    return {
      type: 'updateGermanProgress',
      payload: { minutes },
      summary: `Log ${minutes} minutes of German study progress.`
    };
  }

  // 3. Mark CS Core topic completed
  // e.g. "mark cs core deadlocks in os as done"
  if (t.includes('cs core') || t.includes('cscore')) {
    const topicMatch = text.match(/(?:core|cscore)\s+([a-zA-Z0-9\s]+?)\s+in\s+([a-zA-Z0-9\s]+?)(?:\s+as|$)/i);
    if (topicMatch) {
      return {
        type: 'markCSCoreTopic',
        payload: { topic: topicMatch[1].trim(), subject: topicMatch[2].trim() },
        summary: `Mark CS Core topic "${topicMatch[1].trim()}" in "${topicMatch[2].trim()}" as completed.`
      };
    }
  }

  // 4. Mark task as done
  // e.g. "complete daily task solve two sum"
  if (t.includes('complete') || t.includes('completed') || t.includes('mark task') || t.includes('finish task')) {
    const taskName = text.replace(/complete|completed|daily task|mark task|mark|as done|finish/gi, '').trim();
    if (taskName) {
      return {
        type: 'completeDailyTask',
        payload: { task: taskName },
        summary: `Mark task "${taskName}" as completed.`
      };
    }
  }

  // 5. Personalization, Focus, Density, and Claims
  if (t.includes('focus') || t.includes('career mode')) {
    const focusVal = t.includes('analyst') ? 'analyst' : t.includes('swe') ? 'swe' : 'general';
    return {
      type: 'setFocusMode',
      payload: { mode: focusVal },
      summary: `Set career path focus mode to: ${focusVal.toUpperCase()}`
    };
  }

  if (t.includes('density') || t.includes('layout')) {
    const densityVal = t.includes('compact') ? 'compact' : t.includes('detailed') ? 'detailed' : 'balanced';
    return {
      type: 'setDensity',
      payload: { density: densityVal },
      summary: `Set layout density to: ${densityVal}`
    };
  }

  if (t.includes('claim') && (t.includes('all') || t.includes('reward') || t.includes('badge'))) {
    return {
      type: 'claimAllAchievements',
      payload: {},
      summary: 'Claim all unlocked badge rewards for experience points.'
    };
  }

  if (t.includes('account status') || t.includes('show account')) {
    return { type: 'showAccountStatus', payload: {}, summary: 'Open Account settings.' };
  }

  if (t.includes('cloud sync status') || t.includes('show cloud sync')) {
    return { type: 'showCloudSyncStatus', payload: {}, summary: 'Open Cloud Sync settings.' };
  }

  if (t.includes('sync now') || t.includes('push to cloud')) {
    return { type: 'syncNow', payload: {}, summary: 'Preview cloud sync. User confirmation is required before changing data.' };
  }

  if (t.includes('cloud backup') && (t.includes('create') || t.includes('backup to cloud'))) {
    return { type: 'createCloudBackup', payload: {}, summary: 'Create a cloud backup after confirmation.' };
  }

  if (t.includes('show cloud backups') || t.includes('list cloud backups')) {
    return { type: 'showCloudBackups', payload: {}, summary: 'Open Cloud Backup settings.' };
  }

  if (t.includes('cloud migration') || t.includes('migrate to cloud')) {
    return { type: 'startCloudMigration', payload: {}, summary: 'Open local-to-cloud migration wizard.' };
  }

  if (t.includes('show devices') || t.includes('signed in devices')) {
    return { type: 'showDevices', payload: {}, summary: 'Open device management.' };
  }

  if (t.includes('logout')) {
    return { type: 'logoutHelp', payload: {}, summary: 'Show logout controls. Logout through command text still requires UI confirmation.' };
  }

  if (t.includes('switch to local mode') || t.includes('local only mode')) {
    return { type: 'switchToLocalMode', payload: {}, summary: 'Switch to local-only mode after confirmation.' };
  }

  if (t.includes('switch to cloud mode') || t.includes('account cloud mode')) {
    return { type: 'switchToCloudMode', payload: {}, summary: 'Open account sync setup. Login is handled only through the UI.' };
  }

  if (t.includes('security settings') || t.includes('show security')) {
    return { type: 'showSecuritySettings', payload: {}, summary: 'Open Security settings.' };
  }

  if (t.includes('sync status') || t.includes('show sync')) {
    return {
      type: 'showSyncStatus',
      payload: {},
      summary: 'Display current cloud sync connection status.'
    };
  }

  if (t.includes('export backup') || t.includes('download backup')) {
    return {
      type: 'exportBackup',
      payload: {},
      summary: 'Export complete profile data snapshot as a JSON file.'
    };
  }

  if (t.includes('performance mode') || t.includes('visual mode') || t.includes('rendering mode')) {
    const perfVal = t.includes('lightweight') ? 'lightweight' : t.includes('full') ? 'full' : 'balanced';
    return {
      type: 'setPerformanceMode',
      payload: { mode: perfVal },
      summary: `Set visual performance mode preset to: ${perfVal.toUpperCase()}`
    };
  }

  if (t.includes('storage health') || t.includes('bytes used')) {
    return {
      type: 'showStorageHealth',
      payload: {},
      summary: 'Analyze localStorage integrity and calculate bytes usage.'
    };
  }

  if (t.includes('clear cache') || t.includes('clear app cache')) {
    return {
      type: 'clearAppCache',
      payload: {},
      summary: 'Clear cached visual elements and reset registration files.'
    };
  }

  return null;
}
