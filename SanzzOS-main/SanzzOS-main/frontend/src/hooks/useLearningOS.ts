import { useMemo, useState } from 'react';
import { completeRevisionItem, getDueRevisionItems, loadLearningState, logLearningSession, saveLearningState } from '../services/learningService';
import { LearningSession } from '../types/learning';

export function useLearningOS() {
  const [state, setState] = useState(() => loadLearningState());
  const dueRevision = useMemo(() => getDueRevisionItems(state.revisionItems), [state.revisionItems]);
  const overview = useMemo(() => {
    const activePaths = state.paths.filter((path) => path.status === 'active' || path.status === 'revision');
    const totalHours = state.paths.reduce((sum, path) => sum + path.totalHoursSpent, 0);
    const weeklyHours = state.paths.reduce((sum, path) => sum + path.weeklyHours, 0);
    const xp = state.paths.reduce((sum, path) => sum + path.xp, 0);
    const averageMastery = state.paths.length ? Math.round(state.paths.reduce((sum, path) => sum + path.masteryPercentage, 0) / state.paths.length) : 0;
    return { activePaths: activePaths.length, totalHours, weeklyHours, xp, averageMastery, dueRevisionCount: dueRevision.length };
  }, [dueRevision.length, state.paths]);

  const addSession = (input: Omit<LearningSession, 'id' | 'createdAt'>) => setState((current) => logLearningSession(current, input));
  const completeRevision = (id: string) => setState((current) => completeRevisionItem(current, id));
  const save = () => saveLearningState(state);

  return { state, overview, dueRevision, addSession, completeRevision, save };
}
