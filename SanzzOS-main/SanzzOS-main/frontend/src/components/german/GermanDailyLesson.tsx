import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { GermanLessonData } from '../../types/german';

interface GermanDailyLessonProps {
  lesson: GermanLessonData;
  minutesToday: number;
  notes: string;
  onNotesChange: (notes: string) => void;
  onCompleteLesson: () => void;
  onLogMinutes: (minutes: number) => void;
}

export const GermanDailyLesson: React.FC<GermanDailyLessonProps> = ({
  lesson,
  minutesToday,
  notes,
  onNotesChange,
  onCompleteLesson,
  onLogMinutes
}) => {
  const progress = Math.min(Math.round((minutesToday / 20) * 100), 100);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Daily Lesson</p>
          <h3 className="mt-1 text-xl font-semibold text-textPrimary">{lesson.title}</h3>
          <p className="mt-1 text-sm text-textSecondary">{lesson.level} · {lesson.vocabularyCount} vocab cards · {lesson.quizScore}% quiz score</p>
        </div>
        <Badge variant={lesson.completed ? 'success' : lesson.locked ? 'neutral' : 'primary'}>
          {lesson.completed ? 'Completed' : lesson.locked ? 'Locked' : 'Ready'}
        </Badge>
      </div>

      <ProgressBar value={progress} color="var(--accent-red)" />

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onLogMinutes(10)} variant="outline" disabled={lesson.locked}>Log 10 min</Button>
        <Button size="sm" onClick={() => onLogMinutes(20)} variant="outline" disabled={lesson.locked}>Log 20 min</Button>
        <Button size="sm" onClick={onCompleteLesson} disabled={lesson.locked || lesson.completed}>
          {lesson.completed ? 'Completed' : 'Complete Lesson'}
        </Button>
      </div>

      <label className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Lesson notes</span>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write grammar reminders, tricky words, or speaking notes..."
          className="min-h-24 w-full rounded-2xl border border-border-subtle bg-bgBase/50 px-3 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-accentRed/30"
        />
      </label>
    </Card>
  );
};
