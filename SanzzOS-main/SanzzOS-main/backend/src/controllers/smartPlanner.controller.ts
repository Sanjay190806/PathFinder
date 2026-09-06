import { Request, Response } from 'express';
import { getAIBrainSummary } from '../services/aiBrain.service.js';

export function getTodayPlan(_req: Request, res: Response) {
  res.json({
    id: `backend-plan-${new Date().toISOString().split('T')[0]}`,
    date: new Date().toISOString().split('T')[0],
    mode: 'normal',
    tasks: [
      { id: 'backend-dsa', title: 'Solve one Java DSA problem', category: 'coding', estimatedMinutes: 45, priority: 'high', status: 'todo' },
      { id: 'backend-sql', title: 'Practice SQL joins', category: 'sql', estimatedMinutes: 35, priority: 'high', status: 'todo' }
    ],
    insight: getAIBrainSummary().recommendedNextAction
  });
}

export function generatePlan(req: Request, res: Response) {
  res.json({ mode: req.body?.mode || 'normal', plan: getTodayPlanPayload(req.body?.mode || 'normal') });
}

export function completeTask(req: Request, res: Response) {
  res.json({ completed: true, taskId: req.params.id });
}

export function savePlan(_req: Request, res: Response) {
  res.json({ saved: true });
}

function getTodayPlanPayload(mode: string) {
  return {
    id: `backend-plan-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    mode,
    insight: getAIBrainSummary().recommendedNextAction
  };
}
