import React from 'react';
import { ProductivityTrend } from '../../types/analytics';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const CompletionRateChart: React.FC<{ data: ProductivityTrend[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Task completion trend</h3>
    <div className="space-y-2">
      {data.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-xs text-textSecondary"><span>{item.label}</span><span>{item.completionRate}%</span></div><ProgressBar value={item.completionRate} /></div>)}
    </div>
  </Card>
);
