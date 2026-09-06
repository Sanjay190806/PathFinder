import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ShaylaAgentHistoryItem } from '../../types/shaylaAgent';

type Props = {
  title: string;
  items: ShaylaAgentHistoryItem[];
  emptyLabel: string;
};

export const BriefingTimeline: React.FC<Props> = ({ title, items, emptyLabel }) => {
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">{title}</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Recent agent actions</h3>
        </div>
        <Badge variant="neutral">{items.length} saved</Badge>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
          {emptyLabel}
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-2xl border border-border-subtle bg-bgSurface/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{item.title}</p>
                  <p className="text-[11px] text-textMuted">{new Date(item.generatedAt).toLocaleString()}</p>
                </div>
                <Badge variant={item.fallbackUsed ? 'neutral' : 'success'}>{item.fallbackUsed ? 'Local' : 'AI'}</Badge>
              </div>
              <p className="mt-2 text-xs text-textSecondary line-clamp-3">{item.summary}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
