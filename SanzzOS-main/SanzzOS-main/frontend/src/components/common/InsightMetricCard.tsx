import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface InsightMetricCardProps {
  title: string;
  metric: string | number;
  insight: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onActionClick?: () => void;
  accentClass?: string;
}

export const InsightMetricCard: React.FC<InsightMetricCardProps> = ({
  title,
  metric,
  insight,
  icon: Icon,
  actionLabel,
  onActionClick,
  accentClass = 'text-accentPurple'
}) => {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 flex flex-col gap-3 transition hover:border-white/10 select-none">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-textSecondary uppercase tracking-wider">{title}</span>
        {Icon && <Icon className={`h-4 w-4 ${accentClass}`} />}
      </div>
      
      <div>
        <span className="text-2xl font-black text-textPrimary tracking-tight">{metric}</span>
      </div>

      <p className="text-[10px] text-textSecondary leading-relaxed">{insight}</p>

      {actionLabel && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className="mt-1 flex items-center gap-1 text-[9px] font-black text-accentBlue hover:text-accentBlue/80 uppercase tracking-widest self-start transition"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};
export default InsightMetricCard;
