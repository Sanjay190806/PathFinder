import React from 'react';
import { WeeklyAnalytics } from '../../types/analytics';
import { Card } from '../ui/Card';

export const WeeklyProgressChart: React.FC<{ data: WeeklyAnalytics[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Weekly progress</h3>
    {data.map((item) => <p key={item.weekLabel} className="text-sm text-textSecondary">{item.weekLabel}: {item.studyHours}h, {item.completedTasks} completed days</p>)}
  </Card>
);
