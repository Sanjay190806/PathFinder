import { useCareerStore } from '../app/store/useCareerStore';
import { useUIStore } from '../app/store/useUIStore';
import { ParsedCommand } from './commandParser';
import { buildAIBrainSummary, saveAIBrainSummary } from '../services/aiBrainService';
import { completeSmartTask, generateSmartPlan, loadSmartPlan, saveSmartPlan } from '../services/smartPlannerService';
import { calculatePlacementReadiness, loadPlacementOS, savePlacementOS, updateApplicationStatus } from '../services/placementService';
import { ApplicationStatus } from '../types/placement';
import { completeRevisionItem, getDueRevisionItems, loadLearningState, logLearningSession } from '../services/learningService';
import { buildAnalyticsDashboard } from '../services/analyticsService';
import { personalizationService } from '../services/personalizationService';
import { achievementService } from '../services/achievementService';
import { ACHIEVEMENT_CATALOG } from '../data/achievementCatalog';
import syncCoreService from '../services/sync/syncService';
import { backupService } from '../services/sync/backupService';
import { storagePerformance } from './storagePerformance';
import { portfolioService } from '../services/portfolioService';
import { automationEngine } from '../services/automationEngine';
import { createTimelineEvent, getNextAction, normalizeApplicationStatus } from './applicationCrmUtils';
import { ApplicationPriority, ApplicationSource } from '../types';

