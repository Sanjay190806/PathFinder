import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  value: number;
  isPercentage?: boolean;
  reverseColor?: boolean; // If lower is better
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  isPercentage = true,
  reverseColor = false
}) => {
  if (value === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-textSecondary uppercase select-none">
        <Minus className="h-3 w-3" />
        <span>Flat</span>
      </span>
    );
  }

  const isPositive = value > 0;
  const isGood = reverseColor ? !isPositive : isPositive;

  const colorClass = isGood ? 'text-accentEmerald bg-accentEmerald/10' : 'text-accentRed bg-accentRed/10';
  const label = `${isPositive ? '+' : ''}${value}${isPercentage ? '%' : ''}`;

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider select-none ${colorClass}`}>
      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      <span>{label}</span>
    </span>
  );
};
export default TrendIndicator;
