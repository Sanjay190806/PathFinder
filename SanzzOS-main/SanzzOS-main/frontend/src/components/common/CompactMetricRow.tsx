import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CompactMetricRowProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  accentClass?: string;
}

export const CompactMetricRow: React.FC<CompactMetricRowProps> = ({
  title,
  value,
  icon: Icon,
  accentClass = 'text-accentBlue'
}) => {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 select-none">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`h-3.5 w-3.5 ${accentClass}`} />}
        <span className="text-[10px] font-medium text-textSecondary">{title}</span>
      </div>
      <span className="text-[10px] font-black text-textPrimary">{value}</span>
    </div>
  );
};
export default CompactMetricRow;
