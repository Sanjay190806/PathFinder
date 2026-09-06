import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useResumeStudioStore } from '../../app/store/useResumeStudioStore';

export const ResumeScoreHistory: React.FC = () => {
  const history = useResumeStudioStore((s) => s.resumeScoreHistory);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle/50 pb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Score History</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Resume score over time</h3>
        </div>
        <Badge variant="neutral">{history.length} snapshots</Badge>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
          No score snapshots yet. Save one from Builder or analysis.
        </div>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 8).map((item) => (
            <div key={item.id} className="rounded-2xl border border-border-subtle bg-bgSurface/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{item.version}</p>
                  <p className="text-[11px] text-textMuted">{new Date(item.date).toLocaleString()}</p>
                </div>
                <Badge variant={item.score >= 80 ? 'success' : item.score >= 60 ? 'neutral' : 'danger'}>{item.score}%</Badge>
              </div>
              <div className="mt-3 h-2 rounded-full bg-white/5">
                <div className="h-2 rounded-full bg-accentBlue" style={{ width: `${Math.min(item.score, 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-textSecondary">{item.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
