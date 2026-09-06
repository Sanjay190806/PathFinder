import React from 'react';
import { Card } from '../ui/Card';

interface GrammarTopic {
  title: string;
  explanation: string;
  example: string;
}

interface GermanGrammarCardProps {
  topics: GrammarTopic[];
}

export const GermanGrammarCard: React.FC<GermanGrammarCardProps> = ({ topics }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Grammar Focus</p>
        <h3 className="mt-1 text-lg font-semibold text-textPrimary">A1 / A2 grammar anchors</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {topics.map((topic) => (
          <div key={topic.title} className="rounded-2xl border border-border-subtle bg-white/[0.04] p-4">
            <p className="text-sm font-semibold text-textPrimary">{topic.title}</p>
            <p className="mt-2 text-xs leading-6 text-textSecondary">{topic.explanation}</p>
            <p className="mt-3 text-xs text-textMuted">{topic.example}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};
