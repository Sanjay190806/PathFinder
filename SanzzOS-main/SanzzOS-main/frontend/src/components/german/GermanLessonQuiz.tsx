import React, { useMemo, useState } from 'react';
import { GermanQuizQuestion } from '../../types/german';
import { Button } from '../ui/Button';

interface Props {
  lessonId: string;
  questions: GermanQuizQuestion[];
  onSubmit: (lessonId: string, score: number, total: number, quizType?: string) => void;
}

export const GermanLessonQuiz: React.FC<Props> = ({ lessonId, questions = [], onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(
    () => (questions || []).reduce((sum, question, index) => sum + (answers[index] === question?.answer ? 1 : 0), 0),
    [answers, questions]
  );

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(lessonId, score, (questions || []).length, 'lesson_detail');
  };

  if (!questions || questions.length === 0) {
    return <p className="text-xs text-textMuted italic">No quiz questions yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {questions.map((question, index) => {
        const selected = answers[index];
        const correct = selected === question.answer;
        return (
          <div key={`${question.question}-${index}`} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-textMuted">{(question.type || '').replace(/_/g, ' ')}</p>
            <p className="mt-2 text-sm font-semibold text-textPrimary">{question.question}</p>
            <div className="mt-3 grid gap-2">
              {(question.options || []).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [index]: option }))}
                  className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                    selected === option ? 'border-accentYellow/50 bg-accentYellow/10 text-textPrimary' : 'border-border-subtle bg-bgSurface text-textSecondary hover:bg-white/[0.05]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {submitted && (
              <p className={`mt-2 text-xs ${correct ? 'text-accentEmerald' : 'text-accentRed'}`}>
                {correct ? 'Correct. ' : `Answer: ${question.answer}. `}
                {question.explanation}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-textMuted">
          {submitted ? `Score: ${score}/${questions.length}` : 'Answer every question, then submit.'}
        </p>
        <Button size="sm" onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
          Submit quiz
        </Button>
      </div>
    </div>
  );
};
