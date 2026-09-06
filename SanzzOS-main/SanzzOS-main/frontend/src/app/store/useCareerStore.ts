import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { runMigrationForStore } from './migrations';
import { DailyLog, ProblemLog, Project, ResumeProfile, CareerApplication, CompanyTarget, WeeklyReview, SavedChatSession } from '../../types';
import { GermanDailyLog, GermanLessonProgress, GermanQuizHistoryItem, GermanVocabularyProgress, GermanLevel } from '../../types/german';
import { runAchievementEngine } from '../../utils/achievementEngine';
import { useUIStore } from './useUIStore';
import { getTodayDay, getDateForDay } from '../../utils/dateUtils';
import { evaluateCompletion } from '../../utils/dailyCompletionUtils';
import { getLevel } from '../../utils/xpUtils';
import { TARGET_COMPANIES_DATA } from '../../data/companies';
import { SKILL_TREE_DATA } from '../../data/skillTree';

export interface CareerState {
  userProfile: {
    name: string;
    startDate: string;
    totalDays: number;
  };
  dailyLogs: Record<string, DailyLog>;
  problemLogs: Record<string, ProblemLog>;
  projects: Record<string, Project>;
  resume: ResumeProfile;
  applications: CareerApplication[];
  xp: number;
  level: number;
  badges: string[];
  unlockedBadges: Record<string, string>;
  sqlProgress: Record<string, { completed: boolean; confidence: number; notes: string; solvedCount: number }>;
  aptitudeProgress: Record<string, { questionsSolved: number; accuracy: number; confidence: number; completed: boolean; notes: string }>;
  csCoreProgress: Record<string, Record<string, { completed: boolean; confidence: number; notes: string; interviewReady: boolean; lastRevisedAt: string | null; sampleQuestion: string }>>;
  skillRackStats: { totalSolved: number; easyCount: number; mediumCount: number; hardCount: number; categories: Record<string, number> };
  dsaPatternMastery: Record<string, { solvedCount: number; totalCount: number; confidenceSum: number; confidenceCount: number; mastery: 'Not Started' | 'Learning' | 'Practicing' | 'Strong' | 'Interview Ready' }>;
  germanLevel: GermanLevel;
  germanXP: number;
  germanStreak: number;
  longestGermanStreak: number;
  completedLessons: Record<string, GermanLessonProgress>;
  vocabulary: Record<string, GermanVocabularyProgress>;
  weakWords: string[];
  quizHistory: GermanQuizHistoryItem[];
  dailyGermanLogs: Record<string, GermanDailyLog>;
  currentLessonId: string;
  german7DayStreakRewarded: boolean;
  germanSpeakingSessions: number;
  germanListeningSessions: number;
  germanSpeakingStreak: number;
  germanSpeakingMinutes: number;
  germanListeningMinutes: number;
  germanVocabularyReviewedToday: number;
  
  updateDailyLog: (day: number, log: Partial<DailyLog>) => void;
  updateProblemLog: (key: string, log: Partial<ProblemLog>) => void;
  updateProject: (key: string, project: Partial<Project>) => void;
  updateResume: (resume: Partial<ResumeProfile>) => void;
  addApplication: (app: CareerApplication) => void;
  updateApplication: (id: string, app: Partial<CareerApplication>) => void;
  deleteApplication: (id: string) => void;
  updateSQLTopic: (topic: string, data: Partial<{ completed: boolean; confidence: number; notes: string; solvedCount: number }>) => void;
  updateAptitudeCategory: (category: string, data: Partial<{ questionsSolved: number; accuracy: number; confidence: number; completed: boolean; notes: string }>) => void;
  updateCSCoreTopic: (subject: string, topic: string, data: Partial<{ completed: boolean; confidence: number; notes: string; interviewReady: boolean; lastRevisedAt: string | null; sampleQuestion: string }>) => void;
  updateSkillRackStats: (stats: Partial<{ totalSolved: number; easyCount: number; mediumCount: number; hardCount: number }>) => void;
  updateSkillRackCategory: (category: string, solvedCount: number) => void;
  updateDSAPatternMastery: (pattern: string, data: Partial<{ solvedCount: number; totalCount: number; confidenceSum: number; confidenceCount: number; mastery: 'Not Started' | 'Learning' | 'Practicing' | 'Strong' | 'Interview Ready' }>) => void;
  completeGermanLesson: (lessonId: string, vocabularyCount?: number, xpReward?: number) => void;
  updateGermanLessonNotes: (lessonId: string, notes: string) => void;
  reviewVocabularyWord: (wordId: string) => void;
  markWordKnown: (wordId: string) => void;
  markWordWeak: (wordId: string) => void;
  completeGermanQuiz: (lessonId: string, score: number, total: number, quizType?: string) => void;
  updateGermanMinutes: (minutes: number, lessonId?: string, phrase?: string) => void;
  submitWordReview: (wordId: string, correct: boolean, rating?: number) => void;
  repairStreak: () => void;
  resetGermanProgress: () => void;
  logGermanSpeakingSession: (minutes?: number) => void;
  logGermanListeningSession: (minutes?: number) => void;
  logGermanVocabularyReview: (count?: number) => void;

