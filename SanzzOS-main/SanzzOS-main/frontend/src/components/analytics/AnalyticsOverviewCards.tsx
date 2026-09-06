import React from 'react';
import { AnalyticsSnapshot } from '../../types/analytics';
import { Card } from '../ui/Card';

export const AnalyticsOverviewCards: React.FC<{ snapshot: AnalyticsSnapshot }> = ({ snapshot }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Metric title="Total study hours" value={snapshot.totalStudyHours} />
    <Metric title="Weekly hours" value={snapshot.weeklyStudyHours} />
    <Metric title="Completion rate" value={`${snapshot.completionRate}%`} />
    <Metric title="Learning XP" value={snapshot.xpTotal} />
  </div>
);

const Metric: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <Card>
    <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-textPrimary">{value}</p>
  </Card>
);
