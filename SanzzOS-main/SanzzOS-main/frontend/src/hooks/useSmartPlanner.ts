import { useEffect, useState } from 'react';
import { useAIBrain } from './useAIBrain';
import { completeSmartTask, generateSmartPlan, loadSmartPlan, saveSmartPlan } from '../services/smartPlannerService';
import { PlannerMode, SmartPlan } from '../types/smartPlanner';

export function useSmartPlanner() {
  const { summary } = useAIBrain();
  const [plan, setPlan] = useState<SmartPlan>(() => loadSmartPlan() || generateSmartPlan(summary, 'normal'));

  useEffect(() => {
    if (plan.date !== new Date().toISOString().split('T')[0]) {
      setPlan(generateSmartPlan(summary, 'normal'));
    }
  }, [plan.date, summary]);

  const generate = (mode: PlannerMode) => {
    const next = generateSmartPlan(summary, mode);
    setPlan(next);
    return next;
  };

  const save = () => saveSmartPlan(plan);

  const completeTask = (taskId: string) => {
    const next = completeSmartTask(plan, taskId);
    setPlan(next);
    saveSmartPlan(next);
  };

  return { plan, generate, save, completeTask };
}
