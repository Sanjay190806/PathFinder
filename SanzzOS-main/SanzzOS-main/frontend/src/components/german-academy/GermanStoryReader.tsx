import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { GermanStory } from '../../data/germanStories';

export const GermanStoryReader: React.FC<{ story: GermanStory | null }> = ({ story }) => {
  if (!story) {
    return <Card className="text-sm text-textSecondary">Select a story to read it here.</Card>;
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Daily story</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{story.title}</h3>
        </div>
        <Badge variant={story.level === 'A1' ? 'success' : 'primary'}>{story.level}</Badge>
      </div>
      <p className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm leading-6 text-textPrimary">{story.german}</p>
      <p className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm leading-6 text-textSecondary">{story.english}</p>
      <div className="flex flex-wrap gap-2">
        {story.comprehensionQuestions.map((q) => <Badge key={q} variant="neutral">{q}</Badge>)}
      </div>
    </Card>
  );
};

