import React from 'react';
import { LearningRecommendation } from '../../types/learning';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const LearningRecommendations: React.FC<{ recommendations: LearningRecommendation[] }> = ({ recommendations }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Learning recommendations</h3>
    <div className="space-y-3">
      {recommendations.map((item) => (
        <div key={item.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center gap-2">
            <p className="font-medium text-textPrimary">{item.title}</p>
            <Badge variant={item.priority === 'high' ? 'danger' : 'warning'}>{item.priority}</Badge>
          </div>
          <p className="text-sm text-textSecondary">{item.detail}</p>
        </div>
      ))}
    </div>
  </Card>
);
