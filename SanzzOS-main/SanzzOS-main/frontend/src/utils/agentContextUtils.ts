import { CareerState } from '../app/store/useCareerStore';
import { ROADMAP } from '../data/roadmap';
import { GERMAN_LESSONS } from '../data/germanLessons';
import { calcConsistencyScore, calcPlacementBreakdown, calcResumeScore, getStreak } from './xpUtils';
import { CompactAgentContext } from '../types/shaylaAgent';
import { getTodayDay } from './dateUtils';
import { ActivityCounts } from '../types';

const clampText = (text: string, limit = 120): string => {
  if (text.length <= limit) return text;
  return `${text.slice(0, Math.max(0, limit - 12)).trimEnd()}...[trimmed]`;
};

const summarizeCounts = (counts: ActivityCounts | undefined): string => {
  if (!counts) return 'no logged counts';
  const entries = Object.entries(counts)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => `${key}:${value}`)
    .slice(0, 6);
  return entries.length > 0 ? entries.join(', ') : 'no logged counts';
};

const summarizeProjectProgress = (project: any): number => {
  const values = Object.values((project?.progress || {}) as Record<string, number>);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + Number(value || 0), 0);
  return Math.round(total / values.length);
};

export function buildAgentContext(state: CareerState, selectedDay = getTodayDay(state.userProfile.startDate)): CompactAgentContext {
  const day = Number.isFinite(selectedDay) ? selectedDay : getTodayDay(state.userProfile.startDate);
  const roadmapDay = ROADMAP[String(day)] || [];
  const todaysTopic = roadmapDay[0]?.topic || roadmapDay[0]?.title || 'Revision';

  const sortedDays = Object.keys(state.dailyLogs || {})
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => b - a);

  const recentDays = sortedDays.slice(0, 5);
  const recentLogs = recentDays.map((logDay) => {
    const log = state.dailyLogs[String(logDay)];
    return {
      day: logDay,
      status: log?.status || 'not_started',
      mood: log?.mood,
      energy: log?.energy,
      countsSummary: summarizeCounts(log?.counts),
    };
  });

  const completedTasks = recentLogs
    .filter((log) => log.status === 'completed')
    .map((log) => `Day ${log.day}`);

  const missedTasks = recentLogs
    .filter((log) => log.status === 'missed')
    .map((log) => `Day ${log.day}`)
    .slice(0, 5);

  const weakDsaPatterns = Object.entries(state.dsaPatternMastery || {})
    .filter(([, mastery]) => mastery.mastery !== 'Interview Ready')
    .sort((a, b) => (a[1].confidenceCount || 0) - (b[1].confidenceCount || 0))
    .map(([pattern, mastery]) => `${pattern} (${mastery.mastery})`)
    .slice(0, 6);

  const csSubjects = ['dbms', 'os', 'cn', 'oop'];
  const csSubjectId = csSubjects[(day - 1) % csSubjects.length];
  const subjectProgress = state.csCoreProgress?.[csSubjectId] || {};
  const currentSubjectTopic = Object.entries(subjectProgress).find(([, progress]) => !progress.completed)?.[0]
    || Object.keys(subjectProgress)[0]
    || null;

  const currentLesson = GERMAN_LESSONS.find((lesson) => lesson.id === state.currentLessonId)
    || GERMAN_LESSONS.find((lesson) => !lesson.completed)
    || GERMAN_LESSONS[0];

  const projectProgress = Object.entries(state.projects || {})
    .slice(0, 6)
    .map(([name, project]) => ({
      name: clampText(name, 40),
      progress: summarizeProjectProgress(project),
    }));

  const applications = (state.applications || [])
    .slice(0, 5)
    .map((app) => ({
      company: clampText(app.company || 'Unknown', 32),
      role: clampText(app.role || 'Role', 28),
      status: clampText(app.status || 'unknown', 18),
    }));

  const placementBreakdown = calcPlacementBreakdown(state);
  const resumeScore = calcResumeScore(state);
  const consistencyScore = calcConsistencyScore(state);

  return {
    day,
    streak: getStreak(state),
    selectedDay: day,
    currentTopic: todaysTopic,
    mood: state.dailyLogs[String(day)]?.mood,
    energy: state.dailyLogs[String(day)]?.energy,
    distractions: state.dailyLogs[String(day)]?.distractions,
    completedTasks,
    missedTasks,
    weakDsaPatterns,
    csCoreDue: currentSubjectTopic ? { subject: csSubjectId.toUpperCase(), topic: currentSubjectTopic } : null,
    germanLesson: currentLesson
      ? {
          lessonId: currentLesson.id,
          title: currentLesson.title,
          level: currentLesson.level,
          objective: currentLesson.objective,
          completed: !!state.completedLessons?.[currentLesson.id]?.completed,
          locked: !!currentLesson.locked,
        }
      : null,
    germanLevel: state.germanLevel,
    germanStreak: state.germanStreak,
    resumeScore,
    placementScore: placementBreakdown.score,
    consistencyScore,
    skillRackSolved: state.skillRackStats?.totalSolved || 0,
    sqlSolved: (Object.values(state.sqlProgress || {}) as { completed: boolean }[]).filter((topic) => topic.completed).length,
    aptitudeSolved: (Object.values(state.aptitudeProgress || {}) as { questionsSolved: number }[]).reduce((sum, topic) => sum + (topic.questionsSolved || 0), 0),
    projectProgress,
    applications,
    recentLogs,
    todayProblems: roadmapDay.map((problem) => ({
      title: clampText(problem.title, 60),
      difficulty: problem.difficulty,
      pattern: clampText(problem.pattern, 40),
    })),
    recentMissedTasks: missedTasks,
    activeMode: undefined,
  };
}
