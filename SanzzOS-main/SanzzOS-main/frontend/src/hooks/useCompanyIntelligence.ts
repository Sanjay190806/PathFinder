import { useCompanyIntelligenceStore } from '../app/store/useCompanyIntelligenceStore';
import { useOAAttemptsStore } from '../app/store/useOAAttemptsStore';

export const useCompanyIntelligence = () => {
  const {
    companies,
    prepPlans,
    strategy,
    addCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    generatePrepPlan,
    togglePlanTask,
    updateStrategy,
    updateCompanyReadiness,
  } = useCompanyIntelligenceStore();

  const {
    attempts: oaAttempts,
    addAttempt: addOAAttempt,
    updateAttempt: updateOAAttempt,
    deleteAttempt: deleteOAAttempt,
  } = useOAAttemptsStore();

  return {
    // Company profile configurations
    companies,
    addCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    updateCompanyReadiness,

    // Study plans timeline mappings
    prepPlans,
    generatePrepPlan,
    togglePlanTask,

    // Strategy pipelines kanban boards
    strategy,
    updateStrategy,

    // Online assessments tracking logs
    oaAttempts,
    addOAAttempt,
    updateOAAttempt,
    deleteOAAttempt,
  };
};
export default useCompanyIntelligence;
