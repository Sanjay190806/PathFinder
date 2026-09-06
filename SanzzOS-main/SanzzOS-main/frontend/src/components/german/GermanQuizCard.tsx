import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GermanQuizCardProps {
  lessonId: string;
  lessonTitle: string;
  onSubmitQuiz: (lessonId: string, score: number, total: number, quizType?: string) => void;
}

export const GermanQuizCard: React.FC<GermanQuizCardProps> = ({ lessonId, lessonTitle, onSubmitQuiz }) => {
  const [picked, setPicked] = useState<string | null>(null);
  const correct = 'Ich lerne Deutsch.';
  const options = ['Ich lerne Deutsch.', 'Ich spreche Englisch.', 'Ich bin müde.', 'Das Buch ist rot.'];

  const handleSubmit = () => {
    const score = picked === correct ? 1 : 0;
    onSubmitQuiz(lessonId, score, 1, 'german-quiz');
  };

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Quick Quiz</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{lessonTitle}</h3>
        </div>
        <Badge variant="primary">1 question</Badge>
      </div>

      <div className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
        <p className="text-sm font-semibold text-textPrimary">Which sentence means "I learn German"?</p>
        <div className="mt-3 grid gap-2">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setPicked(option)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                picked === option
                  ? 'border-accentRed/30 bg-accentRed/10 text-textPrimary'
                  : 'border-border-subtle bg-bgSurface/40 text-textSecondary hover:border-border-accent hover:text-textPrimary'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={!picked}>Submit Quiz</Button>
    </Card>
  );
};
