import React from 'react';
import { Clock, Trophy } from 'lucide-react';
import { SmartPlan } from '../../types/smartPlanner';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const TodayPlanSummary: React.FC<{ plan: SmartPlan }> = ({ plan }) => {
  const completed = plan.tasks.filter((task) => task.status === 'completed').length;
  const xp = plan.tasks.filter((task) => task.status === 'completed').reduce((sum, task) => sum + task.xpReward, 0);
  const progress = plan.tasks.length ? (completed / plan.tasks.length) * 100 : 0;

  return (
    <Card>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Today's smart plan</p>
          <h2 className="text-2xl font-semibold text-textPrimary">{completed}/{plan.tasks.length} tasks complete</h2>
        </div>
        <div className="flex gap-2">
          <span className="inline-flex items-center rounded-xl border border-border-subtle px-3 py-2 text-sm text-textSecondary"><Clock className="mr-2 h-4 w-4" />{plan.totalMinutes} min</span>
          <span className="inline-flex items-center rounded-xl border border-border-subtle px-3 py-2 text-sm text-textSecondary"><Trophy className="mr-2 h-4 w-4" />{xp} XP</span>
        </div>
      </div>
      <ProgressBar value={progress} />
      <p className="mt-3 text-sm text-textSecondary">{plan.insight}</p>
    </Card>
  );
};
