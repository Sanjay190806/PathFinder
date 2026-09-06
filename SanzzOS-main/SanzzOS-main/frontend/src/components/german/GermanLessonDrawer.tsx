import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { GermanLessonData } from '../../types/german';
import { GermanLessonVocabulary } from './GermanLessonVocabulary';
import { GermanLessonExamples } from './GermanLessonExamples';
import { GermanLessonGrammar } from './GermanLessonGrammar';
import { GermanLessonQuiz } from './GermanLessonQuiz';
import { GermanAskShaylaButton } from './GermanAskShaylaButton';

interface Props {
  lesson: GermanLessonData | null;
  isOpen: boolean;
  lockedMessage?: string | null;
  notes: string;
  onClose: () => void;
  onNotesChange: (notes: string) => void;
  onCompleteLesson: () => void;
  onSubmitQuiz: (lessonId: string, score: number, total: number, quizType?: string) => void;
}

export const GermanLessonDrawer: React.FC<Props> = ({
  lesson,
  isOpen,
  lockedMessage,
  notes,
  onClose,
  onNotesChange,
  onCompleteLesson,
  onSubmitQuiz
}) => {
  const [correctionText, setCorrectionText] = useState('');

  if (!lesson) return null;

  const basePrompt = `Help me with German Lesson ${lesson.order}: ${lesson.title}. Explain it at ${lesson.level} level with examples and give me a small quiz. Objective: ${lesson.objective}`;
  const correctPrompt = correctionText.trim()
    ? `Correct this German sentence and explain mistakes simply: ${correctionText.trim()}`
    : `Give me a simple German sentence correction drill for Lesson ${lesson.order}: ${lesson.title}.`;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={`Lesson ${lesson.order}: ${lesson.title}`} className="max-w-3xl">
      {lockedMessage ? (
        <div className="rounded-2xl border border-accentRed/25 bg-accentRed/10 p-4 text-sm text-textSecondary">
          {lockedMessage}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">German path</p>
                <h2 className="mt-1 text-xl font-semibold text-textPrimary">{lesson.title}</h2>
                <p className="mt-2 text-sm leading-6 text-textSecondary">{lesson.objective}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={lesson.completed ? 'success' : 'primary'}>{lesson.completed ? 'Done' : 'Open'}</Badge>
                <Badge variant="neutral">{lesson.level}</Badge>
                <Badge variant="neutral">{lesson.estimatedMinutes} min</Badge>
                <Badge variant="primary">+{lesson.xpReward} XP</Badge>
              </div>
            </div>
          </div>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-textPrimary">Vocabulary</h3>
            <GermanLessonVocabulary vocabulary={lesson.vocabulary} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-textPrimary">Grammar</h3>
            <GermanLessonGrammar grammar={lesson.grammar} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-textPrimary">Examples</h3>
            <GermanLessonExamples examples={lesson.examples} cultureTip={lesson.cultureTip} />
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-textPrimary">Mini quiz</h3>
            <GermanLessonQuiz lessonId={lesson.id} questions={lesson.quiz} onSubmit={onSubmitQuiz} />
          </section>

          <section className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-textPrimary">Ask Shayla</h3>
                <p className="mt-1 text-xs text-textMuted">Use lesson context without sending API calls on page load.</p>
              </div>
              <GermanAskShaylaButton prompt={basePrompt} />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <GermanAskShaylaButton label="Explain this lesson" prompt={basePrompt} variant="ghost" />
              <GermanAskShaylaButton label="Quiz me again" prompt={`Quiz me again on German Lesson ${lesson.order}: ${lesson.title}. Keep it A1/A2 and explain answers.`} variant="ghost" />
              <GermanAskShaylaButton label="Speaking prompt" prompt={`Give me a speaking practice prompt for German Lesson ${lesson.order}: ${lesson.title}, with A1/A2 sample answer.`} variant="ghost" />
              <GermanAskShaylaButton label="Motivate me" prompt={`Motivate me to complete German Lesson ${lesson.order}: ${lesson.title}. Be calm, direct, and give one tiny next action.`} variant="ghost" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-textSecondary" htmlFor="german-correction">
                Correct my German sentence
              </label>
              <textarea
                id="german-correction"
                rows={2}
                value={correctionText}
                onChange={(event) => setCorrectionText(event.target.value)}
                placeholder="Type a German sentence..."
                className="resize-none rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-xs text-textPrimary focus:border-accentYellow focus:outline-none"
              />
              <div>
                <GermanAskShaylaButton label="Send correction request" prompt={correctPrompt} variant="outline" />
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-textPrimary" htmlFor="lesson-notes">
              Notes
            </label>
            <textarea
              id="lesson-notes"
              rows={4}
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Write what you want to remember from this lesson."
              className="resize-none rounded-xl border border-border-subtle bg-bgSurface px-3 py-2 text-sm text-textPrimary focus:border-accentYellow focus:outline-none"
            />
          </section>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-between gap-3 border-t border-border-subtle bg-bgSurface/95 px-6 py-4 backdrop-blur">
            <p className="text-xs text-textMuted">
              {lesson.completed ? 'Completed lessons stay open for review.' : 'Completing this lesson unlocks the next lesson.'}
            </p>
            <Button onClick={onCompleteLesson} disabled={lesson.completed} className="shrink-0">
              {lesson.completed ? 'Done' : 'Complete lesson'}
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
};
