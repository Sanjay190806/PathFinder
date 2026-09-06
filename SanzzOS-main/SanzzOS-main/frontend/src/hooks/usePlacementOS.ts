import { useMemo, useState } from 'react';
import { calculatePlacementReadiness, loadPlacementOS, PlacementOSState, savePlacementOS, updateApplicationStatus } from '../services/placementService';
import { ApplicationStatus } from '../types/placement';

export function usePlacementOS() {
  const [state, setState] = useState<PlacementOSState>(() => loadPlacementOS());
  const readiness = useMemo(() => calculatePlacementReadiness(state), [state]);

  const persist = (next: PlacementOSState) => {
    setState(next);
    savePlacementOS(next);
  };

  const updateStatus = (companyId: string, status: ApplicationStatus) => {
    persist(updateApplicationStatus(state, companyId, status));
  };

  const toggleChecklist = (key: string) => {
    persist({ ...state, resumeChecklist: { ...state.resumeChecklist, [key]: !state.resumeChecklist[key] } });
  };

  return { state, readiness, updateStatus, toggleChecklist, save: () => savePlacementOS(state) };
}
