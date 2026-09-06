import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Sparkles, RefreshCw, MoonStar } from 'lucide-react';
import { ShaylaBriefingResult } from '../../types/shaylaAgent';
import { briefingToMarkdown } from '../../utils/dailyBriefingUtils';

type Props = {
  briefing: ShaylaBriefingResult | null;
  loading?: boolean;
  onGenerateMorning: () => void;
  onGenerateRecovery: () => void;
};

export const DailyBriefingCard: React.FC<Props> = ({ briefing, loading, onGenerateMorning, onGenerateRecovery }) => {
  return (
    <Card className="flex flex-col gap-4 border-accentBlue/20 bg-accentBlue/5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Shayla Agent</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Daily briefing</h3>
        </div>
        <Badge variant={briefing?.fallbackUsed ? 'neutral' : 'success'}>
          {briefing?.fallbackUsed ? 'Local fallback' : 'AI ready'}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onGenerateMorning} disabled={loading}>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate Brief
        </Button>
        <Button size="sm" variant="outline" onClick={onGenerateRecovery} disabled={loading}>
          <MoonStar className="mr-2 h-4 w-4" />
          Recovery Plan
        </Button>
      </div>

      {briefing ? (
        <div className="rounded-2xl border border-border-subtle bg-bgSurface/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-base font-semibold text-textPrimary">{briefing.title}</h4>
              <p className="mt-1 text-xs text-textSecondary">{briefing.summary}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={onGenerateMorning} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {briefing.sections.slice(0, 3).map((section) => (
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

          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap rounded-xl border border-border-subtle bg-black/20 p-3 text-[11px] text-textSecondary">
            {briefingToMarkdown(briefing)}
          </pre>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-subtle bg-white/[0.02] p-4 text-xs text-textSecondary">
          No briefing generated yet. Use the button above to get a placement-first plan.
        </div>
      )}
    </Card>
  );
};
