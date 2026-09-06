import React from 'react';
import { Achievement } from '../../types/achievements';
import { AchievementCard } from './AchievementCard';

interface AchievementGridProps {
  achievements: Achievement[];
  onClaim: (id: string) => void;
  unlockedIds: string[];
  claimedIds: string[];
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onClaim,
  unlockedIds,
  claimedIds
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {achievements.map((item) => (
        <AchievementCard
          key={item.id}
          achievement={item}
          onClaim={() => onClaim(item.id)}
          unlocked={unlockedIds.includes(item.id)}
          claimed={claimedIds.includes(item.id)}
        />
      ))}
    </div>
  );
};
export default AchievementGrid;
