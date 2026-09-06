import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ArticleNoun {
  article: 'der' | 'die' | 'das';
  noun: string;
  english: string;
}

const NOUNS: ArticleNoun[] = [
  { article: 'der', noun: 'Student', english: 'student (male)' },
  { article: 'die', noun: 'Studentin', english: 'student (female)' },
  { article: 'das', noun: 'Buch', english: 'book' },
  { article: 'die', noun: 'Schule', english: 'school' },
  { article: 'der', noun: 'Lehrer', english: 'teacher' },
  { article: 'das', noun: 'Projekt', english: 'project' },
  { article: 'die', noun: 'Universität', english: 'university' },
  { article: 'das', noun: 'Essen', english: 'food / eating' },
  { article: 'der', noun: 'Computer', english: 'computer' },
  { article: 'die', noun: 'Arbeit', english: 'work / job' }
];

export const GermanArticleTrainer: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<'der' | 'die' | 'das' | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  const currentItem = NOUNS[index];

  const handleChoose = (article: 'der' | 'die' | 'das') => {
    if (answered) return;
    const isCorrect = article === currentItem.article;
    setCorrect(isCorrect);
    setAnswered(true);
    setSelected(article);

    if (isCorrect) {
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setAnswered(false);
    setSelected(null);
    setIndex((index + 1) % NOUNS.length);
  };

  return (
    <Card className="flex flex-col gap-4 border-accentPurple/20 bg-accentPurple/5">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider">
          Noun Article Trainer (der / die / das)
        </span>
        <Badge variant="primary" className="bg-accentPurple/10 border-accentPurple/25 text-accentPurple">
          Streak: {streak} 🔥
        </Badge>
      </div>

      <div className="text-center py-4 flex flex-col gap-1.5">
        <span className="text-[10px] text-textMuted font-bold uppercase tracking-widest">
          Choose the correct article:
        </span>
        <h2 className="text-3xl font-extrabold text-textPrimary tracking-tight">
          _ {currentItem.noun}
        </h2>
        <span className="text-xs text-textMuted">({currentItem.english})</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(['der', 'die', 'das'] as const).map((article) => {
          const isSelected = selected === article;
          const isCorrectAnswer = article === currentItem.article;

          let btnClass = 'border-border-subtle bg-bgSurface/20 text-textSecondary hover:bg-bg-glass-hover font-bold';
          if (answered) {
            if (isCorrectAnswer) {
              btnClass = 'border-accentEmerald bg-accentEmerald/10 text-accentEmerald font-bold shadow-glow-emerald';
            } else if (isSelected) {
              btnClass = 'border-accentRed bg-accentRed/10 text-accentRed font-bold';
            } else {
              btnClass = 'border-border-subtle bg-bgSurface/10 text-textMuted opacity-50';
            }
          }

          return (
            <button
              key={article}
              disabled={answered}
              onClick={() => handleChoose(article)}
              className={`py-3 rounded-xl border text-sm text-center uppercase tracking-widest transition ${btnClass}`}
            >
              {article}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-white/5 animate-fadeIn">
          <div className="text-xs text-textSecondary text-center">
            {correct ? (
              <span className="text-accentEmerald font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Correct! der {currentItem.noun}
              </span>
            ) : (
              <span className="text-accentRed font-bold flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" /> Incorrect. The correct noun is: {currentItem.article} {currentItem.noun}
              </span>
            )}
          </div>
          <Button size="sm" variant="primary" onClick={handleNext} className="w-full text-xs mt-2">
            Next Noun
          </Button>
        </div>
      )}
    </Card>
  );
};
