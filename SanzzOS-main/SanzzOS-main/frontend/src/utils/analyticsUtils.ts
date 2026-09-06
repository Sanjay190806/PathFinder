import { CareerState, BurnoutAssessment, StudyVelocity } from '../types';
import { getTodayDay } from './dateUtils';

export function assessBurnoutRisk(s: CareerState): BurnoutAssessment {
  const today = getTodayDay(s.userProfile.startDate);
  const recentDays = 7;
  let lowEnergyCount = 0;
  let partialCount = 0;
  let loggedDaysCount = 0;
  let totalDistractions = 0;

  for (let i = 0; i < recentDays; i++) {
    const d = today - i;
    if (d < 1) break;
    const l = s.dailyLogs[d];
    if (l) {
      loggedDaysCount++;
      if (l.energy && l.energy <= 2) lowEnergyCount++;
      if (l.status === 'partial' || l.status === 'in_progress') partialCount++;
      totalDistractions += l.distractions || 0;
    }
  }

  const distractionRating = loggedDaysCount > 0 ? (totalDistractions / loggedDaysCount) : 0;
  
  if (loggedDaysCount === 0) {
    return { riskLevel: 'Low', energyTrend: 3, distractionRating: 0 };
  }

  const ratio = (lowEnergyCount + partialCount) / (loggedDaysCount * 2);
  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (ratio > 0.6) riskLevel = 'High';
  else if (ratio > 0.3) riskLevel = 'Moderate';

  return {
    riskLevel,
    energyTrend: 5 - (lowEnergyCount / loggedDaysCount) * 4,
    distractionRating
  };
}

export function getStudyVelocity(s: CareerState): StudyVelocity {
  const today = getTodayDay(s.userProfile.startDate);
  let totalProblems = 0;
  let totalMinutes = 0;
  let activeDays = 0;

  for (let i = 0; i < 7; i++) {
    const d = today - i;
    if (d < 1) break;
    const l = s.dailyLogs[d];
    if (l) {
      activeDays++;
      totalProblems += l.lcStatus?.length || 0;
      totalMinutes += l.focusMinutes || 0;
    }
  }

  return {
    avgProblemsPerDay: activeDays > 0 ? (totalProblems / activeDays) : 0,
    totalProblemsLastWeek: totalProblems,
    focusMinutesAvg: activeDays > 0 ? (totalMinutes / activeDays) : 0
  };
}
