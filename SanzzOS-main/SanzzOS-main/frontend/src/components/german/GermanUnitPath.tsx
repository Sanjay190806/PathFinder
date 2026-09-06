import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CheckCircle2, Lock, Play } from 'lucide-react';
import { GermanLessonProgress } from '../../types/german';

export interface UnitData {
  number: number;
  title: string;
  description: string;
  lessonIds: string[];
}

export const GERMAN_UNITS: UnitData[] = [
  {
    number: 1,
    title: 'Introductions & College Life',
    description: 'Learn to greet others, share information about college, studies, and introduce yourself in German.',
    lessonIds: ['german-1', 'german-2', 'german-3', 'german-4', 'german-5']
  },
  {
    number: 2,
    title: 'Daily Routine',
    description: 'Talk about your daily schedule, time, food, hobbies, and student life activities.',
    lessonIds: ['german-6', 'german-7', 'german-8', 'german-9', 'german-10']
  },
  {
    number: 3,
    title: 'Grammar Foundation',
    description: 'Deep dive into basic verb conjugations, accusative case, prepositions, and sentence syntax.',
    lessonIds: ['german-11', 'german-12', 'german-13', 'german-14', 'german-15']
  },
  {
    number: 4,
    title: 'Career & Study Vocabulary',
    description: 'Master terminology for jobs, placements, ECE technical domains, and project work in German.',
    lessonIds: ['german-16', 'german-17', 'german-18', 'german-19', 'german-20']
  },
  {
    number: 5,
    title: 'Germany Basics',
    description: 'Navigate transport, housing, university applications, and cultural insights for studying in Germany.',
    lessonIds: ['german-21', 'german-22', 'german-23', 'german-24', 'german-25']
  },
  {
    number: 6,
    title: 'A1 Revision',
    description: 'Consolidate A1 vocabulary, grammar drills, mock interview responses, and placement readiness drills.',
    lessonIds: ['german-26', 'german-27', 'german-28', 'german-29', 'german-30']
  }
];

interface GermanUnitPathProps {
  completedLessons: Record<string, GermanLessonProgress>;
  currentLessonId: string;
  onSelectLesson: (lessonId: string) => void;
}

export const GermanUnitPath: React.FC<GermanUnitPathProps> = ({
  completedLessons,
  currentLessonId,
  onSelectLesson
}) => {
  return (
    <div className="flex flex-col gap-8 relative before:absolute before:left-6 before:top-4 before:bottom-4 before:w-[2px] before:bg-border-subtle/50">
      {GERMAN_UNITS.map((unit) => {
        const unitLessons = unit.lessonIds;
        const completedCount = unitLessons.filter((id) => completedLessons[id]?.completed).length;
        const totalCount = unitLessons.length;
        const isStarted = unitLessons.some((id) => id === currentLessonId || completedLessons[id]?.completed);
        const isFullyCompleted = completedCount === totalCount;

        return (
          <div key={unit.number} className="relative pl-12 flex flex-col gap-3 group">
            {/* Unit Node Point */}
            <div className={`absolute left-3 top-1 h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
              isFullyCompleted
                ? 'bg-accentEmerald/20 border-accentEmerald text-accentEmerald shadow-glow-emerald'
                : isStarted
                  ? 'bg-accentBlue/20 border-accentBlue text-accentBlue shadow-glow-blue'
                  : 'bg-bgSurface border-border-subtle text-textMuted'
            }`}>
              {isFullyCompleted ? (
                <CheckCircle2 className="h-4.5 w-4.5" />
              ) : (
                <span className="text-xs font-bold">{unit.number}</span>
              )}
            </div>

            {/* Content Card */}
            <Card className={`border p-4 flex flex-col gap-3 transition ${
              isStarted ? 'border-border-accent bg-bgSurface/40' : 'border-border-subtle bg-bgSurface/10 opacity-70'
            }`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Unit {unit.number}</span>
                  <h4 className="text-sm font-bold text-textPrimary">{unit.title}</h4>
                </div>
                <Badge variant={isFullyCompleted ? 'success' : isStarted ? 'primary' : 'neutral'}>
                  {completedCount} / {totalCount} Done
                </Badge>
              </div>

              <p className="text-xs text-textSecondary leading-relaxed">{unit.description}</p>

              {/* Lesson Pills Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-2">
                {unitLessons.map((lessonId, idx) => {
                  const progress = completedLessons[lessonId];
                  const isCompleted = progress?.completed;
                  const isActive = lessonId === currentLessonId;
                  const isLocked = !isCompleted && !isActive && !completedLessons[unitLessons[idx - 1]]?.completed && idx > 0;

                  return (
                    <button
                      key={lessonId}
                      disabled={isLocked}
                      onClick={() => onSelectLesson(lessonId)}
                      className={`px-3 py-2 rounded-xl border text-xs text-left transition flex items-center justify-between gap-1.5 ${
                        isCompleted
                          ? 'border-accentEmerald/20 bg-accentEmerald/5 text-accentEmerald hover:bg-accentEmerald/10'
                          : isActive
                            ? 'border-accentBlue bg-accentBlue/10 text-accentBlue shadow-glow-blue hover:bg-accentBlue/20 animate-pulse'
                            : 'border-border-subtle bg-bgSurface/20 text-textSecondary hover:bg-bg-glass-hover'
                      } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate font-semibold">L{idx + 1}</span>
                      {isLocked ? (
                        <Lock className="h-3 w-3 text-textMuted" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      ) : (
                        <Play className="h-3 w-3 shrink-0 fill-current" />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};
