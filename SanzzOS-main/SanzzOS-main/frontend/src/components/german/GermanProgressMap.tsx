import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { GermanLessonData } from '../../types/german';

interface GermanProgressMapProps {
  lessons: GermanLessonData[];
  currentLessonId: string;
}

export const GermanProgressMap: React.FC<GermanProgressMapProps> = ({ lessons, currentLessonId }) => {
  const completed = lessons.filter((lesson) => lesson.completed).length;
  const milestones = [
    { label: 'A1 Beginner', target: 6 },
    { label: 'A1 Strong', target: 11 },
    { label: 'A2 Beginner', target: 18 },
    { label: 'A2 Strong', target: 24 },
    { label: 'B1 Preview', target: 30 }
  ];

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Progress Map</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Milestones and current lane</h3>
        </div>
        <Badge variant="primary">{completed}/{lessons.length}</Badge>
      </div>

      <ProgressBar value={Math.min(Math.round((completed / lessons.length) * 100), 100)} color="var(--accent-red)" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {milestones.map((milestone) => (
          <div key={milestone.label} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
            <p className="text-sm font-semibold text-textPrimary">{milestone.label}</p>
            <p className="mt-1 text-xs text-textSecondary">Unlock at lesson {milestone.target}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-textSecondary">Current lane: <span className="font-semibold text-textPrimary">{currentLessonId}</span></p>
    </Card>
  );
};
