import { CareerState } from '../app/store/useCareerStore';
import { calcPlacementScore, calcResumeScore, calcConsistencyScore } from './xpUtils';
import { getTodayDay } from './dateUtils';
import { DailyLog } from '../types';
import { GermanLessonProgress } from '../types/german';

export interface IntelligenceSignal {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'risk';
  detail: string;
}

export function buildCareerIntelligence(state: CareerState) {
  const placement = calcPlacementScore(state);
  const resume = calcResumeScore(state);
  const consistency = calcConsistencyScore(state);
  const day = getTodayDay(state.userProfile.startDate);
  const completedDays = (Object.values(state.dailyLogs || {}) as DailyLog[]).filter((log) => log.status === 'completed').length;
  const projectCount = Object.keys(state.projects || {}).length;
  const completedGermanLessons = (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).filter((lesson) => lesson.completed).length;
  const weakWords = state.weakWords?.length || 0;
  const readingLoad = Math.max(0, Math.min(100, 100 - weakWords * 6 + completedGermanLessons * 2));

  const signals: IntelligenceSignal[] = [
    {
      label: 'Placement momentum',
      value: `${placement}%`,
      status: placement >= 70 ? 'good' : placement >= 45 ? 'warning' : 'risk',
      detail: 'Blends DSA, resume, projects, and consistency.',
    },
    {
      label: 'Resume health',
      value: `${resume}%`,
      status: resume >= 75 ? 'good' : resume >= 50 ? 'warning' : 'risk',
      detail: 'Ats score and section coverage.',
    },
    {
      label: 'Consistency',
      value: `${consistency}%`,
      status: consistency >= 70 ? 'good' : consistency >= 45 ? 'warning' : 'risk',
      detail: 'Daily completion rhythm over time.',
    },
    {
      label: 'German readiness',
      value: `${completedGermanLessons} lessons`,
      status: completedGermanLessons >= 12 ? 'good' : completedGermanLessons >= 6 ? 'warning' : 'risk',
      detail: 'Lesson, speaking, and listening momentum.',
    },
    {
      label: 'Project breadth',
      value: `${projectCount}`,
      status: projectCount >= 2 ? 'good' : 'warning',
      detail: 'Number of active showcase workspaces.',
    },
    {
      label: 'Today coverage',
      value: `${completedDays}/180`,
      status: completedDays >= day ? 'good' : 'warning',
      detail: 'Completed log days versus tracker day.',
    },
  ];

  return {
    placement,
    resume,
    consistency,
    day,
    completedDays,
    projectCount,
    completedGermanLessons,
    weakWords,
    readingLoad,
    signals,
  };
}

