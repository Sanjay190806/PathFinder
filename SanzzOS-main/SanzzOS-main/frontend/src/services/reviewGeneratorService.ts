import { useCareerStore } from '../app/store/useCareerStore';
import { getDateForDay } from '../utils/dateUtils';
import { WeeklyReport, MonthlyReport } from '../app/store/useNotificationStore';
import { calcResumeScore, calcPlacementScore } from '../utils/xpUtils';

export const reviewGeneratorService = {
  generateWeeklyReview(weekNumber: number): WeeklyReport {
    const state = useCareerStore.getState();
    const { dailyLogs, userProfile } = state;
    const startDate = userProfile.startDate;

    const startDay = (weekNumber - 1) * 7 + 1;
    const endDay = weekNumber * 7;

    let studyMinutes = 0;
    let tasksCompleted = 0;
    let xpGained = 0;
    let perfectDays = 0;
    let missedDays = 0;

    // Track completed counts for categories to find strong/weak areas
    const totals = {
      leetcode: 0,
      skillrack: 0,
      aptitude: 0,
      sql: 0,
      cscore: 0,
      german: 0,
      project: 0,
      resume: 0,
    };

    for (let d = startDay; d <= endDay; d++) {
      const log = dailyLogs[d];
      if (log) {
        studyMinutes += log.focusMinutes || 0;
        xpGained += log.xpEarned || 0;

        if (log.completionType === 'perfect') perfectDays++;
        else if (log.completionType === 'missed') missedDays++;

        const c = log.counts || {};
        totals.leetcode += c.leetcode || 0;
        totals.skillrack += c.skillrack || 0;
        totals.aptitude += c.aptitude || 0;
        totals.sql += c.sql || 0;
        totals.cscore += c.cscore || 0;
        totals.german += c.german || 0;
        totals.project += c.project || 0;
        totals.resume += c.resume || 0;

        // Sum up completed counts
        tasksCompleted += Object.values(c).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
      } else {
        missedDays++;
      }
    }

    // Determine weakest and strongest skill categories based on totals
    const entries = Object.entries(totals) as [keyof typeof totals, number][];
    const sorted = [...entries].sort((a, b) => b[1] - a[1]);
    const strongestSkill = sorted[0]?.[1] > 0 ? sorted[0][0] : 'None';
    const weakestSkill = [...sorted].reverse().find(([k]) => k !== 'german')?.[0] || 'None';

    const weekKey = `${startDate.substring(0, 4)}-Week-${weekNumber}`;

    // Simple heuristic-based recommendation
    let aiRecommendation = '';
    if (missedDays > 3) {
      aiRecommendation = 'Consistent daily habits are slipping. Prioritize completing just ONE Minimum Day Checklist task tomorrow to kickstart your momentum.';
    } else if (totals.leetcode < 3) {
      aiRecommendation = 'DSA solving count is low this week. Focus on resolving the due patterns in your Roadmap rotation first.';
    } else if (studyMinutes < 120) {
      aiRecommendation = 'Low study focus hours. Try booking two shorter 25-minute Pomodoro sprints in your daily calendar agenda.';
    } else {
      aiRecommendation = 'Superb execution streak! Continue push efforts. Consider scheduling a mock interview to benchmark your current speed.';
    }

    return {
      weekKey,
      studyHours: Math.round((studyMinutes / 60) * 10) / 10,
      tasksCompleted,
      xpGained,
      achievements: perfectDays >= 5 ? ['Consistency Master'] : [],
      weakestSkill: weakestSkill.toUpperCase(),
      strongestSkill: strongestSkill.toUpperCase(),
      aiRecommendation,
      generatedAt: new Date().toISOString(),
    };
  },

  generateMonthlyReview(year: number, monthZeroIndexed: number): MonthlyReport {
    const state = useCareerStore.getState();
    const { dailyLogs, userProfile } = state;
    const startDate = userProfile.startDate;

    const monthKey = `${year}-${String(monthZeroIndexed + 1).padStart(2, '0')}`;

    let totalDaysLogged = 0;
    let perfectDays = 0;
    let minDays = 0;
    let totalLogs = 0;

    // Check all logs to see which dates match the month
    Object.entries(dailyLogs).forEach(([dayStr, log]) => {
      const dayNum = Number(dayStr);
      const date = getDateForDay(dayNum, startDate);
      if (date.getFullYear() === year && date.getMonth() === monthZeroIndexed) {
        totalLogs++;
        if (log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect') {
          totalDaysLogged++;
          if (log.completionType === 'perfect') perfectDays++;
          else minDays++;
        }
      }
    });

    const consistencyScore = totalLogs > 0 ? Math.round((totalDaysLogged / totalLogs) * 100) : 0;
    const resumeProgress = calcResumeScore(state);
    const placementScore = calcPlacementScore(state);

    // Simple monthly summary compile
    let monthSummary = '';
    if (consistencyScore >= 80) {
      monthSummary = 'Excellent month showing high consistency levels and steady progress. Keep up the high standard.';
    } else if (consistencyScore >= 50) {
      monthSummary = 'Moderate consistency this month. Focus on converting partial study blocks into clean minimum target completions next month.';
    } else {
      monthSummary = 'Consistency requires structural support. Use calendar scheduling to protect study slots ahead of distraction risk.';
    }

    // Projects progress calculation
    const projProgresses = Object.values(state.projects || {}).map((p) => {
      const valSum = Object.values(p.progress || {}).reduce((a, b) => a + b, 0);
      return valSum / 6;
    });
    const projectProgress = projProgresses.length > 0 ? Math.round(projProgresses.reduce((a, b) => a + b, 0) / projProgresses.length) : 0;

    return {
      monthKey,
      monthSummary,
      learningTrend: [consistencyScore],
      placementReadinessTrend: [placementScore],
      resumeProgress,
      projectProgress,
      consistencyScore,
      generatedAt: new Date().toISOString(),
    };
  },
};

export default reviewGeneratorService;
