import React from 'react';
import { getXPProgress } from '../../utils/xpUtils';

interface XPProgressBarProps {
  currentXp: number;
  level: number;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({ currentXp, level }) => {
  const progress = getXPProgress(currentXp);
  const displayLevel = progress.level || level;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-textSecondary uppercase">
        <span>LVL {displayLevel}</span>
        <span>{progress.xpInLevel} / {progress.xpNeeded} XP</span>
      </div>
      <div className="xp-bar-bg w-full">
        <div className="xp-bar-fill" style={{ width: `${progress.percentage}%` }} />
      </div>
    </div>
  );
};
export default XPProgressBar;
