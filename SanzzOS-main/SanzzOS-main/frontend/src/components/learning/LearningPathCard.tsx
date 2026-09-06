import React from 'react';
import { CalendarClock } from 'lucide-react';
import { LearningPath } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';

export const LearningPathCard: React.FC<{ path: LearningPath; onSelect: () => void }> = ({ path, onSelect }) => (
  <Card hoverable onClick={onSelect}>
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-semibold text-textPrimary">{path.title}</h3>
        <p className="mt-1 text-xs text-textMuted">{path.category.replace('_', ' ')}</p>
      </div>
      <Badge variant={path.priority === 'high' ? 'danger' : path.priority === 'medium' ? 'warning' : 'neutral'}>{path.priority}</Badge>
    </div>
    <div className="mb-2 flex items-center justify-between text-xs text-textSecondary">
      <span>Mastery</span>
      <span>{path.masteryPercentage}%</span>
    </div>
    <ProgressBar value={path.masteryPercentage} />
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-textSecondary">
      <span>{path.weeklyHours.toFixed(1)}h this week</span>
      <span>{path.streak} streak</span>
      <span className="flex items-center gap-1"><CalendarClock className="h-3 w-3" />{path.nextReviewAt || 'No review'}</span>
      <span className="capitalize">{path.status.replace('_', ' ')}</span>
    </div>
    <Button className="mt-4 w-full" size="sm" variant="outline" onClick={(event) => { event.stopPropagation(); onSelect(); }}>Open path</Button>
  </Card>
);
