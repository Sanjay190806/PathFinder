import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

interface GermanHeaderProps {
  level: string;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  todayMinutes: number;
  dailyTargetMinutes: number;
}

export const GermanHeader: React.FC<GermanHeaderProps> = ({ level, xp, currentStreak, longestStreak, todayMinutes, dailyTargetMinutes }) => {
  const progress = Math.min(Math.round((todayMinutes / dailyTargetMinutes) * 100), 100);

  return (
    <Card className="border-border-accent/20 bg-gradient-to-r from-black/70 via-bgCard to-bgCard p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accentRed">German</p>
          <h2 className="mt-2 text-3xl font-semibold text-textPrimary">German learning, career readiness, and daily streak momentum.</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-textSecondary">
            Premium A1 to B1 preview learning loop with lesson cards, vocabulary review, quizzes, and a calm black-red-gold dashboard feel.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{level}</Badge>
          <Badge variant="primary">Daily target: {dailyTargetMinutes} min</Badge>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">German XP</p>
          <p className="mt-2 text-2xl font-semibold text-textPrimary">{xp}</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Current Streak</p>
          <p className="mt-2 text-2xl font-semibold text-textPrimary">{currentStreak} days</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Longest Streak</p>
          <p className="mt-2 text-2xl font-semibold text-textPrimary">{longestStreak} days</p>
        </div>
        <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Today</p>
          <p className="mt-2 text-2xl font-semibold text-textPrimary">{todayMinutes} min</p>
          <ProgressBar value={progress} color="var(--accent-red)" className="mt-3" />
        </div>
      </div>
    </Card>
  );
};
