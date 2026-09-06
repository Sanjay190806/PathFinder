import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GermanVocabularyItem } from '../../types/german';

interface GermanReviewQueueProps {
  weakWords: string[];
  vocabulary: GermanVocabularyItem[];
}

export const GermanReviewQueue: React.FC<GermanReviewQueueProps> = ({ weakWords, vocabulary }) => {
  const queued = vocabulary.filter((item) => weakWords.includes(item.id));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Review Queue</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Weak words first</h3>
        </div>
        <Badge variant="orange">{queued.length}</Badge>
      </div>

      <div className="grid gap-2">
        {queued.length > 0 ? queued.map((item) => (
          <div key={item.id} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-3">
            <p className="text-sm font-semibold text-textPrimary">{item.word}</p>
            <p className="text-xs text-textSecondary">{item.meaning}</p>
          </div>
        )) : (
          <p className="text-sm text-textSecondary">No weak words right now. Nice work.</p>
        )}
      </div>
    </Card>
  );
};
