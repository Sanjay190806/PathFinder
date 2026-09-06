import { CareerState } from '../app/store/useCareerStore';
import { GermanLessonProgress, GermanVocabularyProgress } from '../types/german';

export type GermanCEFRTrack = 'A1.1' | 'A1.2' | 'A2.1' | 'A2.2' | 'B1 Preview';

export function deriveGermanCEFRTrack(state: CareerState): GermanCEFRTrack {
  const completedLessons = (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).filter((lesson) => lesson.completed).length;
  if (completedLessons >= 24) return 'B1 Preview';
  if (completedLessons >= 18) return 'A2.2';
  if (completedLessons >= 12) return 'A2.1';
  if (completedLessons >= 6) return 'A1.2';
  return 'A1.1';
}

export function getGermanReadinessEstimate(state: CareerState): number {
  const lessons = (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).filter((lesson) => lesson.completed).length;
  const vocabKnown = (Object.values(state.vocabulary || {}) as GermanVocabularyProgress[]).filter((word) => word.status === 'known').length;
  const speakingSessions = state.germanSpeakingSessions || 0;
  const listeningSessions = state.germanListeningSessions || 0;
  const streak = state.germanSpeakingStreak || state.germanStreak || 0;
  return Math.max(
    0,
    Math.min(100, Math.round(
      lessons * 1.8 +
      Math.min(vocabKnown, 100) * 0.5 +
      speakingSessions * 3 +
      listeningSessions * 2 +
      streak * 4
    ))
  );
}

export function getGermanProgressSnapshot(state: CareerState) {
  return {
    track: deriveGermanCEFRTrack(state),
    lessonsCompleted: (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).filter((lesson) => lesson.completed).length,
    vocabularyKnown: (Object.values(state.vocabulary || {}) as GermanVocabularyProgress[]).filter((word) => word.status === 'known').length,
    speakingSessions: state.germanSpeakingSessions || 0,
    listeningSessions: state.germanListeningSessions || 0,
    grammarTopics: (Object.values(state.completedLessons || {}) as GermanLessonProgress[]).reduce((sum, lesson) => sum + (lesson.notes ? 1 : 0), 0),
    speakingStreak: state.germanSpeakingStreak || state.germanStreak || 0,
    listeningMinutes: state.germanListeningMinutes || 0,
    speakingMinutes: state.germanSpeakingMinutes || 0,
    readiness: getGermanReadinessEstimate(state),
  };
}

export function nextGermanReviewDate(stage: number): string {
  const next = new Date();
  const offsets = [0, 1, 3, 7];
  next.setDate(next.getDate() + offsets[Math.max(0, Math.min(stage, offsets.length - 1))]);
  return next.toISOString();
}
