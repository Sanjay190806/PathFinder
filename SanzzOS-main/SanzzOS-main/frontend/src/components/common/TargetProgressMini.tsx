import React from 'react';

interface TargetProgressMiniProps {
  current: number;
  target: number;
  label?: string;
  accentColor?: string;
}

export const TargetProgressMini: React.FC<TargetProgressMiniProps> = ({
  current,
  target,
  label = 'Target',
  accentColor = 'var(--accent-primary)'
}) => {
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1 w-full text-[9px] select-none">
      <div className="flex justify-between items-center text-textSecondary font-bold">
        <span>{label}</span>
        <span className="font-mono">{current} / {target}</span>
      </div>
      <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: accentColor,
            boxShadow: `0 0 6px ${accentColor}`
          }} 
        />
      </div>
    </div>
  );
};
export default TargetProgressMini;
