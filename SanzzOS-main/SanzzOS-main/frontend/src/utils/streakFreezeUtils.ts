import { DailyLog } from '../types';
import { getTodayDay } from './dateUtils';

// Helper to get week key in format YYYY-WW
export function getWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function canUseFreeze(date: Date, weeklyFreezeUsage: Record<string, boolean> = {}): boolean {
  const weekKey = getWeekKey(date);
  return !weeklyFreezeUsage[weekKey];
}

export function getFreezesLeftForWeek(date: Date, weeklyFreezeUsage: Record<string, boolean> = {}): number {
  const weekKey = getWeekKey(date);
  return weeklyFreezeUsage[weekKey] ? 0 : 1;
}

export function isDayActive(log?: DailyLog): boolean {
  if (!log) return false;
  if (log.status === 'completed' || log.completionType === 'minimum' || log.completionType === 'perfect' || log.rescueCompleted === true) {
    return true;
  }
  if (log.lcStatus && log.lcStatus.length > 0) return true;
  const c = log.counts;
  if (c && (c.leetcode > 0 || c.skillrack > 0 || c.aptitude > 0 || c.sql > 0 || c.cscore > 0 || c.german > 0 || c.project > 0 || c.resume > 0)) {
    return true;
  }
  if ((log.focusMinutes || 0) >= 15) return true;
  if (log.customMaterials && log.customMaterials.some(m => m.completed)) return true;
  return false;
}

export function calculateStreakWithFreezes(dailyLogs: Record<string, DailyLog>, startDate: string): { currentStreak: number; longestStreak: number } {
  const todayDay = getTodayDay(startDate);
  
  let activeStreak = 0;
  let longestStreak = 0;
  
  // 1. Calculate historical longest streak
  for (let d = 1; d <= todayDay; d++) {
    const log = dailyLogs[d];
    if (log?.freezeUsed) {
      continue;
    }
    if (isDayActive(log)) {
      activeStreak++;
      longestStreak = Math.max(longestStreak, activeStreak);
    } else {
      if (d < todayDay) {
        activeStreak = 0; // Missed day resets running streak
      }
    }
  }

  // 2. Duolingo Current Streak:
  // - If today is active -> 1 + all contiguous preceding active/frozen days
  // - If today is not active yet:
  //     - If yesterday was active/frozen -> streak is preserved from yesterday (alive until midnight)
  //     - If yesterday was missed -> streak has RESET TO 0!
  let currentStreak = 0;
  const todayLog = dailyLogs[todayDay];
  const todayActive = isDayActive(todayLog);

  if (todayActive) {
    currentStreak = 1;
    let d = todayDay - 1;
    while (d >= 1) {
      const prev = dailyLogs[d];
      if (prev?.freezeUsed) {
        d--;
        continue;
      }
      if (isDayActive(prev)) {
        currentStreak++;
        d--;
      } else {
        break; // Streak terminates at first missed day
      }
    }
  } else if (todayDay > 1) {
    let d = todayDay - 1;
    const yestLog = dailyLogs[d];
    if (isDayActive(yestLog) || yestLog?.freezeUsed) {
      while (d >= 1) {
        const prev = dailyLogs[d];
        if (prev?.freezeUsed) {
          d--;
          continue;
        }
        if (isDayActive(prev)) {
          currentStreak++;
          d--;
        } else {
          break;
        }
      }
    } else {
      // Missed yesterday -> Streak resets to 0!
      currentStreak = 0;
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak)
  };
}
