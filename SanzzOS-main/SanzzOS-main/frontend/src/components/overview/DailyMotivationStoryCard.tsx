import React from 'react';
import { DAILY_180_QUOTES, SUNDAY_REAL_PERSON_STORIES } from '../../data/dailyMotivation';
import { useUIStore } from '../../app/store/useUIStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const DailyMotivationStoryCard: React.FC = () => {
  const currentDay = useUIStore((s) => s.currentDay);
  const quote = DAILY_180_QUOTES[(Math.max(1, currentDay) - 1) % DAILY_180_QUOTES.length];
  const now = new Date();
  const isSunday = now.getDay() === 0;
  const weekIndex = Math.floor((Math.max(1, currentDay) - 1) / 7) % SUNDAY_REAL_PERSON_STORIES.length;
  const story = SUNDAY_REAL_PERSON_STORIES[weekIndex];

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-5" style={{ border: '1px solid rgba(59,130,246,0.16)', background: 'rgba(0,8,20,0.72)' }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-textMuted">Daily quote</p>
          <Badge variant="primary">Day {quote.day}/180</Badge>
        </div>
        <h3 className="mt-3 text-xl font-black text-textPrimary">"{quote.quote}"</h3>
        <p className="mt-3 text-sm text-textSecondary">{quote.mission}</p>
      </Card>

      <Card className="p-5" style={{ border: '1px solid rgba(234,179,8,0.16)', background: 'rgba(18,12,0,0.72)' }}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-textMuted">Sunday real story</p>
          <Badge variant={isSunday ? 'warning' : 'neutral'}>{isSunday ? 'Today' : 'Next Sunday'}</Badge>
        </div>
        <h3 className="mt-3 text-lg font-black text-textPrimary">{story.person}</h3>
        <p className="text-xs text-textMuted">{story.field}</p>
        <p className="mt-3 text-sm leading-relaxed text-textSecondary">{story.story}</p>
        <p className="mt-3 text-sm font-semibold text-textPrimary">{story.takeaway}</p>
      </Card>
    </div>
  );
};
