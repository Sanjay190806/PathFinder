import { AchievementState } from '../types/achievements';
import { ACHIEVEMENT_CATALOG } from '../data/achievementCatalog';

const STORAGE_KEY = 'sanzz_os_achievements_v1';

const emptyState = (): AchievementState => ({
  unlockedIds: [],
  claimedIds: [],
  progress: {}
});

const normalizeState = (value: Partial<AchievementState> | null | undefined): AchievementState => ({
  unlockedIds: Array.isArray(value?.unlockedIds) ? value.unlockedIds : [],
  claimedIds: Array.isArray(value?.claimedIds) ? value.claimedIds : [],
  progress: value?.progress && typeof value.progress === 'object' ? value.progress : {}
});

const toList = <T = any>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') return Object.values(value as Record<string, T>);
  return [];
};

export const achievementService = {
  getState(): AchievementState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return normalizeState(JSON.parse(stored) as Partial<AchievementState>);
      }
    } catch (e) {
      console.warn('Failed parsing achievements state:', e);
    }
    return emptyState();
  },

  saveState(state: AchievementState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      window.dispatchEvent(new Event('achievements_changed'));
    } catch (e) {
      console.error('Failed saving achievements state:', e);
    }
  },

  evaluateAll(careerState: any): { unlockedThisSession: string[] } {
    const state = this.getState();
    const newlyUnlocked: string[] = [];

    // Helper to evaluate and set progress
    const setProgress = (id: string, current: number) => {
      const achievement = ACHIEVEMENT_CATALOG.find((a) => a.id === id);
      if (!achievement) return;

      const target = achievement.progressTarget;
      const progressVal = Math.min(target, Math.max(0, current));
      state.progress[id] = progressVal;

      // If unlocked and not yet in state, record it
      if (progressVal >= target && !state.unlockedIds.includes(id)) {
        state.unlockedIds.push(id);
        newlyUnlocked.push(id);
        // Trigger a custom unlock event for overlay notifications
        const event = new CustomEvent('achievement_unlocked', { detail: { id, title: achievement.title } });
        window.dispatchEvent(event);
      }
    };

    // 1. Gather all study metrics from careerState safely
    const totalDays = careerState.userProfile?.totalDays || 0;
    const streak = careerState.userProfile?.streak || 0;

    // LeetCode problems
    const problemLogs = careerState.problemLogs || {};
    const dsaCount = Object.keys(problemLogs).length;
    const arrayCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase() === 'array').length;
    const stringCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase() === 'string').length;
    const hashCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase() === 'hashmap' || p.category?.toLowerCase() === 'map').length;
    const twoPtrCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase()?.includes('pointer') || p.category?.toLowerCase()?.includes('sliding')).length;
    const binaryCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase()?.includes('binary')).length;
    const listCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase()?.includes('list')).length;
    const stackCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase()?.includes('stack') || p.category?.toLowerCase()?.includes('queue')).length;
    const dpCount = Object.values(problemLogs).filter((p: any) => p.category?.toLowerCase()?.includes('dynamic') || p.category?.toLowerCase() === 'dp').length;

    // Daily activity counts summed from dailyLogs
    let sqlCount = 0;
    let skillrackCount = 0;
    let aptitudeCount = 0;
    let germanCount = 0;
    let projectCount = 0;
    
    if (careerState.dailyLogs) {
      Object.values(careerState.dailyLogs).forEach((log: any) => {
        if (log.counts) {
          sqlCount += log.counts.sql || 0;
          skillrackCount += log.counts.skillrack || 0;
          aptitudeCount += log.counts.aptitude || 0;
          germanCount += log.counts.german || 0;
          projectCount += log.counts.project || 0;
        }
      });
    }

    // German parameters
    const deXP = careerState.germanXP || 0;
    const deStreak = careerState.germanStreak || 0;
    const deSpeakingCount = careerState.germanSpeakingStreak || 0;
    const deListeningMinutes = careerState.germanListeningMinutes || 0;

    // Projects OS
    const projectsList = toList(careerState.projects);
    const bugCount = projectsList.reduce((acc: number, p: any) => acc + (p.bugs?.filter((b: any) => b.status === 'fixed')?.length || 0), 0);
    const releaseCount = projectsList.reduce((acc: number, p: any) => acc + (p.releases?.length || 0), 0);
    const flagshipProject = projectsList[0];
    const readmeScore = flagshipProject?.readmeScore || 0;

    // Resume Manager
    const resumeAts = careerState.resume?.atsScore || 0;
    const checklistChecked = careerState.resume?.checklist ? Object.values(careerState.resume.checklist).filter(Boolean).length : 0;
    const checklistTotal = careerState.resume?.checklist ? Object.keys(careerState.resume.checklist).length : 1;
    const resumeChecklistPercent = Math.round((checklistChecked / checklistTotal) * 100);

    // Placement OS
    const targetCompanies = toList(careerState.companies || careerState.companyTargets || careerState.applications);
    const activeApplications = targetCompanies.filter((c: any) => c.status && c.status !== 'wishlist').length;
    const oaApplications = targetCompanies.filter((c: any) => c.status?.toLowerCase() === 'oa' || c.status?.toLowerCase()?.includes('test')).length;
    const interviewApplications = targetCompanies.filter((c: any) => c.status?.toLowerCase() === 'interview').length;
    const placementReadiness = careerState.readinessScore || 0;

    // Interview coach behaviors
    const behaviorStories = toList(careerState.stories);

    // Run trigger checks
    setProgress('daily_1', totalDays >= 1 ? 1 : 0);
    setProgress('daily_2', totalDays >= 1 ? 1 : 0);
    setProgress('daily_3', streak >= 3 ? 3 : 0);
    setProgress('daily_4', streak >= 7 ? 7 : 0);
    setProgress('daily_5', streak >= 14 ? 14 : 0);
    setProgress('daily_6', streak >= 30 ? 30 : 0);
    setProgress('daily_7', streak >= 60 ? 60 : 0);
    setProgress('daily_8', streak >= 100 ? 100 : 0);
    setProgress('daily_9', streak >= 180 ? 180 : 0);

    setProgress('dsa_1', dsaCount >= 1 ? 1 : 0);
    setProgress('dsa_2', dsaCount);
    setProgress('dsa_3', dsaCount);
    setProgress('dsa_4', dsaCount);
    setProgress('dsa_5', dsaCount);
    setProgress('dsa_6', dsaCount);
    setProgress('dsa_7', arrayCount);
    setProgress('dsa_8', stringCount);
    setProgress('dsa_9', hashCount);
    setProgress('dsa_10', twoPtrCount);
    setProgress('dsa_11', binaryCount);
    setProgress('dsa_12', listCount);
    setProgress('dsa_13', stackCount);
    setProgress('dsa_15', dpCount);

    setProgress('sr_1', skillrackCount >= 1 ? 1 : 0);
    setProgress('sr_2', skillrackCount);
    setProgress('sr_3', skillrackCount);
    setProgress('sr_4', skillrackCount);

    setProgress('sql_1', sqlCount >= 1 ? 1 : 0);
    setProgress('sql_2', sqlCount);
    setProgress('sql_3', sqlCount);
    setProgress('sql_5', sqlCount);
    setProgress('sql_9', sqlCount);
    setProgress('sql_10', sqlCount);

    setProgress('apt_1', aptitudeCount >= 1 ? 1 : 0);
    setProgress('apt_6', aptitudeCount);
    setProgress('apt_7', aptitudeCount);

    setProgress('de_1', germanCount >= 1 ? 1 : 0);
    setProgress('de_3', deStreak);
    setProgress('de_4', deSpeakingCount >= 1 ? 1 : 0);
    setProgress('de_5', deSpeakingCount);
    setProgress('de_7', deListeningMinutes);
    setProgress('de_8', deXP);
    setProgress('de_9', deXP);

    setProgress('proj_1', projectsList.length >= 1 ? 1 : 0);
    setProgress('proj_5', projectCount >= 1 ? 1 : 0);
    setProgress('proj_6', bugCount);
    setProgress('proj_7', releaseCount);
    setProgress('proj_8', readmeScore);
    setProgress('proj_10', projectsList.length);

    setProgress('res_1', resumeAts >= 1 ? 1 : 0);
    setProgress('res_2', resumeChecklistPercent);
    setProgress('res_3', resumeChecklistPercent);
    setProgress('res_4', resumeChecklistPercent);
    setProgress('res_5', resumeChecklistPercent >= 100 ? 100 : 0);

    setProgress('place_1', targetCompanies.length >= 1 ? 1 : 0);
    setProgress('place_2', activeApplications);
    setProgress('place_3', oaApplications);
    setProgress('place_4', interviewApplications);
    setProgress('place_8', placementReadiness);
    setProgress('place_9', placementReadiness);
    setProgress('place_10', placementReadiness);

    setProgress('int_1', behaviorStories.length >= 1 ? 1 : 0);
    setProgress('int_2', behaviorStories.length);

    this.saveState(state);

    return {
      unlockedThisSession: newlyUnlocked
    };
  }
};
export default achievementService;
