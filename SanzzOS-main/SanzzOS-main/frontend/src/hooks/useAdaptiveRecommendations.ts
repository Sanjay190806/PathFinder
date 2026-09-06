import { usePersonalization } from './usePersonalization';
import { useCareerStore } from '../app/store/useCareerStore';
import { adaptiveRecommendationService } from '../services/adaptiveRecommendationService';

export function useAdaptiveRecommendations() {
  const { focusMode, energyMode } = usePersonalization();
  const careerState = useCareerStore((s) => s);

  const dsaSolved = Object.keys(careerState.problemLogs || {}).length;
  // Fallbacks in case state is uninitialized
  const sqlSolved = careerState.dailyLogs ? Object.values(careerState.dailyLogs).reduce((acc, log) => acc + (log.counts?.sql || 0), 0) : 0;
  const aptitudeSolved = careerState.dailyLogs ? Object.values(careerState.dailyLogs).reduce((acc, log) => acc + (log.counts?.aptitude || 0), 0) : 0;
  const germanStreak = careerState.germanStreak || 0;
  const resumeScore = careerState.resume?.atsScore || 0;
  const projectCount = Object.keys(careerState.projects || {}).length;
  const hasAnyProgress = dsaSolved > 0 || sqlSolved > 0 || aptitudeSolved > 0 || germanStreak > 0 || resumeScore > 0 || projectCount > 0;

  const recommendations = adaptiveRecommendationService.getRecommendations(
    focusMode,
    energyMode,
    { dsaSolved, sqlSolved, aptitudeSolved, germanStreak, resumeScore, projectCount, hasAnyProgress }
  );

  return {
    recommendations
  };
}
export default useAdaptiveRecommendations;
