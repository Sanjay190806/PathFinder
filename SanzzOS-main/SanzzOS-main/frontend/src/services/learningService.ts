import { DEFAULT_LEARNING_PATHS } from '../data/defaultLearningPaths';
import { ConfidenceLevel, LearningOSState, LearningPath, LearningRecommendation, LearningSession, RevisionItem } from '../types/learning';

export const LEARNING_OS_STORAGE_KEY = 'sanzz_os_learning_os_v1';
export const LEARNING_SESSIONS_STORAGE_KEY = 'sanzz_os_learning_sessions_v1';
export const REVISION_ITEMS_STORAGE_KEY = 'sanzz_os_revision_items_v1';

export function safeGetJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

export function safeSetJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Unable to persist ${key}`, error);
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function addDays(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

export function getRevisionDueDate(confidence: ConfidenceLevel): string {
  if (confidence === 'low') return addDays(1);
  if (confidence === 'medium') return addDays(3);
  return addDays(7);
}

export function getDefaultLearningState(): LearningOSState {
  const paths = DEFAULT_LEARNING_PATHS;
  return {
    paths,
    sessions: [],
    revisionItems: [],
    recommendations: buildLearningRecommendations(paths, []),
    updatedAt: new Date().toISOString()
  };
}

export function loadLearningState(): LearningOSState {
  const defaults = getDefaultLearningState();
  const paths = safeGetJSON<LearningPath[]>(LEARNING_OS_STORAGE_KEY, defaults.paths);
  const sessions = safeGetJSON<LearningSession[]>(LEARNING_SESSIONS_STORAGE_KEY, []);
  const revisionItems = safeGetJSON<RevisionItem[]>(REVISION_ITEMS_STORAGE_KEY, []);
  return {
    paths: paths.length ? paths : defaults.paths,
    sessions,
    revisionItems,
    recommendations: buildLearningRecommendations(paths.length ? paths : defaults.paths, revisionItems),
    updatedAt: new Date().toISOString()
  };
}

export function saveLearningState(state: LearningOSState): void {
  safeSetJSON(LEARNING_OS_STORAGE_KEY, state.paths);
  safeSetJSON(LEARNING_SESSIONS_STORAGE_KEY, state.sessions);
  safeSetJSON(REVISION_ITEMS_STORAGE_KEY, state.revisionItems);
}

export function buildLearningRecommendations(paths: LearningPath[], revisionItems: RevisionItem[]): LearningRecommendation[] {
  const due = getDueRevisionItems(revisionItems);
  const weakest = [...paths].sort((a, b) => a.masteryPercentage - b.masteryPercentage)[0];
  const neglected = [...paths].sort((a, b) => (a.lastStudiedAt || '').localeCompare(b.lastStudiedAt || ''))[0];
  return [
    ...(due[0] ? [{ id: 'due-revision', title: `Review ${due[0].topic}`, detail: 'A revision item is due today. Clear it before adding new load.', pathId: due[0].learningPathId, priority: 'high' as const }] : []),
    weakest ? { id: 'weakest-path', title: `Strengthen ${weakest.title}`, detail: `${weakest.title} is at ${weakest.masteryPercentage}% mastery. Log one focused session.`, pathId: weakest.id, priority: weakest.priority } : null,
    neglected ? { id: 'neglected-path', title: `Restart ${neglected.title}`, detail: 'This path has the weakest recency signal.', pathId: neglected.id, priority: neglected.priority } : null
  ].filter(Boolean) as LearningRecommendation[];
}

export function getDueRevisionItems(items: RevisionItem[]): RevisionItem[] {
  const current = today();
  return items.filter((item) => item.status !== 'completed' && item.dueDate <= current);
}

export function logLearningSession(state: LearningOSState, input: Omit<LearningSession, 'id' | 'createdAt'>): LearningOSState {
  const createdAt = new Date().toISOString();
  const session: LearningSession = { ...input, id: `learning-session-${Date.now()}`, createdAt };
  const hours = input.minutes / 60;
  const xpGain = Math.max(5, Math.round(input.minutes * (input.completed ? 1.2 : 0.8)));
  const nextRevision = getRevisionDueDate(input.confidence);
  const nextPaths = state.paths.map((path) => {
    if (path.id !== input.pathId) return path;
    const masteryGain = input.completed ? (input.confidence === 'high' ? 4 : input.confidence === 'medium' ? 3 : 1) : 1;
    const topicExists = path.topics.some((topic) => topic.title.toLowerCase() === input.topic.toLowerCase());
    const topics = topicExists
      ? path.topics.map((topic) => topic.title.toLowerCase() === input.topic.toLowerCase()
        ? { ...topic, confidence: input.confidence, lastPracticedAt: createdAt, masteryPercentage: Math.min(100, topic.masteryPercentage + masteryGain) }
        : topic)
      : [...path.topics, { id: `${path.id}-${Date.now()}`, title: input.topic, confidence: input.confidence, lastPracticedAt: createdAt, masteryPercentage: Math.min(100, 20 + masteryGain) }];
    return {
      ...path,
      status: path.status === 'not_started' ? 'active' : path.status,
      totalHoursSpent: Number((path.totalHoursSpent + hours).toFixed(2)),
      weeklyHours: Number((path.weeklyHours + hours).toFixed(2)),
      xp: path.xp + xpGain,
      streak: path.lastStudiedAt?.slice(0, 10) === today() ? path.streak : path.streak + 1,
      lastStudiedAt: createdAt,
      nextReviewAt: nextRevision,
      masteryPercentage: Math.min(100, path.masteryPercentage + masteryGain),
      topics,
      weakAreas: input.confidence === 'low' ? Array.from(new Set([...path.weakAreas, input.topic])) : path.weakAreas.filter((area) => area.toLowerCase() !== input.topic.toLowerCase()),
      strongAreas: input.confidence === 'high' ? Array.from(new Set([...path.strongAreas, input.topic])) : path.strongAreas
    };
  });

  const revisionStatus: RevisionItem['status'] = nextRevision <= today() ? 'due' : 'upcoming';
  const revisionItems: RevisionItem[] = input.confidence === 'high'
    ? state.revisionItems
    : [
        ...state.revisionItems,
        {
          id: `revision-${Date.now()}`,
          learningPathId: input.pathId,
          topic: input.topic,
          reason: input.confidence === 'low' ? 'Low confidence session' : 'Medium confidence reinforcement',
          difficulty: input.difficulty,
          confidence: input.confidence,
          dueDate: nextRevision,
          status: revisionStatus,
          attempts: 0,
          lastReviewedAt: null
        }
      ];

  const nextState = {
    paths: nextPaths,
    sessions: [session, ...state.sessions],
    revisionItems,
    recommendations: buildLearningRecommendations(nextPaths, revisionItems),
    updatedAt: createdAt
  };
  saveLearningState(nextState);
  return nextState;
}

export function completeRevisionItem(state: LearningOSState, id: string): LearningOSState {
  const nextItems = state.revisionItems.map((item) => item.id === id ? { ...item, status: 'completed' as const, attempts: item.attempts + 1, lastReviewedAt: new Date().toISOString() } : item);
  const nextState = { ...state, revisionItems: nextItems, recommendations: buildLearningRecommendations(state.paths, nextItems), updatedAt: new Date().toISOString() };
  saveLearningState(nextState);
  return nextState;
}
