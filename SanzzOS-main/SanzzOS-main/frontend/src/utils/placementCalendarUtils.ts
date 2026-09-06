import { DailyLog } from '../types';
import { DayCompletionType } from '../types/placementCalendar';

export function isMinimumDay(log: DailyLog | undefined): boolean {
  if (!log || !log.counts) return false;
  const dsa = (log.counts.leetcode >= 1 || log.counts.skillrack >= 5 || (log.counts.project || 0) > 0);
  const aptitude = (log.counts.aptitude >= 20 || log.counts.aptitude > 0);
  const sqlOrCs = (log.counts.sql >= 15 || log.counts.sql > 0 || (log.counts.cscore || 0) >= 1);
  return !!(dsa && aptitude && sqlOrCs);
}

export function isPerfectDay(log: DailyLog | undefined): boolean {
  if (!log || !log.counts) return false;
  const dsa = (log.counts.leetcode >= 2 || log.counts.skillrack >= 10);
  const aptitude = (log.counts.aptitude >= 30);
  const sql = (log.counts.sql >= 5 || log.counts.sql >= 30);
  const cs = ((log.counts.cscore || 0) >= 1);
  return !!(dsa && aptitude && sql && cs);
}

export function getCompletionType(log: DailyLog | undefined, day: number, todayDay: number): DayCompletionType {
  if (day > todayDay) return 'future';
  if (log?.freezeUsed) return 'freeze';
  if (!log) return 'missed';
  
  if (log.completionType) return log.completionType;

  if (isPerfectDay(log)) return 'perfect';
  if (isMinimumDay(log)) return 'minimum';
  
  const hasActivity = Object.values(log.counts || {}).some(val => typeof val === 'number' && val > 0);
  if (hasActivity) return 'partial';
  
  return 'missed';
}

export function getMonthName(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', { month: 'long' });
}
