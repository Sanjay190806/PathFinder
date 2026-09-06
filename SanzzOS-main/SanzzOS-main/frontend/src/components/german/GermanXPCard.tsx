import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

interface GermanXPCardProps {
  xp: number;
  completedLessons: number;
  totalLessons: number;
}

export const GermanXPCard: React.FC<GermanXPCardProps> = ({ xp, completedLessons, totalLessons }) => {
  const nextGoal = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

  return (
    <Card className="bg-white/[0.04] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">XP Ring</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-textPrimary">{xp}</p>
          <p className="text-xs text-textSecondary">Earned through lessons, quizzes, reviews, and streaks.</p>
        </div>
        <p className="text-sm font-semibold text-accentYellow">{completedLessons}/{totalLessons}</p>
      </div>
      <ProgressBar value={nextGoal} color="var(--accent-yellow)" className="mt-4" />
    </Card>
  );
};
