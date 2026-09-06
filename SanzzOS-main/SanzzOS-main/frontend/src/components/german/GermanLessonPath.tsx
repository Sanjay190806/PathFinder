import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { GermanLessonData } from '../../types/german';

interface GermanLessonPathProps {
  lessons: GermanLessonData[];
  activeLessonId: string;
  onSelectLesson: (lessonId: string) => void;
  onOpenLesson: (lesson: GermanLessonData) => void;
}

export const GermanLessonPath: React.FC<GermanLessonPathProps> = ({ lessons, activeLessonId, onSelectLesson, onOpenLesson }) => {
  const completedCount = lessons.filter((lesson) => lesson.completed).length;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Lesson Path</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">30 starter lessons</h3>
        </div>
        <Badge variant="primary">{completedCount}/{lessons.length}</Badge>
      </div>

      <ProgressBar value={Math.min(Math.round((completedCount / lessons.length) * 100), 100)} color="var(--accent-yellow)" />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            onClick={() => !lesson.locked && onSelectLesson(lesson.id)}
            className={`rounded-2xl border p-4 text-left transition ${
              activeLessonId === lesson.id
                ? 'border-accentRed/30 bg-accentRed/10'
                : lesson.completed
                  ? 'border-emerald-500/20 bg-emerald-500/10'
                  : lesson.locked
                    ? 'border-border-subtle bg-white/[0.02] opacity-70'
                    : 'border-border-subtle bg-white/[0.04] hover:border-border-accent hover:bg-white/[0.06]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textMuted">Lesson {index + 1}</p>
                <h4 className="mt-1 text-sm font-semibold text-textPrimary">{lesson.title}</h4>
              </div>
              <Badge variant={lesson.completed ? 'success' : lesson.locked ? 'neutral' : 'primary'}>
                {lesson.completed ? 'Done' : lesson.locked ? 'Locked' : 'Open'}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-textSecondary">{lesson.level}</p>
            {lesson.locked && (
              <p className="mt-2 text-[11px] text-textMuted">Complete previous lesson to unlock this.</p>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenLesson(lesson);
              }}
              className={`mt-3 w-full rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                lesson.locked
                  ? 'border-border-subtle text-textMuted hover:bg-white/[0.03]'
                  : lesson.completed
                    ? 'border-accentEmerald/30 bg-accentEmerald/10 text-accentEmerald hover:bg-accentEmerald/15'
                    : 'border-accentYellow/30 bg-accentYellow/10 text-accentYellow hover:bg-accentYellow/15'
              }`}
            >
              {lesson.completed ? 'Review' : lesson.locked ? 'Locked' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};
