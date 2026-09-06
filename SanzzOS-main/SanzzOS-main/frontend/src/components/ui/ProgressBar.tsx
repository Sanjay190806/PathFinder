import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  color?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'var(--accent-blue)', className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={`w-full bg-border-subtle/30 rounded-full h-2.5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};
