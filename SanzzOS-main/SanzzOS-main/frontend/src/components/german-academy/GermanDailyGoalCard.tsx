import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const GermanDailyGoalCard: React.FC<{
  speakingMinutes: number;
  listeningMinutes: number;
  reviewedToday: number;
}> = ({ speakingMinutes, listeningMinutes, reviewedToday }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Daily goal</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Tiny German rhythm</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary">{speakingMinutes} speaking min</Badge>
        <Badge variant="success">{listeningMinutes} listening min</Badge>
        <Badge variant="neutral">{reviewedToday} vocab reviewed</Badge>
      </div>
      <p className="text-sm leading-6 text-textSecondary">
        Keep the goal small: one short speaking round, one listening exercise, and a quick vocab review.
      </p>
    </Card>
  );
};

