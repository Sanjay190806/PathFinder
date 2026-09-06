import React from 'react';
import { ReadinessTrend } from '../../types/analytics';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const ReadinessTrendChart: React.FC<{ data: ReadinessTrend[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Placement readiness trend</h3>
    {data.map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-xs text-textSecondary"><span>{item.label}</span><span>{item.readiness}%</span></div><ProgressBar value={item.readiness} /></div>)}
  </Card>
);
