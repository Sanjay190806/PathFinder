import React from 'react';
import { Lightbulb } from 'lucide-react';
import { Card } from '../ui/Card';

export const PlannerInsights: React.FC<{ insight: string }> = ({ insight }) => (
  <Card>
    <div className="flex items-start gap-3">
      <Lightbulb className="mt-1 h-5 w-5 text-accentYellow" />
      <div>
        <h3 className="font-semibold text-textPrimary">Planner reasoning</h3>
        <p className="mt-2 text-sm text-textSecondary">{insight}</p>
      </div>
    </div>
  </Card>
);
