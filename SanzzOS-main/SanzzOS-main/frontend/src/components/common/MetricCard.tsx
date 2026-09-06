import React from 'react';
import { LucideIcon } from 'lucide-react';
import { TrendIndicator } from './TrendIndicator';
import { TargetProgressMini } from './TargetProgressMini';
import { NextActionHint } from './NextActionHint';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  accent?: 'blue' | 'emerald' | 'orange' | 'purple' | 'red' | 'yellow';
  trend?: number; // percentage value
  target?: { current: number; target: number; label?: string };
  status?: string;
  nextAction?: string;
  progressPercent?: number;
  compactMode?: boolean;
  loading?: boolean;
  error?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon: Icon,
  accent = 'blue',
  trend,
  target,
  status,
  nextAction,
  progressPercent,
  compactMode = false,
  loading = false,
  error
}) => {
  const getAccentColors = () => {
    switch (accent) {
      case 'emerald': return { text: 'text-accentEmerald', border: 'border-accentEmerald/20', bg: 'bg-accentEmerald/5' };
      case 'orange': return { text: 'text-accentOrange', border: 'border-accentOrange/20', bg: 'bg-accentOrange/5' };
      case 'purple': return { text: 'text-accentPurple', border: 'border-accentPurple/20', bg: 'bg-accentPurple/5' };
      case 'red': return { text: 'text-accentRed', border: 'border-accentRed/20', bg: 'bg-accentRed/5' };
      case 'yellow': return { text: 'text-accentYellow', border: 'border-accentYellow/20', bg: 'bg-accentYellow/5' };
      case 'blue':
      default:
        return { text: 'text-accentBlue', border: 'border-accentBlue/20', bg: 'bg-accentBlue/5' };
    }
  };

  const colors = getAccentColors();

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3 animate-pulse h-full min-h-[120px]">
        <div className="h-4 w-24 rounded bg-white/5" />
        <div className="h-8 w-16 rounded bg-white/5 mt-1" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-accentRed/25 bg-accentRed/5 p-4 flex flex-col gap-2 h-full min-h-[120px]">
        <span className="text-[10px] font-bold text-accentRed uppercase">Load Error</span>
        <p className="text-[10px] text-textSecondary">{error}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-3 transition hover:border-white/10 ${compactMode ? 'p-3 gap-2.5' : ''}`}>
      {/* 1. Card Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {Icon && <Icon className={`h-4 w-4 shrink-0 ${colors.text}`} />}
          <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{title}</span>
        </div>
        {trend !== undefined && <TrendIndicator value={trend} />}
      </div>

      {/* 2. Primary Value Block */}
      <div className="flex items-baseline gap-1 mt-0.5 select-none">
        <span className="text-2xl font-black text-textPrimary tracking-tight">{value}</span>
        {unit && <span className="text-xs font-semibold text-textMuted">{unit}</span>}
        {status && (
          <span className="ml-auto text-[8px] font-black uppercase tracking-widest text-textMuted px-1.5 py-0.5 rounded border border-white/5 bg-white/[0.01]">
            {status}
          </span>
        )}
      </div>

      {/* 3. Target mini-tracker (if provided) */}
      {target && (
        <div className="mt-1 border-t border-white/5 pt-2.5">
          <TargetProgressMini
            current={target.current}
            target={target.target}
            label={target.label}
            accentColor={`var(--accent-primary, ${colors.text.replace('text-', '')})`}
          />
        </div>
      )}

      {/* 4. Level indicator / Custom Progress fill */}
      {progressPercent !== undefined && !target && (
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden mt-1">
          <div className="h-full bg-accentBlue rounded-full" style={{ width: `${progressPercent}%` }} />
        </div>
      )}

      {/* 5. Recommended Next Action */}
      {nextAction && !compactMode && (
        <div className="mt-1">
          <NextActionHint hint={nextAction} />
        </div>
      )}
    </div>
  );
};
export default MetricCard;
