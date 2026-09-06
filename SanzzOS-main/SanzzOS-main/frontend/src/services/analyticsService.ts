import { request } from './apiClient';
import { AnalyticsDashboard, AnalyticsTimeRange, PlacementReadiness } from '../types';
import { CareerState } from '../app/store/useCareerStore';
import { loadLearningState } from './learningService';
import { buildAIBrainSummary } from './aiBrainService';
import { calculatePlacementReadiness, loadPlacementOS } from './placementService';

export const ANALYTICS_CACHE_STORAGE_KEY = 'sanzz_os_analytics_cache_v1';

export interface AnalyticsService {
  getReadiness: () => Promise<PlacementReadiness>;
}

export const analyticsService: AnalyticsService = {
  getReadiness: () => request<PlacementReadiness>('/analytics/readiness')
};

const rangeDays: Record<AnalyticsTimeRange, number> = { '7d': 7, '30d': 30, '90d': 90, all: 3650 };

export function buildAnalyticsDashboard(careerState: CareerState, range: AnalyticsTimeRange = '30d'): AnalyticsDashboard {
  const learning = loadLearningState();
  const placement = loadPlacementOS();
  const aiBrain = buildAIBrainSummary(careerState);
  const days = rangeDays[range];
  const logs = Object.entries(careerState.dailyLogs || {})
    .map(([day, log]) => ({ day: Number(day), log }))
    .filter((item) => Number.isFinite(item.day))
    .sort((a, b) => a.day - b.day);
  const recentLogs = logs.slice(-days);
  const completedLogs = recentLogs.filter(({ log }) => log.status === 'completed').length;
  const totalFocusMinutes = recentLogs.reduce((sum, { log }) => sum + (log.focusMinutes || 0), 0);
  const learningMinutes = learning.sessions
    .filter((session) => range === 'all' || Date.now() - new Date(session.createdAt).getTime() <= days * 86400000)
    .reduce((sum, session) => sum + session.minutes, 0);
  const totalStudyHours = Number(((totalFocusMinutes + learningMinutes) / 60).toFixed(1));
  const weeklyStudyHours = Number((learning.paths.reduce((sum, path) => sum + path.weeklyHours, 0) + totalFocusMinutes / 60).toFixed(1));
  const monthlyStudyHours = Number((learning.sessions.filter((session) => Date.now() - new Date(session.createdAt).getTime() <= 30 * 86400000).reduce((sum, session) => sum + session.minutes, 0) / 60).toFixed(1));
  const xpTotal = careerState.xp + learning.paths.reduce((sum, path) => sum + path.xp, 0);
  const completionRate = recentLogs.length ? Math.round((completedLogs / recentLogs.length) * 100) : 0;
  const averageMastery = learning.paths.length ? Math.round(learning.paths.reduce((sum, path) => sum + path.masteryPercentage, 0) / learning.paths.length) : 0;
  const revisionBacklog = learning.revisionItems.filter((item) => item.status !== 'completed').length;
  const burnoutRisk = aiBrain.burnoutRisk;
  const placementReadiness = Math.max(aiBrain.placementReadinessScore, calculatePlacementReadiness(placement).score);
  const categoryMap = new Map<string, { hours: number; mastery: number; count: number }>();
  learning.paths.forEach((path) => {
    const current = categoryMap.get(path.category) || { hours: 0, mastery: 0, count: 0 };
    categoryMap.set(path.category, { hours: current.hours + path.totalHoursSpent, mastery: current.mastery + path.masteryPercentage, count: current.count + 1 });
  });
  const skills = learning.paths.map((path) => ({ skillId: path.id, title: path.title, hours: path.totalHoursSpent, mastery: path.masteryPercentage, weakAreas: path.weakAreas.length }));
  const categories = Array.from(categoryMap.entries()).map(([category, value]) => ({ category, hours: Number(value.hours.toFixed(1)), mastery: Math.round(value.mastery / value.count) }));
  const insights = [
    revisionBacklog > 0 ? { id: 'revision', title: 'Revision backlog exists', detail: `${revisionBacklog} item(s) need review before new learning load grows.`, severity: 'warning' as const } : { id: 'revision-clear', title: 'Revision is clear', detail: 'No urgent revision backlog in Learning OS.', severity: 'success' as const },
    averageMastery < 50 ? { id: 'mastery', title: 'Mastery needs lift', detail: 'Prioritize the weakest high-priority learning path this week.', severity: 'warning' as const } : { id: 'mastery-good', title: 'Mastery trend is usable', detail: 'Keep balancing coding, analytics, and communication.', severity: 'info' as const },
    { id: 'planner', title: 'Planner signal', detail: aiBrain.recommendedNextAction, severity: 'info' as const }
  ];

  return {
    snapshot: {
      totalStudyHours,
      weeklyStudyHours,
      monthlyStudyHours,
      xpTotal,
      completionRate,
      learningConsistencyScore: Math.round((completionRate + averageMastery) / 2),
      placementReadinessScore: placementReadiness,
      burnoutRisk,
      revisionBacklog,
      learningEfficiencyScore: Math.max(0, Math.min(100, averageMastery - revisionBacklog * 3 + Math.round(weeklyStudyHours))),
      focusBalanceScore: categories.length ? Math.min(100, Math.round(100 - Math.max(...categories.map((item) => item.hours), 0) * 2 + categories.length * 5)) : 0
    },
    weekly: [{ weekLabel: 'This week', studyHours: weeklyStudyHours, xp: xpTotal, completedTasks: completedLogs }],
    monthly: [{ monthLabel: 'This month', studyHours: monthlyStudyHours, sessions: learning.sessions.length }],
    skills,
    categories,
    productivityTrend: recentLogs.slice(-7).map(({ day, log }) => ({ label: `Day ${day}`, completionRate: log.status === 'completed' ? 100 : log.status === 'partial' ? 50 : 0, xp: log.xpEarned || 0 })),
    readinessTrend: [{ label: 'Now', readiness: placementReadiness }],
    burnoutTrend: recentLogs.slice(-7).map(({ day, log }) => ({ label: `Day ${day}`, riskScore: (log.energy || 3) <= 2 ? 75 : (log.distractions || 0) >= 4 ? 60 : 20 })),
    insights
  };
}
