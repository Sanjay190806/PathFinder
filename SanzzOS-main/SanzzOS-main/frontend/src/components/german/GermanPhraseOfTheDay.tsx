import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GermanPhraseOfTheDay } from '../../types/german';

interface GermanPhraseOfTheDayProps {
  phrase: GermanPhraseOfTheDay;
}

export const GermanPhraseOfTheDayCard: React.FC<GermanPhraseOfTheDayProps> = ({ phrase }) => {
  return (
    <Card className="bg-gradient-to-br from-accentYellow/10 via-bgCard to-bgCard p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accentYellow">Phrase of the Day</p>
        <Badge variant="primary">Daily phrase</Badge>
      </div>
      <p className="mt-3 text-lg font-semibold text-textPrimary">{phrase.phrase}</p>
      <p className="mt-1 text-sm text-textSecondary">{phrase.meaning}</p>
      <p className="mt-3 text-xs text-textSecondary">Pronunciation: {phrase.pronunciationHint}</p>
      <p className="mt-2 text-xs text-textMuted">{phrase.context}</p>
    </Card>
  );
};
