import { CareerState } from '../types';
import { getTodayDay } from './dateUtils';
import { getTotalLCSolved, getStreak, calcResumeScore, calcPlacementScore } from './xpUtils';
import { ROADMAP } from '../data/roadmap';
import { GERMAN_LESSONS } from '../data/germanLessons';
import { useCalendarStore } from '../app/store/useCalendarStore';
import { useNotificationStore } from '../app/store/useNotificationStore';
import { mockInterviewService } from '../services/mockInterviewService';
import { companyIntelligenceService } from '../services/companyIntelligenceService';
import { portfolioService } from '../services/portfolioService';
import { useAIMentorStore } from '../app/store/useAIMentorStore';

export function buildAIContext(s: CareerState): any {
  const today = getTodayDay(s.userProfile.startDate);
  const todayProblems = ROADMAP[String(today)] || [];
  const todayLog = s.dailyLogs?.[today];
  const counts = todayLog?.counts || {};
  const recentDailyLogs = Object.entries(s.dailyLogs || {})
    .map(([day, log]) => ({ day: Number(day), status: log.status, note: log.note, focusMinutes: log.focusMinutes, german: log.counts?.german || 0 }))
    .sort((a, b) => a.day - b.day)
    .slice(-7);

  const completedTasks = Object.entries(counts)
    .filter(([, value]) => Number(value) > 0)
    .map(([key, value]) => `${key}:${value}`);
  const missedTasks = ['leetcode', 'skillrack', 'aptitude', 'sql', 'cscore', 'project'].filter((key) => Number((counts as any)[key] || 0) === 0);
  const weakDSAPatterns = Object.entries(s.dsaPatternMastery || {})
    .filter(([, value]) => value.mastery === 'Learning' || value.mastery === 'Not Started')
    .slice(0, 5)
    .map(([pattern]) => pattern);
  const revisionQueueCount = Object.values(s.problemLogs || {}).filter((log) => log.revisitFlag).length;
  const germanVocabularyKnown = Object.values(s.vocabulary || {}).filter((item) => item.status === 'known').length;
  const currentGermanLesson = GERMAN_LESSONS.find((lesson) => lesson.id === s.currentLessonId) || GERMAN_LESSONS[0];
  const applicationsPipeline = (s.applications || []).reduce<Record<string, number>>((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});
  const recentWeeklyReportSummary = recentDailyLogs
    .map((log) => `Day ${log.day}: ${log.status || 'not_saved'}, focus ${log.focusMinutes || 0}m`)
    .join('; ');

  return {
    currentRoute: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
    currentDay: today,
    selectedDay: today,
    roadmapDay: today,
    primaryFocus: 'College placement readiness for top software roles',
    calendarEvents: useCalendarStore.getState().events.map(e => ({ title: e.title, start: e.start, type: e.type, status: e.status })),
    activeNotifications: useNotificationStore.getState().notifications.filter(n => !n.read).map(n => ({ title: n.title, message: n.message, priority: n.priority })),
    dailyAgenda: useNotificationStore.getState().agendas[today] || null,
    mockInterviewStats: {
      totalSessions: mockInterviewService.compileMockStats().totalSessions,
      avgConfidence: mockInterviewService.compileMockStats().avgConfidenceAnswers,
      weakestArea: mockInterviewService.compileMockStats().weakestArea,
      avgCommunication: mockInterviewService.compileMockStats().avgCommunicationScore,
    },
    targetCompanies: companyIntelligenceService.getCompanies().map(c => ({ name: c.name, category: c.category, readinessScore: c.readinessScore })),
    portfolioReadiness: portfolioService.calculateReadiness().overall,
    activeMentorMissions: useAIMentorStore.getState().missions.filter(m => !m.completed).map(m => m.title),
    primaryPrep: ['Java DSA', 'SkillRack', 'Aptitude', 'SQL', 'CS Core', 'Projects', 'Resume', 'Consistency'],
    secondaryLongTerm: ['German A1/A2 for Germany readiness', 'AI product builder and future founder path'],
    currentTopic: todayProblems[0]?.topic || 'Revision',
    todayProblems: todayProblems.map((problem) => problem.title),
    todayLeetCodeProblems: todayProblems.slice(0, 2).map((problem) => ({ title: problem.title, topic: problem.topic, difficulty: problem.difficulty })),
    leetcodeSolved: getTotalLCSolved(s),
    weakDSAPatterns,
    revisionQueueCount,
    dailyTargets: {
      leetcode: todayProblems.slice(0, 2).map((problem) => problem.title),
      skillrack: 10,
      aptitude: 30,
      sql: 5,
      csCoreTopics: 1,
      germanMinutes: 20,
      projectMinutes: 30
    },
    completedTasks,
    missedTasks,
    mood: todayLog?.mood ?? null,
    energy: todayLog?.energy ?? null,
    distractions: todayLog?.distractions ?? null,
    currentStreak: getStreak(s),
    skillRackSolved: s.skillRackStats?.totalSolved || 0,
    skillRackTotal: s.skillRackStats?.totalSolved || 0,
    sqlProgress: Object.keys(s.sqlProgress || {}).filter((key) => s.sqlProgress?.[key]?.completed).length,
    aptitudeProgress: Object.keys(s.aptitudeProgress || {}).filter((key) => s.aptitudeProgress?.[key]?.completed).length,
    csCoreProgress: Object.values(s.csCoreProgress || {}).reduce((sum, subject) => sum + Object.values(subject).filter((topic) => topic.completed).length, 0),
    resumeScore: calcResumeScore(s),
    placementScore: calcPlacementScore(s),
    projectProgress: Object.values(s.projects || {}).reduce((sum, project) => {
      const progress = project.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
      return sum + Math.round((progress.backend + progress.frontend + progress.ai + progress.testing + progress.docs + progress.deploy) / 6);
    }, 0),
    applicationsCount: (s.applications || []).length,
    applicationsPipeline,
    germanLevel: s.germanLevel || 'A1 Beginner',
    germanStreak: s.germanStreak || 0,
    germanXP: s.germanXP || 0,
    currentGermanLesson: currentGermanLesson ? {
      id: currentGermanLesson.id,
      order: currentGermanLesson.order,
      title: currentGermanLesson.title,
      level: currentGermanLesson.level,
      objective: currentGermanLesson.objective
    } : null,
    todayGermanPhrase: recentDailyLogs.length > 0 ? 'Ich lerne jeden Tag ein bisschen Deutsch.' : 'Kleine Schritte, grosser Fortschritt.',
    weakGermanWords: s.weakWords || [],
    germanVocabularyKnown,
    recentWeeklyReportSummary,
    recentDailyLogs
  };
}

export function generateDailyBriefContext(s: CareerState): any {
  const ctx = buildAIContext(s);
  return {
    mainTarget: ctx.currentTopic,
    leetcodeTasks: ctx.todayLeetCodeProblems,
    weakestHabit: ctx.missedTasks?.[0] || 'consistency',
    germanPhrase: ctx.todayGermanPhrase,
    tinyNextAction: ctx.todayLeetCodeProblems?.[0]?.title
      ? `Open ${ctx.todayLeetCodeProblems[0].title} and write the brute force idea in Java.`
      : 'Do 10 minutes of German and save the day log.',
    honestMotivation: 'Do the next small task cleanly. Momentum can start ugly and still count.',
    compactContext: ctx
  };
}
