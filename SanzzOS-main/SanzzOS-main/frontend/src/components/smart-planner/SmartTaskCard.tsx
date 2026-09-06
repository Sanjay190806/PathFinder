import React from 'react';
import { CheckCircle2, Circle, Play } from 'lucide-react';
import { SmartTask } from '../../types/smartPlanner';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface Props {
  task: SmartTask;
  onComplete: (id: string) => void;
}

export const SmartTaskCard: React.FC<Props> = ({ task, onComplete }) => (
  <Card className={task.status === 'completed' ? 'border-accentEmerald/30 bg-accentEmerald/5' : ''}>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {task.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-accentEmerald" /> : <Circle className="h-5 w-5 text-textMuted" />}
          <h3 className="text-lg font-semibold text-textPrimary">{task.title}</h3>
          <Badge variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'neutral'}>{task.priority}</Badge>
          <Badge>{task.category}</Badge>
        </div>
        <p className="text-sm text-textSecondary">{task.description}</p>
        <p className="mt-3 text-xs text-textMuted">Reason: {task.reason}</p>
        <p className="mt-1 text-xs text-textMuted">Success: {task.successCriteria}</p>
      </div>
      <div className="flex shrink-0 flex-row gap-2 sm:flex-col sm:items-end">
        <Badge variant="primary">{task.estimatedMinutes} min</Badge>
        <Badge variant="success">{task.xpReward} XP</Badge>
        <Button size="sm" variant={task.status === 'completed' ? 'outline' : 'primary'} disabled={task.status === 'completed'} onClick={() => onComplete(task.id)}>
          <Play className="mr-2 h-4 w-4" />
          {task.status === 'completed' ? 'Done' : 'Complete'}
        </Button>
      </div>
    </div>
  </Card>
);
