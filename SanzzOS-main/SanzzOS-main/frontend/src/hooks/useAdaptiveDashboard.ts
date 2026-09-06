import { useCareerStore } from '../app/store/useCareerStore';
import { useUIStore } from '../app/store/useUIStore';
import { adaptiveStateService } from '../services/adaptiveStateService';


export function useAdaptiveDashboard() {
  const currentDay = useUIStore((s) => s.currentDay);
  const careerState = useCareerStore((s) => s);

  const todayLog = careerState.dailyLogs[currentDay];
  
  // Calculate completed task count for today
  let completedCounts = 0;
  if (todayLog && todayLog.counts) {
    completedCounts = Object.values(todayLog.counts).filter(c => (c as number) > 0).length;
  }

  // Calculate inactivity
  const startDateStr = careerState.userProfile?.startDate || '2026-07-01';
  const diffTime = Math.abs(new Date().getTime() - new Date(startDateStr).getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Inactivity index based on last logged day keys
  const logDays = Object.keys(careerState.dailyLogs || {}).map(Number).sort((a,b)=>b-a);
  const lastActiveDay = logDays.length > 0 ? logDays[0] : 0;
  const currentDayNum = Math.min(180, Math.max(1, diffDays));
  const inactivityDays = Math.max(0, currentDayNum - lastActiveDay);

  const config = adaptiveStateService.evaluateDashboard(
    completedCounts,
    inactivityDays
  );

  return {
    showNoZeroDay: config.showNoZeroDay,
    showComeback: config.showComeback,
    inactivityDays
  };
}
export default useAdaptiveDashboard;
