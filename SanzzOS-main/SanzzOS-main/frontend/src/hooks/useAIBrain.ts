import { useMemo, useState } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { buildAIBrainSummary, loadAIBrainSummary, saveAIBrainSummary } from '../services/aiBrainService';

export function useAIBrain() {
  const careerState = useCareerStore((state) => state);
  const [storedSummary, setStoredSummary] = useState(() => loadAIBrainSummary());
  const liveSummary = useMemo(() => buildAIBrainSummary(careerState), [careerState]);
  const summary = storedSummary || liveSummary;

  const refresh = () => {
    const next = buildAIBrainSummary(useCareerStore.getState());
    saveAIBrainSummary(next);
    setStoredSummary(next);
    return next;
  };

  return { summary, refresh, isFallback: !storedSummary };
}
