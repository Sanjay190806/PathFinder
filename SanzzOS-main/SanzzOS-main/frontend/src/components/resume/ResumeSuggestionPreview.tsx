import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

type Props = {
  title: string;
  items: string[];
};

export const ResumeSuggestionPreview: React.FC<Props> = ({ title, items }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Preview</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">{title}</h3>
        </div>
        <Badge variant="neutral">{items.length} suggestions</Badge>
      </div>

      <ul className="space-y-2 text-xs text-textSecondary">
        {items.length > 0 ? items.map((item) => <li key={item}>• {item}</li>) : <li>No suggestions yet.</li>}
      </ul>
    </Card>
  );
};
