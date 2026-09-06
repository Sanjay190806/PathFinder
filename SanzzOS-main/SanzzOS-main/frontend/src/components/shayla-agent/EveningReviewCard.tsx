import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Clock3, RefreshCw } from 'lucide-react';
import { ShaylaBriefingResult } from '../../types/shaylaAgent';

type Props = {
  review: ShaylaBriefingResult | null;
  loading?: boolean;
  onGenerateReview: () => void;
};

export const EveningReviewCard: React.FC<Props> = ({ review, loading, onGenerateReview }) => {
  return (
    <Card className="flex flex-col gap-4 border-accentPurple/20 bg-accentPurple/5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Shayla Agent</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Evening review</h3>
        </div>
        <Badge variant={review?.fallbackUsed ? 'neutral' : 'success'}>
          {review?.fallbackUsed ? 'Local fallback' : 'AI ready'}
        </Badge>
      </div>

      <Button size="sm" onClick={onGenerateReview} disabled={loading}>
        <Clock3 className="mr-2 h-4 w-4" />
        Generate Review
      </Button>

      {review ? (
        <div className="rounded-2xl border border-border-subtle bg-bgSurface/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-textPrimary">{review.title}</h4>
              <p className="mt-1 text-xs text-textSecondary">{review.summary}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={onGenerateReview} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {review.sections.slice(0, 3).map((section) => (
              <div key={section.title} className="rounded-xl border border-border-subtle bg-white/[0.03] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-textMuted">{section.title}</p>
                <ul className="mt-2 space-y-1 text-xs text-textSecondary">
                  {section.items.slice(0, 3).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
          No review generated yet. Use this at the end of the day to close the loop.
        </div>
      )}
    </Card>
  );
};
