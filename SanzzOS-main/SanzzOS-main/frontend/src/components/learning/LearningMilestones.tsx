import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { LearningMilestone } from '../../types/learning';
import { Card } from '../ui/Card';

export const LearningMilestones: React.FC<{ milestones: LearningMilestone[] }> = ({ milestones }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Milestones</h3>
    <div className="space-y-2">
      {milestones.map((item) => (
        <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          {item.completed ? <CheckCircle2 className="h-4 w-4 text-accentEmerald" /> : <Circle className="h-4 w-4 text-textMuted" />}
          <div>
            <p className="text-sm font-medium text-textPrimary">{item.title}</p>
            <p className="text-xs text-textMuted">{item.dueHint}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
