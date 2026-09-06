import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useCareerStore } from '../../app/store/useCareerStore';
import { GERMAN_LESSONS } from '../../data/germanLessons';
import { nextGermanReviewDate } from '../../utils/germanProgressUtils';

export const GermanSRSReview: React.FC = () => {
  const vocabulary = useCareerStore((s) => s.vocabulary);
  const weakWords = useCareerStore((s) => s.weakWords);
  const submitWordReview = useCareerStore((s) => s.submitWordReview);
  const logVocabularyReview = useCareerStore((s) => s.logGermanVocabularyReview);

  const items = useMemo(() => {
    return GERMAN_LESSONS.flatMap((lesson) => lesson.vocabulary).filter((item) => {
      const progress = vocabulary[item.id];
      return weakWords.includes(item.id) || progress?.status === 'review' || progress?.reviewStage != null;
    }).slice(0, 10);
  }, [vocabulary, weakWords]);

  if (items.length === 0) {
    return (
      <Card className="text-sm text-textSecondary">
        No review words yet. Complete lessons or mark words as weak to build a review queue.
      </Card>
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {items.map((word) => {
        const progress = vocabulary[word.id];
        const stage = progress?.reviewStage || 0;
        const due = progress?.nextReviewDate ? new Date(progress.nextReviewDate).toLocaleDateString() : nextGermanReviewDate(stage).slice(0, 10);

        return (
          <Card key={word.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-textPrimary">{word.word}</p>
                <p className="text-xs text-textSecondary">{word.meaning}</p>
              </div>
              <Badge variant={weakWords.includes(word.id) ? 'warning' : 'neutral'}>Stage {stage}</Badge>
            </div>

            <p className="text-xs text-textMuted">Next review: {due}</p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="primary" onClick={() => {
                logVocabularyReview(1);
                submitWordReview(word.id, true);
              }}>
                Reviewed
              </Button>
              <Button size="sm" variant="outline" onClick={() => submitWordReview(word.id, true)}>
                I knew it
              </Button>
              <Button size="sm" variant="ghost" onClick={() => submitWordReview(word.id, false)}>
                Mark weak
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
