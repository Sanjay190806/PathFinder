import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export interface SpeakingHistoryItem {
  phrase: string;
  minutes: number;
  confidence: number;
  mode: string;
  createdAt: string;
}

export const GermanSpeakingHistory: React.FC<{ items: SpeakingHistoryItem[] }> = ({ items }) => {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Speaking history</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Recent speaking attempts</h3>
        </div>
        <Badge variant="neutral">{items.length}</Badge>
      </div>
      <div className="grid gap-2">
        {items.length ? items.map((item) => (
          <div key={`${item.createdAt}-${item.phrase}`} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
            <p className="text-sm text-textPrimary">{item.phrase}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-textSecondary">
              <span>{item.mode}</span>
              <span>{item.minutes} min</span>
              <span>{item.confidence}/5</span>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4 text-sm text-textSecondary">No speaking history yet.</div>
        )}
      </div>
    </Card>
  );
};

