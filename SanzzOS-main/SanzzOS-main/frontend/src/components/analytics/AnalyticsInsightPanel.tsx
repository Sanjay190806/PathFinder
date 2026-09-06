import React from 'react';
import { AnalyticsInsight } from '../../types/analytics';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const AnalyticsInsightPanel: React.FC<{ insights: AnalyticsInsight[] }> = ({ insights }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Analytics insights</h3>
    <div className="space-y-3">
      {insights.map((insight) => (
        <div key={insight.id} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
          <div className="mb-1 flex items-center gap-2">
            <p className="font-medium text-textPrimary">{insight.title}</p>
            <Badge variant={insight.severity === 'warning' ? 'warning' : insight.severity === 'success' ? 'success' : 'neutral'}>{insight.severity}</Badge>
          </div>
          <p className="text-sm text-textSecondary">{insight.detail}</p>
        </div>
      ))}
    </div>
  </Card>
);
