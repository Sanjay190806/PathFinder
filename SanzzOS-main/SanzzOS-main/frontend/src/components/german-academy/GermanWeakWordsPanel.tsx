import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCareerStore } from '../../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../../data/germanLessons';

export const GermanWeakWordsPanel: React.FC = () => {
  const weakWords = useCareerStore((s) => s.weakWords);
  const markWordKnown = useCareerStore((s) => s.markWordKnown);
  const markWordWeak = useCareerStore((s) => s.markWordWeak);

  const items = useMemo(() => {
    const lookup = new Map(GERMAN_LESSONS.flatMap((lesson) => lesson.vocabulary).map((word) => [word.id, word]));
    return weakWords.map((wordId) => lookup.get(wordId)).filter(Boolean).slice(0, 8);
  }, [weakWords]);

  if (!items.length) {
    return <Card className="text-sm text-textSecondary">No weak words right now. Nice. Keep the momentum going.</Card>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {items.map((word) => (
        <Card key={word!.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-textPrimary">{word!.word}</p>
              <p className="text-xs text-textSecondary">{word!.meaning}</p>
            </div>
            <Badge variant="warning">Weak</Badge>
          </div>
          <p className="text-xs text-textMuted">{word!.exampleSentence}</p>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={() => markWordKnown(word!.id)}>
              Know it
            </Button>
            <Button size="sm" variant="ghost" onClick={() => markWordWeak(word!.id)}>
              Keep reviewing
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

