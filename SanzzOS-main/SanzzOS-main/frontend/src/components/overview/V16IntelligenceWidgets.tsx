import React from 'react';
import { Brain, Building2, CalendarCheck, ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useAIBrain } from '../../hooks/useAIBrain';
import { useSmartPlanner } from '../../hooks/useSmartPlanner';
import { usePlacementOS } from '../../hooks/usePlacementOS';
import { navigateToPath } from '../../utils/navigation';

export const V16IntelligenceWidgets: React.FC = () => {
  const { summary } = useAIBrain();
  const { plan } = useSmartPlanner();
  const { readiness, state } = usePlacementOS();
  const priorityCompany = state?.companies ? state.companies.find((company) => company.priority === 'high') : undefined;
  const completed = plan?.tasks ? plan.tasks.filter((task) => task.status === 'completed').length : 0;

  const placementScore = summary?.placementReadinessScore ?? 0;
  const nextActionText = summary?.recommendedNextAction ?? 'No recommended action yet.';
  const planTasksLength = plan?.tasks?.length ?? 0;
  const planTotalMinutes = plan?.totalMinutes ?? 0;
  const planModeText = plan?.mode ? plan.mode.replace('_', ' ') : 'normal';
  const planNextTaskText = plan?.tasks ? (plan.tasks.find((task) => task.status !== 'completed')?.title || 'Plan complete') : 'Plan complete';
  const readinessScore = readiness?.score ?? 0;
  const readinessNextAction = readiness?.nextAction ?? 'Update details';

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-accentBlue" />
          <h3 className="font-semibold text-textPrimary">AI Brain summary</h3>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-textSecondary">Readiness</span>
          <span className="font-semibold text-textPrimary">{placementScore}%</span>
        </div>
        <ProgressBar value={placementScore} />
        <p className="mt-3 text-sm text-textSecondary">{nextActionText}</p>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/ai-brain')}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-accentEmerald" />
          <h3 className="font-semibold text-textPrimary">Today's smart plan</h3>
        </div>
        <p className="text-2xl font-semibold text-textPrimary">{completed}/{planTasksLength}</p>
        <p className="mt-1 text-sm text-textSecondary">{planTotalMinutes} minutes · {planModeText}</p>
        <p className="mt-3 text-sm text-textSecondary">{planNextTaskText}</p>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/smart-planner')}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accentPurple" />
          <h3 className="font-semibold text-textPrimary">Placement OS</h3>
        </div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="text-textSecondary">Readiness</span>
          <span className="font-semibold text-textPrimary">{readinessScore}%</span>
        </div>
        <ProgressBar value={readinessScore} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="primary">{priorityCompany?.name || 'Priority company'}</Badge>
          <Badge>{readinessNextAction}</Badge>
        </div>
        <Button className="mt-4" size="sm" variant="outline" onClick={() => navigateToPath('/placement-os')}>Open <ArrowRight className="ml-2 h-4 w-4" /></Button>
      </Card>
    </div>
  );
};
