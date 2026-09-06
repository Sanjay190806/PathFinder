import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface GermanStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  daysPracticed: number;
}

export const GermanStreakCard: React.FC<GermanStreakCardProps> = ({ currentStreak, longestStreak, daysPracticed }) => {
  return (
    <Card className="bg-gradient-to-br from-red-500/10 via-bgCard to-bgCard p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Streak Flame</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-3xl font-semibold text-textPrimary">{currentStreak}</p>
          <p className="text-xs text-textSecondary">Current streak</p>
        </div>
        <Badge variant="primary">{longestStreak} best</Badge>
      </div>
      <p className="mt-3 text-xs text-textSecondary">{daysPracticed} practice days logged.</p>
    </Card>
  );
};
