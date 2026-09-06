import React from 'react';
import { MonthlyAnalytics } from '../../types/analytics';
import { Card } from '../ui/Card';

export const MonthlyProgressChart: React.FC<{ data: MonthlyAnalytics[] }> = ({ data }) => (
  <Card>
    <h3 className="mb-4 text-lg font-semibold text-textPrimary">Monthly progress</h3>
    {data.map((item) => <p key={item.monthLabel} className="text-sm text-textSecondary">{item.monthLabel}: {item.studyHours}h across {item.sessions} learning sessions</p>)}
  </Card>
);