  // Placement Pro v1.3 & v1.4 additions
  companyTargets: CompanyTarget[];
  skillTree: Record<string, 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready'>;
  weeklyReviews: Record<string, WeeklyReview>;
  weeklyFreezeUsage: Record<string, boolean>;
  chatHistory: SavedChatSession[];

  updateCompanyTarget: (id: string, updates: Partial<CompanyTarget>) => void;
  updateSkillNode: (id: string, status: 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready') => void;
  saveWeeklyReview: (weekKey: string, review: WeeklyReview) => void;
  useStreakFreeze: (day: number, reason?: string) => void;
  saveChatSession: (session: SavedChatSession) => void;
  deleteChatSession: (id: string) => void;
  awardXP: (amount: number) => void;
  setStartDate: (startDate: string) => void;
  resetStreakToToday: () => void;
  addCustomStudyMaterial: (day: number, material: { title: string; category?: string; url?: string; notes?: string }) => void;
  toggleCustomStudyMaterial: (day: number, materialId: string) => void;
  deleteCustomStudyMaterial: (day: number, materialId: string) => void;
}

function deriveGermanLevel(completedCount: number): GermanLevel {
  if (completedCount >= 24) return 'B1 Preview';
  if (completedCount >= 18) return 'A2 Strong';
  if (completedCount >= 11) return 'A2 Beginner';
  if (completedCount >= 6) return 'A1 Strong';
  return 'A1 Beginner';
}

function calculateStreakState(logs: Record<string, GermanDailyLog>, todayDay: number) {
  const practiceDays = Object.entries(logs)
    .filter(([, log]) => (log.minutes || 0) > 0 || (log.xpEarned || 0) > 0)
    .map(([day]) => Number(day))
    .filter((day) => Number.isFinite(day))
    .sort((a, b) => a - b);

  const practiceSet = new Set(practiceDays);

  let current = 0;
  // Duolingo streak rule:
  if (practiceSet.has(todayDay)) {
    current = 1;
    let d = todayDay - 1;
    while (d >= 1 && practiceSet.has(d)) {
      current++;
      d--;
    }
  } else if (todayDay > 1 && practiceSet.has(todayDay - 1)) {
    // Yesterday was practiced, streak is preserved today until midnight
    let d = todayDay - 1;
    while (d >= 1 && practiceSet.has(d)) {
      current++;
      d--;
    }
  } else {
    // Yesterday was missed -> resets to 0!
    current = 0;
  }

  let longest = 0;
  let run = 0;
  let previous = -1;
  for (const day of practiceDays) {
    if (previous === -1 || day === previous + 1) {
      run += 1;
    } else {
      run = 1;
    }
    previous = day;
    longest = Math.max(longest, run);
  }

  return { current, longest: Math.max(longest, current) };
}

function getWeekKey(date: Date): string {
  const temp = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = temp.getUTCDay() || 7;
  temp.setUTCDate(temp.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(temp.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((temp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${temp.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function getGermanTodayKey(state: CareerState): string {
  return String(getTodayDay(state.userProfile.startDate));
}

function getGermanBaseLessonProgress(locked: boolean): GermanLessonProgress {
  return {
    completed: false,
    locked,
    xpEarned: 0,
    vocabularyCount: 0,
    quizScore: 0,
    notes: '',
    lastPracticed: null
  };
}

export const defaultGermanState = {
  germanLevel: 'A1 Beginner' as GermanLevel,
  germanXP: 0,
  germanStreak: 0,
  longestGermanStreak: 0,
  completedLessons: {} as Record<string, GermanLessonProgress>,
  vocabulary: {} as Record<string, GermanVocabularyProgress>,
  weakWords: [] as string[],
  quizHistory: [] as GermanQuizHistoryItem[],
  dailyGermanLogs: {} as Record<string, GermanDailyLog>,
  currentLessonId: 'german-1',
  german7DayStreakRewarded: false,
  germanSpeakingSessions: 0,
  germanListeningSessions: 0,
  germanSpeakingStreak: 0,
  germanSpeakingMinutes: 0,
  germanListeningMinutes: 0,
  germanVocabularyReviewedToday: 0
};

export function normalizeLessonProgress(progress: any): GermanLessonProgress {
  return {
    completed: typeof progress?.completed === 'boolean' ? progress.completed : false,
    locked: typeof progress?.locked === 'boolean' ? progress.locked : true,
    xpEarned: typeof progress?.xpEarned === 'number' ? progress.xpEarned : 0,
    vocabularyCount: typeof progress?.vocabularyCount === 'number' ? progress.vocabularyCount : 0,
    quizScore: typeof progress?.quizScore === 'number' ? progress.quizScore : 0,
    notes: typeof progress?.notes === 'string' ? progress.notes : '',
    lastPracticed: progress?.lastPracticed || null,
  };
}

export function normalizeGermanState(state: any) {
  const completedLessons: Record<string, GermanLessonProgress> = {};
  if (state?.completedLessons && typeof state.completedLessons === 'object') {
    Object.entries(state.completedLessons).forEach(([id, progress]) => {
      completedLessons[id] = normalizeLessonProgress(progress);
    });
  }

  return {
    germanLevel: typeof state?.germanLevel === 'string' ? state.germanLevel : 'A1 Beginner',
    germanXP: typeof state?.germanXP === 'number' ? state.germanXP : 0,
    germanStreak: typeof state?.germanStreak === 'number' ? state.germanStreak : 0,
    longestGermanStreak: typeof state?.longestGermanStreak === 'number' ? state.longestGermanStreak : 0,
    completedLessons,
    vocabulary: state?.vocabulary && typeof state.vocabulary === 'object' ? state.vocabulary : {},
    weakWords: Array.isArray(state?.weakWords) ? state.weakWords : [],
    quizHistory: Array.isArray(state?.quizHistory) ? state.quizHistory : [],
    dailyGermanLogs: state?.dailyGermanLogs && typeof state.dailyGermanLogs === 'object' ? state.dailyGermanLogs : {},
    currentLessonId: typeof state?.currentLessonId === 'string' ? state.currentLessonId : 'german-1',
    german7DayStreakRewarded: typeof state?.german7DayStreakRewarded === 'boolean' ? state.german7DayStreakRewarded : false,
    germanSpeakingSessions: typeof state?.germanSpeakingSessions === 'number' ? state.germanSpeakingSessions : 0,
    germanListeningSessions: typeof state?.germanListeningSessions === 'number' ? state.germanListeningSessions : 0,
    germanSpeakingStreak: typeof state?.germanSpeakingStreak === 'number' ? state.germanSpeakingStreak : 0,
    germanSpeakingMinutes: typeof state?.germanSpeakingMinutes === 'number' ? state.germanSpeakingMinutes : 0,
    germanListeningMinutes: typeof state?.germanListeningMinutes === 'number' ? state.germanListeningMinutes : 0,
    germanVocabularyReviewedToday: typeof state?.germanVocabularyReviewedToday === 'number' ? state.germanVocabularyReviewedToday : 0
  };
}

export function normalizeAIMessage(msg: any) {
  return {
    id: msg?.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role: msg?.role || 'user',
    content: typeof msg?.content === 'string' ? msg.content : '',
    status: msg?.status || 'complete',
    createdAt: msg?.createdAt || new Date().toISOString()
  };
}

const initialSkillTree = Object.keys(SKILL_TREE_DATA).reduce((acc, key) => {
  acc[key] = key === 'java-basics' ? 'unlocked' : 'locked';
  return acc;
}, {} as Record<string, 'locked' | 'unlocked' | 'learning' | 'completed' | 'interview-ready'>);

export const useCareerStore = create<CareerState>()(
  persist(
    (set) => ({
      userProfile: {
        name: 'Sanju',
        startDate: new Date().toISOString().split('T')[0],
        totalDays: 180
      },
      companyTargets: TARGET_COMPANIES_DATA,
      skillTree: initialSkillTree,
      weeklyReviews: {},
      weeklyFreezeUsage: {},
      chatHistory: [],
      dailyLogs: {},
      problemLogs: {},
      projects: {},
      resume: {
        version: '',
        atsScore: 0,
        lastUpdated: null,
        targetRole: '',
        sections: { contact: 0, education: 0, skills: 0, projects: 0, achievements: 0, formatting: 0 }
      },
      applications: [],
      xp: 0,
      level: 1,
      badges: [],
      unlockedBadges: {},
      sqlProgress: {},
      aptitudeProgress: {},
      csCoreProgress: {},
      skillRackStats: { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} },
      dsaPatternMastery: {},
      germanLevel: 'A1 Beginner',
      germanXP: 0,
      germanStreak: 0,
      longestGermanStreak: 0,
      completedLessons: {},
      vocabulary: {},
      weakWords: [],
      quizHistory: [],
      dailyGermanLogs: {},
      currentLessonId: 'german-1',
      german7DayStreakRewarded: false,
      germanSpeakingSessions: 0,
      germanListeningSessions: 0,
      germanSpeakingStreak: 0,
      germanSpeakingMinutes: 0,
      germanListeningMinutes: 0,
      germanVocabularyReviewedToday: 0,
      
      updateDailyLog: (day, log) => set((state) => {
        const existingLog = state.dailyLogs[day] || {
          counts: { leetcode: 0, skillrack: 0, codechefJava: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
          lcStatus: [],
          note: '',
          mood: 3,
          energy: 3,
          distractions: 0,
          focusMinutes: 0,
          status: 'not_started',
          savedAt: '',
          xpEarned: 0
        };
        const mergedLog = { ...existingLog, ...log } as DailyLog;
        mergedLog.completionType = evaluateCompletion(mergedLog);

        const nextLogs = {
          ...state.dailyLogs,
          [day]: mergedLog
        };
        const nextState = { ...state, dailyLogs: nextLogs };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { dailyLogs: nextLogs };
      }),
      updateProblemLog: (key, log) => set((state) => {
        const nextLogs = {
          ...state.problemLogs,
          [key]: { ...state.problemLogs[key], ...log } as ProblemLog
        };
        const nextState = { ...state, problemLogs: nextLogs };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { problemLogs: nextLogs };
      }),
      updateProject: (key, proj) => set((state) => {
        const nextProjs = {
          ...state.projects,
          [key]: { ...state.projects[key], ...proj } as Project
        };
        const nextState = { ...state, projects: nextProjs };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { projects: nextProjs };
      }),
      updateResume: (resume) => set((state) => {
        const nextResume = {
          ...state.resume,
          ...resume
        };
        const nextState = { ...state, resume: nextResume };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { resume: nextResume };
      }),
      addApplication: (app) => set((state) => {
        const nextApps = [...state.applications, app];
        const nextState = { ...state, applications: nextApps };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { applications: nextApps };
      }),
      updateApplication: (id, app) => set((state) => {
        const nextApps = state.applications.map(a => a.id === id ? { ...a, ...app } : a);
        const nextState = { ...state, applications: nextApps };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { applications: nextApps };
      }),
      deleteApplication: (id) => set((state) => {
        const nextApps = state.applications.filter(a => a.id !== id);
        const nextState = { ...state, applications: nextApps };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { applications: nextApps };
      }),
      updateSQLTopic: (topic, data) => set((state) => {
        const nextProgress = {
          ...state.sqlProgress,
          [topic]: { ...(state.sqlProgress?.[topic] || { completed: false, confidence: 3, notes: '', solvedCount: 0 }), ...data }
        };
        const nextState = { ...state, sqlProgress: nextProgress };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { sqlProgress: nextProgress };
      }),
      updateAptitudeCategory: (category, data) => set((state) => {
        const nextProgress = {
          ...state.aptitudeProgress,
          [category]: { ...(state.aptitudeProgress?.[category] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' }), ...data }
        };
        const nextState = { ...state, aptitudeProgress: nextProgress };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { aptitudeProgress: nextProgress };
      }),
      updateCSCoreTopic: (subject, topic, data) => set((state) => {
        const subProgress = state.csCoreProgress?.[subject] || {};
        const nextSubProgress = {
          ...subProgress,
          [topic]: { ...(subProgress[topic] || { completed: false, confidence: 3, notes: '', interviewReady: false, lastRevisedAt: null, sampleQuestion: '' }), ...data }
        };
        const nextProgress = {
          ...state.csCoreProgress,
          [subject]: nextSubProgress
        };
        const nextState = { ...state, csCoreProgress: nextProgress };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { csCoreProgress: nextProgress };
      }),
      updateSkillRackStats: (stats) => set((state) => {
        const nextStats = { ...(state.skillRackStats || { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} }), ...stats };
        const nextState = { ...state, skillRackStats: nextStats };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { skillRackStats: nextStats };
      }),
      updateSkillRackCategory: (category, solvedCount) => set((state) => {
        const stats = state.skillRackStats || { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} };
        const nextCats = { ...(stats.categories || {}), [category]: solvedCount };
        const nextStats = { ...stats, categories: nextCats };
        const nextState = { ...state, skillRackStats: nextStats };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { skillRackStats: nextStats };
      }),
      updateDSAPatternMastery: (pattern, data) => set((state) => {
        const nextMastery = {
          ...state.dsaPatternMastery,
          [pattern]: { ...(state.dsaPatternMastery?.[pattern] || { solvedCount: 0, totalCount: 0, confidenceSum: 0, confidenceCount: 0, mastery: 'Not Started' }), ...data }
        };
        const nextState = { ...state, dsaPatternMastery: nextMastery };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { dsaPatternMastery: nextMastery };
      }),
      completeGermanLesson: (lessonId, vocabularyCount = 0, xpReward = 30) => set((state) => {
        const todayKey = getGermanTodayKey(state);
        const nextCompleted = { ...state.completedLessons };
        const existingLesson = nextCompleted[lessonId] || getGermanBaseLessonProgress(false);
        const lessonWasNew = !existingLesson.completed;
        const updatedLesson = {
          ...existingLesson,
          completed: true,
          locked: false,
          xpEarned: existingLesson.xpEarned + (lessonWasNew ? xpReward : 0),
          vocabularyCount: Math.max(existingLesson.vocabularyCount, vocabularyCount),
          lastPracticed: new Date().toISOString(),
        };
        nextCompleted[lessonId] = updatedLesson;

        const nextLogs = {
          ...state.dailyGermanLogs,
          [todayKey]: {
            ...(state.dailyGermanLogs[todayKey] || { minutes: 0, lessonId: null, phrase: '', xpEarned: 0, updatedAt: new Date().toISOString() }),
            lessonId,
            xpEarned: (state.dailyGermanLogs[todayKey]?.xpEarned || 0) + (lessonWasNew ? xpReward : 0),
            updatedAt: new Date().toISOString()
          }
        };
        const streakState = calculateStreakState(nextLogs, getTodayDay(state.userProfile.startDate));
        const completedCount = Object.values(nextCompleted).filter((item) => item.completed).length;
        const nextLevel = deriveGermanLevel(completedCount);
        const rewardBonus = !state.german7DayStreakRewarded && streakState.current >= 7 ? 150 : 0;
        const nextState = {
          ...state,
          completedLessons: nextCompleted,
          dailyGermanLogs: nextLogs,
          germanLevel: nextLevel,
          germanXP: state.germanXP + (lessonWasNew ? xpReward : 0) + rewardBonus,
          germanStreak: streakState.current,
          longestGermanStreak: Math.max(state.longestGermanStreak, streakState.longest),
          currentLessonId: `german-${Math.min(completedCount + 1, 30)}`,
          german7DayStreakRewarded: state.german7DayStreakRewarded || streakState.current >= 7
        };

        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          completedLessons: nextCompleted,
          dailyGermanLogs: nextLogs,
          germanLevel: nextLevel,
          germanXP: state.germanXP + (lessonWasNew ? xpReward : 0) + rewardBonus,
          germanStreak: streakState.current,
          longestGermanStreak: Math.max(state.longestGermanStreak, streakState.longest),
          currentLessonId: `german-${Math.min(completedCount + 1, 30)}`,
          german7DayStreakRewarded: state.german7DayStreakRewarded || streakState.current >= 7
        };
      }),
      updateGermanLessonNotes: (lessonId, notes) => set((state) => {
        const nextCompleted = {
          ...state.completedLessons,
          [lessonId]: {
            ...(state.completedLessons?.[lessonId] || getGermanBaseLessonProgress(false)),
            notes
          }
        };
        const nextState = { ...state, completedLessons: nextCompleted };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { completedLessons: nextCompleted };
      }),
      reviewVocabularyWord: (wordId) => set((state) => {
        const todayKey = getGermanTodayKey(state);
        const current = state.vocabulary?.[wordId] || { status: 'learning', reviewCount: 0, lastReviewedAt: null };
        const updatedWord: GermanVocabularyProgress = {
          status: current.status === 'review' ? 'learning' : current.status,
          reviewCount: (current.reviewCount || 0) + 1,
          lastReviewedAt: new Date().toISOString()
        };
        const nextVocabulary = {
          ...state.vocabulary,
          [wordId]: updatedWord
        };
        const nextLogs = {
          ...state.dailyGermanLogs,
          [todayKey]: {
            ...(state.dailyGermanLogs[todayKey] || { minutes: 0, lessonId: null, phrase: '', xpEarned: 0, updatedAt: new Date().toISOString() }),
            xpEarned: (state.dailyGermanLogs[todayKey]?.xpEarned || 0) + 10,
            updatedAt: new Date().toISOString()
          }
        };
        const nextState = { ...state, vocabulary: nextVocabulary, dailyGermanLogs: nextLogs, germanXP: state.germanXP + 10 };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { vocabulary: nextVocabulary, dailyGermanLogs: nextLogs, germanXP: state.germanXP + 10 };
      }),
      markWordKnown: (wordId) => set((state) => {
        const updatedWord: GermanVocabularyProgress = {
          status: 'known',
          reviewCount: state.vocabulary?.[wordId]?.reviewCount || 0,
          lastReviewedAt: new Date().toISOString()
        };
        const nextVocabulary = {
          ...state.vocabulary,
          [wordId]: updatedWord
        };
        const nextWeakWords = (state.weakWords || []).filter((word) => word !== wordId);
        const nextState = { ...state, vocabulary: nextVocabulary, weakWords: nextWeakWords };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { vocabulary: nextVocabulary, weakWords: nextWeakWords };
      }),
      markWordWeak: (wordId) => set((state) => {
        const updatedWord: GermanVocabularyProgress = {
          status: 'review',
          reviewCount: state.vocabulary?.[wordId]?.reviewCount || 0,
          lastReviewedAt: new Date().toISOString()
        };
        const nextVocabulary = {
          ...state.vocabulary,
          [wordId]: updatedWord
        };
        const nextWeakWords = Array.from(new Set([...(state.weakWords || []), wordId]));
        const nextState = { ...state, vocabulary: nextVocabulary, weakWords: nextWeakWords };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return { vocabulary: nextVocabulary, weakWords: nextWeakWords };
      }),
      completeGermanQuiz: (lessonId, score, total, quizType = 'general') => set((state) => {
        const perfect = score >= total;
        const todayKey = getGermanTodayKey(state);
        const nextHistory = [
          ...state.quizHistory,
          {
            lessonId,
            score,
            total,
            perfect,
            type: quizType,
            takenAt: new Date().toISOString()
          }
        ];
        const nextCompleted = {
          ...state.completedLessons,
          [lessonId]: {
            ...(state.completedLessons?.[lessonId] || getGermanBaseLessonProgress(false)),
            quizScore: score
          }
        };
        const nextLogs = {
          ...state.dailyGermanLogs,
          [todayKey]: {
            ...(state.dailyGermanLogs[todayKey] || { minutes: 0, lessonId: null, phrase: '', xpEarned: 0, updatedAt: new Date().toISOString() }),
            lessonId,
            xpEarned: (state.dailyGermanLogs[todayKey]?.xpEarned || 0) + 20 + (perfect ? 50 : 0),
            updatedAt: new Date().toISOString()
          }
        };
        const nextState = {
          ...state,
          quizHistory: nextHistory,
          completedLessons: nextCompleted,
          dailyGermanLogs: nextLogs,
          germanXP: state.germanXP + 20 + (perfect ? 50 : 0)
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          quizHistory: nextHistory,
          completedLessons: nextCompleted,
          dailyGermanLogs: nextLogs,
          germanXP: state.germanXP + 20 + (perfect ? 50 : 0)
        };
      }),
      updateGermanMinutes: (minutes, lessonId, phrase) => set((state) => {
        const todayKey = getGermanTodayKey(state);
        const nextLogs = {
          ...state.dailyGermanLogs,
          [todayKey]: {
            ...(state.dailyGermanLogs[todayKey] || { minutes: 0, lessonId: null, phrase: '', xpEarned: 0, updatedAt: new Date().toISOString() }),
            minutes: (state.dailyGermanLogs[todayKey]?.minutes || 0) + Math.max(minutes, 0),
            lessonId: lessonId || state.currentLessonId,
            phrase: phrase || state.dailyGermanLogs[todayKey]?.phrase || '',
            updatedAt: new Date().toISOString()
          }
        };
        const streakState = calculateStreakState(nextLogs, getTodayDay(state.userProfile.startDate));
        const rewardBonus = !state.german7DayStreakRewarded && streakState.current >= 7 ? 150 : 0;
        const nextState = {
          ...state,
          dailyGermanLogs: nextLogs,
          germanStreak: streakState.current,
          longestGermanStreak: Math.max(state.longestGermanStreak, streakState.longest),
          germanXP: state.germanXP + rewardBonus,
          german7DayStreakRewarded: state.german7DayStreakRewarded || streakState.current >= 7
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          dailyGermanLogs: nextLogs,
          germanStreak: streakState.current,
          longestGermanStreak: Math.max(state.longestGermanStreak, streakState.longest),
          germanXP: state.germanXP + rewardBonus,
          german7DayStreakRewarded: state.german7DayStreakRewarded || streakState.current >= 7
        };
      }),
      submitWordReview: (wordId, correct, rating) => set((state) => {
        const vocab = state.vocabulary || {};
        const progress = vocab[wordId] || {
          status: 'learning',
          reviewCount: 0,
          lastReviewedAt: null,
          reviewStage: 0,
          nextReviewDate: null,
          correctCount: 0,
          wrongCount: 0,
          lastReviewed: null,
          easeFactor: 2.5,
          intervalDays: 0
        };

        // Map correct/rating to SM-2 quality rating (0-5)
        // rating: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
        let q = correct ? 4 : 1;
        if (rating !== undefined) {
          if (rating === 1) q = 1;
          else if (rating === 2) q = 3;
          else if (rating === 3) q = 4;
          else if (rating === 4) q = 5;
        }

        const isCorrect = q >= 3;
        const currentEF = progress.easeFactor !== undefined ? progress.easeFactor : 2.5;
        const currentInterval = progress.intervalDays !== undefined ? progress.intervalDays : 0;
        const currentReps = progress.reviewStage !== undefined ? progress.reviewStage : 0;

        let nextEF = currentEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (nextEF < 1.3) nextEF = 1.3;

        let nextInterval = 1;
        let nextReps = 0;

        if (q >= 3) {
          if (currentReps === 0) {
            nextInterval = 1;
          } else if (currentReps === 1) {
            nextInterval = 6;
          } else {
            nextInterval = Math.round(currentInterval * currentEF);
          }
          nextReps = currentReps + 1;
        } else {
          nextInterval = 1;
          nextReps = 0;
        }

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + nextInterval);

        const updatedWord: GermanVocabularyProgress = {
          ...progress,
          status: q >= 4 ? 'known' : (q === 1 ? 'review' : 'learning'),
          reviewCount: (progress.reviewCount || 0) + 1,
          lastReviewedAt: new Date().toISOString(),
          lastReviewed: new Date().toISOString(),
          reviewStage: nextReps,
          easeFactor: nextEF,
          intervalDays: nextInterval,
          nextReviewDate: nextReview.toISOString(),
          correctCount: (progress.correctCount || 0) + (isCorrect ? 1 : 0),
          wrongCount: (progress.wrongCount || 0) + (isCorrect ? 0 : 1)
        };

        const nextVocab = {
          ...vocab,
          [wordId]: updatedWord
        };

        let nextWeak = state.weakWords || [];
        if (!isCorrect) {
          nextWeak = Array.from(new Set([...nextWeak, wordId]));
        } else if (q >= 4) {
          nextWeak = nextWeak.filter((w) => w !== wordId);
        }

        const xpAdd = rating === 4 ? 8 : (isCorrect ? 5 : 2);

        return {
          vocabulary: nextVocab,
          weakWords: nextWeak,
          germanXP: state.germanXP + xpAdd
        };
      }),
      repairStreak: () => set((state) => {
        const repairedStreak = Math.max(state.germanStreak + 1, state.longestGermanStreak || 1);
        return {
          germanStreak: repairedStreak,
          longestGermanStreak: Math.max(state.longestGermanStreak, repairedStreak),
          germanXP: Math.max(state.germanXP - 50, 0)
        };
      }),
      resetGermanProgress: () => set((state) => {
        const nextState = {
          ...state,
          germanLevel: 'A1 Beginner' as GermanLevel,
          germanXP: 0,
          germanStreak: 0,
          longestGermanStreak: 0,
          completedLessons: {},
          vocabulary: {},
          weakWords: [],
          quizHistory: [],
          dailyGermanLogs: {},
          currentLessonId: 'german-1',
          german7DayStreakRewarded: false
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          germanLevel: 'A1 Beginner' as GermanLevel,
          germanXP: 0,
          germanStreak: 0,
          longestGermanStreak: 0,
          completedLessons: {},
          vocabulary: {},
          weakWords: [],
          quizHistory: [],
          dailyGermanLogs: {},
          currentLessonId: 'german-1',
          german7DayStreakRewarded: false
        };
      }),
      logGermanSpeakingSession: (minutes = 10) => set((state) => {
        const nextSessions = (state.germanSpeakingSessions || 0) + 1;
        const nextMinutes = (state.germanSpeakingMinutes || 0) + Math.max(minutes, 0);
        const nextStreak = (state.germanSpeakingStreak || 0) + 1;
        const nextXP = (state.germanXP || 0) + 15;
        const nextMainXP = (state.xp || 0) + 10;
        const nextState = {
          ...state,
          germanSpeakingSessions: nextSessions,
          germanSpeakingMinutes: nextMinutes,
          germanSpeakingStreak: nextStreak,
          germanXP: nextXP,
          xp: nextMainXP
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          germanSpeakingSessions: nextSessions,
          germanSpeakingMinutes: nextMinutes,
          germanSpeakingStreak: nextStreak,
          germanXP: nextXP,
          xp: nextMainXP
        };
      }),
      logGermanListeningSession: (minutes = 10) => set((state) => {
        const nextSessions = (state.germanListeningSessions || 0) + 1;
        const nextMinutes = (state.germanListeningMinutes || 0) + Math.max(minutes, 0);
        const nextXP = (state.germanXP || 0) + 10;
        const nextMainXP = (state.xp || 0) + 5;
        const nextState = {
          ...state,
          germanListeningSessions: nextSessions,
          germanListeningMinutes: nextMinutes,
          germanXP: nextXP,
          xp: nextMainXP
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          germanListeningSessions: nextSessions,
          germanListeningMinutes: nextMinutes,
          germanXP: nextXP,
          xp: nextMainXP
        };
      }),
      logGermanVocabularyReview: (count = 5) => set((state) => {
        const nextCount = (state.germanVocabularyReviewedToday || 0) + Math.max(count, 0);
        const nextXP = (state.germanXP || 0) + Math.max(count, 0) * 2;
        const nextState = {
          ...state,
          germanVocabularyReviewedToday: nextCount,
          germanXP: nextXP
        };
        runAchievementEngine(nextState, set, (badge) => useUIStore.getState().setActiveBadge(badge));
        return {
          germanVocabularyReviewedToday: nextCount,
          germanXP: nextXP
        };
      }),
      updateCompanyTarget: (id, updates) => set((state) => {
        const nextCompanies = (state.companyTargets || TARGET_COMPANIES_DATA).map((c) =>
          c.id === id ? { ...c, ...updates } : c
        );
        return { companyTargets: nextCompanies };
      }),
      updateSkillNode: (id, status) => set((state) => {
        const nextTree = { ...(state.skillTree || initialSkillTree), [id]: status };
        return { skillTree: nextTree };
      }),
      saveWeeklyReview: (weekKey, review) => set((state) => {
        const nextReviews = { ...(state.weeklyReviews || {}), [weekKey]: review };
        return { weeklyReviews: nextReviews };
      }),
      useStreakFreeze: (day, reason = '') => set((state) => {
        const dateObj = getDateForDay(day, state.userProfile.startDate);
        const weekKey = getWeekKey(dateObj);
        const nextWeeklyFreeze = { ...(state.weeklyFreezeUsage || {}), [weekKey]: true };
        const log = state.dailyLogs[day] || {
          counts: { leetcode: 0, skillrack: 0, codechefJava: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
          lcStatus: [],
          note: '',
          mood: 3,
          energy: 3,
          distractions: 0,
          focusMinutes: 0,
          status: 'not_started',
          savedAt: '',
          xpEarned: 0
        };
        const updatedLog: DailyLog = {
          ...log,
          freezeUsed: true,
          freezeReason: reason,
          completionType: 'freeze',
          status: 'completed'
        };
        const nextLogs = { ...state.dailyLogs, [day]: updatedLog };
        return {
          dailyLogs: nextLogs,
          weeklyFreezeUsage: nextWeeklyFreeze
        };
      }),
      saveChatSession: (session) => set((state) => {
        const nextHistory = [session, ...(state.chatHistory || [])].slice(0, 50);
        return { chatHistory: nextHistory };
      }),
      deleteChatSession: (id) => set((state) => {
        const nextHistory = (state.chatHistory || []).filter((s) => s.id !== id);
        return { chatHistory: nextHistory };
      }),
      awardXP: (amount) => set((state) => {
        const nextXp = state.xp + amount;
        const nextLevel = getLevel(nextXp).level;
        return {
          xp: nextXp,
          level: nextLevel
        };
      }),
      setStartDate: (startDate) => set((state) => ({
        userProfile: {
          ...state.userProfile,
          startDate
        }
      })),
      resetStreakToToday: () => set((state) => ({
        userProfile: {
          ...state.userProfile,
          startDate: new Date().toISOString().split('T')[0]
        }
      })),
      addCustomStudyMaterial: (day, material) => set((state) => {
        const current = state.dailyLogs[day] || {
          counts: { leetcode: 0, skillrack: 0, codechefJava: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 },
          lcStatus: [],
          note: '',
          mood: 3,
          energy: 3,
          distractions: 0,
          focusMinutes: 0,
          status: 'not_started',
          savedAt: new Date().toISOString(),
          xpEarned: 0
        };
        const customMaterials = current.customMaterials || [];
        const newMat = {
          id: `mat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          title: material.title.trim(),
          category: material.category?.trim() || 'Custom Material',
          url: material.url?.trim(),
          notes: material.notes?.trim(),
          completed: false
        };
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [day]: {
              ...current,
              customMaterials: [...customMaterials, newMat]
            }
          }
        };
      }),
      toggleCustomStudyMaterial: (day, materialId) => set((state) => {
        const current = state.dailyLogs[day];
        if (!current || !current.customMaterials) return state;
        const updated = current.customMaterials.map((m) =>
          m.id === materialId ? { ...m, completed: !m.completed } : m
        );
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [day]: {
              ...current,
              customMaterials: updated
            }
          }
        };
      }),
      deleteCustomStudyMaterial: (day, materialId) => set((state) => {
        const current = state.dailyLogs[day];
        if (!current || !current.customMaterials) return state;
        const filtered = current.customMaterials.filter((m) => m.id !== materialId);
        return {
          dailyLogs: {
            ...state.dailyLogs,
            [day]: {
              ...current,
              customMaterials: filtered
            }
          }
        };
      })
    }),
    {
      name: 'sanju-career-os-persist',
      version: 142,
      migrate: (persistedState, version) => runMigrationForStore('sanju-career-os-persist', persistedState, version),
      merge: (persisted, current) => {
        const saved = persisted as any;
        const normalizedGerman = normalizeGermanState(saved);
        const savedXp = typeof saved?.xp === 'number' ? saved.xp : current.xp;
        let userProfile = saved?.userProfile || current.userProfile;
        if (!userProfile?.startDate || userProfile.startDate === '2026-07-01') {
          userProfile = {
            ...userProfile,
            startDate: new Date().toISOString().split('T')[0]
          };
        }
        return {
          ...current,
          ...saved,
          userProfile,
          ...normalizedGerman,
          level: getLevel(savedXp).level
        };
      }
    }
  )
);
