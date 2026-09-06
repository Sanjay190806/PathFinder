import React from 'react';
import { getXPProgress } from '../../utils/xpUtils';

interface LevelRingProps {
  currentXp: number;
  level: number;
  size?: number;
  strokeWidth?: number;
}

export const LevelRing: React.FC<LevelRingProps> = ({
  currentXp,
  level,
  size = 50,
  strokeWidth = 4
}) => {
  const progress = getXPProgress(currentXp);
  const displayLevel = progress.level || level;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress.percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background tracking track circle */}
        <circle
          className="text-white/5"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Highlight progress circle */}
        <circle
          className="text-accentBlue transition-all duration-500 ease-out"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[10px] font-black text-textPrimary leading-none">{displayLevel}</span>
        <span className="text-[7px] text-textMuted uppercase font-bold mt-0.5">LVL</span>
      </div>
    </div>
  );
};
export default LevelRing;
