import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const GermanPronunciationFeedback: React.FC<{
  confidenceRating: number;
  wordsMatched: number;
  sentenceComplete: number;
  repetitionCount: number;
}> = ({ confidenceRating, wordsMatched, sentenceComplete, repetitionCount }) => {
  const score = Math.max(0, Math.min(100, Math.round(wordsMatched * 16 + sentenceComplete * 20 + confidenceRating * 10 - repetitionCount * 5)));
  return (
    <Card className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Speaking feedback</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">Approximate browser-based scoring</h3>
      </div>
      <p className="text-xs text-textSecondary">Browser-based approximate speaking feedback, not certified pronunciation scoring.</p>
      <ProgressBar value={score} color="#8B5CF6" />
      <div className="grid gap-2 text-sm text-textSecondary sm:grid-cols-2">
        <div>Words matched: <span className="font-semibold text-textPrimary">{wordsMatched}</span></div>
        <div>Sentence complete: <span className="font-semibold text-textPrimary">{sentenceComplete}/5</span></div>
        <div>Confidence rating: <span className="font-semibold text-textPrimary">{confidenceRating}/5</span></div>
        <div>Repetition count: <span className="font-semibold text-textPrimary">{repetitionCount}</span></div>
      </div>
    </Card>
  );
};