export function executeCommand(cmd: ParsedCommand): boolean {
  try {
    const store = useCareerStore.getState();

    switch (cmd.type) {
      case 'addApplication': {
        const { company, role, status, source, priority } = cmd.payload;
        const normalizedStatus = normalizeApplicationStatus(status || 'Applied');
        const normalizedPriority = ['Low', 'Medium', 'High', 'Dream'].includes(priority) ? priority as ApplicationPriority : 'Medium';
        const normalizedSource = ['Company Site', 'LinkedIn', 'Referral', 'Naukri', 'Indeed', 'Campus', 'Email', 'Other'].includes(source) ? source as ApplicationSource : 'Other';

        store.addApplication({
          id: `app-${Date.now()}`,
          company,
          role,
          status: normalizedStatus,
          date: new Date().toISOString().split('T')[0],
          salary: '',
          source: normalizedSource,
          priority: normalizedPriority,
          workMode: '',
          jdKeywords: [],
          rounds: [],
          notes: '',
          risk: normalizedPriority === 'Dream' ? 'Medium' : 'Low',
          timeline: [createTimelineEvent(normalizedStatus, `${normalizedStatus} - ${company}`, role)],
          lastUpdatedAt: new Date().toISOString()
        });
        return true;
      }

      case 'updateGermanProgress': {
        const { minutes } = cmd.payload;
        store.updateGermanMinutes(minutes, undefined, 'Studied German vocabulary and phrases');
        return true;
      }

      case 'markCSCoreTopic': {
        const { topic, subject } = cmd.payload;
        store.updateCSCoreTopic(subject, topic, {
          completed: true,
          confidence: 4,
          interviewReady: true,
          lastRevisedAt: new Date().toISOString()
        });
        return true;
      }

      case 'completeDailyTask': {
        const { task } = cmd.payload;
        const currentDay = useUIStore.getState().currentDay;
        const todayLog = useCareerStore.getState().dailyLogs[currentDay];

        const note = todayLog?.note || '';
        const updatedNote = note ? `${note}\n- [x] ${task}` : `- [x] ${task}`;
        store.updateDailyLog(currentDay, { note: updatedNote });
        return true;
      }

      case 'refreshAIBrain': {
        saveAIBrainSummary(buildAIBrainSummary(useCareerStore.getState()));
        return true;
      }

      case 'generateTodayPlan': {
        const mode = cmd.payload?.mode || 'normal';
        const summary = buildAIBrainSummary(useCareerStore.getState());
        saveSmartPlan(generateSmartPlan(summary, mode));
        return true;
      }

      case 'completeSmartTask': {
        const plan = loadSmartPlan();
        if (!plan) return false;
        const category = cmd.payload?.category;
        const target = plan.tasks.find((task) => task.status !== 'completed' && (!category || task.category === category));
        if (!target) return false;
        saveSmartPlan(completeSmartTask(plan, target.id));
        return true;
      }

      case 'showPlacementReadiness':
      case 'recommendNextAction': {
        const placement = loadPlacementOS();
        calculatePlacementReadiness(placement);
        buildAIBrainSummary(useCareerStore.getState());
        return true;
      }

      case 'updateCompanyStatus': {
        const placement = loadPlacementOS();
        const companyName = String(cmd.payload?.company || '').toLowerCase();
        const company = placement.companies.find((item) => item.name.toLowerCase().includes(companyName));
        if (!company) return false;
        const rawStatus = String(cmd.payload?.status || 'preparing').toLowerCase().replace(/\s+/g, '_');
        const allowed: ApplicationStatus[] = ['not_started', 'preparing', 'applied', 'oa_scheduled', 'oa_completed', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'on_hold'];
        const status = allowed.includes(rawStatus as ApplicationStatus) ? rawStatus as ApplicationStatus : 'preparing';
        savePlacementOS(updateApplicationStatus(placement, company.id, status));
        return true;
      }

      case 'addInterviewRound':
      case 'addOAResult':
        console.info('Placement mutation command recognized; UI confirmation should collect structured fields before execution.', cmd.payload);
        return true;

      case 'logLearningSession': {
        const learning = loadLearningState();
        const rawPath = String(cmd.payload?.path || '').toLowerCase();
        const path = learning.paths.find((item) => item.title.toLowerCase().includes(rawPath) || item.id.includes(rawPath) || (rawPath === 'java' && item.id === 'java-dsa') || (rawPath === 'dsa' && item.id === 'java-dsa')) || learning.paths[0];
        if (!path) return false;
        logLearningSession(learning, {
          pathId: path.id,
          topic: cmd.payload?.topic || path.title,
          minutes: Number(cmd.payload?.minutes || 30),
          difficulty: 'medium',
          confidence: cmd.payload?.confidence || 'medium',
          notes: '',
          completed: true,
          mistakes: cmd.payload?.confidence === 'low' ? cmd.payload?.topic || path.title : '',
          nextAction: `Review ${cmd.payload?.topic || path.title}`
        });
        return true;
      }

      case 'completeRevisionItem': {
        const learning = loadLearningState();
        const due = getDueRevisionItems(learning.revisionItems)[0];
        if (!due) return false;
        completeRevisionItem(learning, due.id);
        return true;
      }

      case 'showLearningOS':
      case 'showDueRevision':
      case 'showWeakSkills':
      case 'recommendLearningTask':
        loadLearningState();
        return true;

      case 'showAnalytics':
      case 'showWeeklyAnalytics':
        buildAnalyticsDashboard(useCareerStore.getState(), cmd.type === 'showWeeklyAnalytics' ? '7d' : '30d');
        return true;

      case 'updateSkillMastery':
      case 'generateLearningPlan':
        loadLearningState();
        return true;

      case 'setFocusMode': {
        const { mode } = cmd.payload;
        const current = personalizationService.getProfile();
        current.careerMode = (mode === 'analyst' ? 'product_analyst' : (mode === 'swe' ? 'swe_core' : 'general')) as any;
        personalizationService.saveProfile(current);
        return true;
      }

      case 'setDensity': {
        const { density } = cmd.payload;
        localStorage.setItem('sanzz_os_ui_preferences_v1', density);
        window.dispatchEvent(new Event('ui_preferences_changed'));
        return true;
      }

      case 'claimAllAchievements': {
        const state = achievementService.getState();
        let added = false;
        state.unlockedIds.forEach((id: string) => {
          if (!state.claimedIds.includes(id)) {
            state.claimedIds.push(id);
            added = true;
            const ach = ACHIEVEMENT_CATALOG.find((a: any) => a.id === id);
            if (ach) {
              store.awardXP(ach.xpReward);
            }
          }
        });
        if (added) {
          achievementService.saveState(state);
        }
        return true;
      }

      case 'showSyncStatus': {
        const mode = syncCoreService.getSyncMode();
        console.log(`Sync status: ${mode}`);
        return true;
      }

      case 'showAccountStatus':
      case 'showCloudSyncStatus':
      case 'showCloudBackups':
      case 'startCloudMigration':
      case 'showDevices':
      case 'showSecuritySettings':
      case 'logoutHelp':
      case 'switchToCloudMode': {
        useUIStore.getState().setActiveSection('settings');
        window.history.pushState({}, '', '/settings');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return true;
      }

      case 'switchToLocalMode': {
        if (!window.confirm('Switch this browser to local-only mode? Cloud account data will not be deleted.')) return false;
        localStorage.setItem('sanzz_os_account_mode_v1', 'local_only');
        syncCoreService.setSyncMode('local-only');
        return true;
      }

      case 'syncNow':
      case 'createCloudBackup': {
        useUIStore.getState().setActiveSection('settings');
        window.history.pushState({}, '', '/settings');
        window.dispatchEvent(new PopStateEvent('popstate'));
        alert('Open Settings and use the Cloud Sync or Cloud Backup buttons to confirm this account action.');
        return true;
      }

      case 'exportBackup': {
        backupService.exportData();
        return true;
      }

      case 'setPerformanceMode': {
        const { mode } = cmd.payload;
        localStorage.setItem('sanzz_os_performance_settings_v1', mode);
        window.dispatchEvent(new Event('performance_settings_changed'));
        return true;
      }

      case 'showStorageHealth': {
        const health = storagePerformance.validateStorageHealth();
        console.log(`Storage health: ${health.healthy ? 'Healthy' : 'Issues found'} - Size: ${health.totalSizeKB} KB`);
        return true;
      }

      case 'showPortfolioOS': {
        useUIStore.getState().setActiveSection('portfolio_os');
        window.history.pushState({}, '', '/portfolio-os');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return true;
      }

      case 'showPortfolioReadiness': {
        const stats = portfolioService.calculateReadiness();
        alert(`Portfolio Readiness overall score: ${stats.overall}% (${stats.band})`);
        return true;
      }

      case 'showApplicationFollowUps':
      case 'showStaleApplications': {
        const applications = useCareerStore.getState().applications;
        const actionable = applications.filter((app) => {
          const action = getNextAction(app);
          if (cmd.type === 'showStaleApplications') {
            return action.label.toLowerCase().includes('ghost') || action.reason.toLowerCase().includes('days ago');
          }
          return action.urgency !== 'low';
        });
        const summary = actionable.slice(0, 5).map((app) => `${app.company}: ${getNextAction(app).label}`).join('\n');
        alert(summary || 'No urgent application follow-ups found.');
        useUIStore.getState().setActiveSection('applications');
        window.history.pushState({}, '', '/applications');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return true;
      }

      case 'showAIMentor': {
        useUIStore.getState().setActiveSection('ai_mentor');
        window.history.pushState({}, '', '/ai-mentor');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return true;
      }

      case 'generateWeeklyReview': {
        const logs = Object.values(useCareerStore.getState().dailyLogs || {});
        if (logs.length === 0) {
          alert('No checklists logs found to compile review.');
          return false;
        }
        alert('Weekly Performance Review generated successfully! Redirecting...');
        useUIStore.getState().setActiveSection('ai_mentor');
        window.history.pushState({}, '', '/ai-mentor');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return true;
      }

      case 'runAutomationCheck': {
        const runs = automationEngine.checkAndExecuteRules();
        alert(`Automation check completed. Actions executed: ${runs.length}`);
        return true;
      }

      case 'clearAppCache': {
        if (window.confirm('Clear all app storage cache?')) {
          localStorage.clear();
          window.location.reload();
        }
        return true;
      }

      default:
        console.warn('Unknown command type:', cmd.type);
        return false;
    }
  } catch (err) {
    console.error('Failed to execute command:', err);
    return false;
  }
}
