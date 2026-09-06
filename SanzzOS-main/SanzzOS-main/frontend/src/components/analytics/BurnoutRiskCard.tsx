import React from 'react';
import { AnalyticsSnapshot } from '../../types/analytics';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const BurnoutRiskCard: React.FC<{ snapshot: AnalyticsSnapshot }> = ({ snapshot }) => (
  <Card>
    <h3 className="text-lg font-semibold text-textPrimary">Burnout and focus</h3>
    <div className="mt-4 flex flex-wrap gap-2">
      <Badge variant={snapshot.burnoutRisk === 'high' ? 'danger' : snapshot.burnoutRisk === 'medium' ? 'warning' : 'success'}>Risk: {snapshot.burnoutRisk}</Badge>
      <Badge>Efficiency: {snapshot.learningEfficiencyScore}%</Badge>
      <Badge>Focus balance: {snapshot.focusBalanceScore}%</Badge>
    </div>
    <p className="mt-3 text-sm text-textSecondary">Balances workload, consistency, revision backlog, and category spread.</p>
  </Card>
);
