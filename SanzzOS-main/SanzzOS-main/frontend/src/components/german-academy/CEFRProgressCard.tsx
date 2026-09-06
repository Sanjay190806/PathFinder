import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';

export const CEFRProgressCard: React.FC<{
  track: string;
  lessonsCompleted: number;
  vocabularyKnown: number;
  speakingSessions: number;
  listeningSessions: number;
  grammarTopics: number;
  readiness: number;
}> = ({ track, lessonsCompleted, vocabularyKnown, speakingSessions, listeningSessions, grammarTopics, readiness }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">CEFR progression</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">{track}</h3>
        <p className="mt-1 text-xs text-textSecondary">Estimated readiness, not a certification claim.</p>
      </div>
      <ProgressBar value={readiness} color="#3B82F6" />
      <div className="grid gap-2 text-sm text-textSecondary sm:grid-cols-2">
        <div>Lessons completed: <span className="font-semibold text-textPrimary">{lessonsCompleted}</span></div>
        <div>Vocabulary known: <span className="font-semibold text-textPrimary">{vocabularyKnown}</span></div>
        <div>Speaking sessions: <span className="font-semibold text-textPrimary">{speakingSessions}</span></div>
        <div>Listening sessions: <span className="font-semibold text-textPrimary">{listeningSessions}</span></div>
        <div>Grammar topics: <span className="font-semibold text-textPrimary">{grammarTopics}</span></div>
        <div>Estimated readiness: <span className="font-semibold text-textPrimary">{readiness}%</span></div>
      </div>
    </Card>
  );
};

