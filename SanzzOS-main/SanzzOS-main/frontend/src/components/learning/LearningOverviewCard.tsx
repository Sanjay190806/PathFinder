import React from 'react';
import { BookOpen, Clock, Flame, Trophy } from 'lucide-react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const LearningOverviewCard: React.FC<{ overview: { activePaths: number; weeklyHours: number; totalHours: number; xp: number; averageMastery: number; dueRevisionCount: number } }> = ({ overview }) => (
  <Card>
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-textMuted">Learning OS</p>
        <h2 className="text-2xl font-semibold text-textPrimary">{overview.averageMastery}% average mastery</h2>
      </div>
      <div className="rounded-2xl border border-border-subtle bg-white/[0.03] px-3 py-2 text-sm text-textSecondary">
        {overview.dueRevisionCount} revision due
      </div>
    </div>
    <ProgressBar value={overview.averageMastery} />
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      <Metric icon={<BookOpen className="h-4 w-4" />} label="Active paths" value={overview.activePaths} />
      <Metric icon={<Clock className="h-4 w-4" />} label="Weekly hours" value={overview.weeklyHours.toFixed(1)} />
      <Metric icon={<Flame className="h-4 w-4" />} label="Total hours" value={overview.totalHours.toFixed(1)} />
      <Metric icon={<Trophy className="h-4 w-4" />} label="Learning XP" value={overview.xp} />
    </div>
  </Card>
);

const Metric: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
    <div className="mb-2 text-accentBlue">{icon}</div>
    <p className="text-xs text-textMuted">{label}</p>
    <p className="text-lg font-semibold text-textPrimary">{value}</p>
  </div>
);
