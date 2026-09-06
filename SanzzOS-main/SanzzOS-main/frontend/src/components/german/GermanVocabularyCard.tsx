import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { GermanVocabularyItem, GermanVocabularyProgress } from '../../types/german';

interface GermanVocabularyCardProps {
  item: GermanVocabularyItem;
  progress?: GermanVocabularyProgress;
  onMarkKnown: (wordId: string) => void;
  onMarkWeak: (wordId: string) => void;
  onReview: (wordId: string) => void;
}

export const GermanVocabularyCard: React.FC<GermanVocabularyCardProps> = ({ item, progress, onMarkKnown, onMarkWeak, onReview }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Vocabulary Card</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{item.word}</h3>
          <p className="mt-1 text-sm text-textSecondary">{item.meaning}</p>
        </div>
        <Badge variant="primary">{item.category}</Badge>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border-subtle bg-white/[0.04] p-4 text-sm">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Pronunciation</p>
          <p className="mt-1 text-textPrimary">{item.pronunciationHint}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Example</p>
          <p className="mt-1 text-textPrimary">{item.exampleSentence}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => onMarkKnown(item.id)}>Known</Button>
        <Button size="sm" variant="outline" onClick={() => onMarkWeak(item.id)}>Weak</Button>
        <Button size="sm" variant="ghost" onClick={() => onReview(item.id)}>Review</Button>
      </div>

      <p className="text-xs text-textSecondary">
        Status: <span className="font-semibold text-textPrimary">{progress?.status || 'learning'}</span>
      </p>
    </Card>
  );
};
