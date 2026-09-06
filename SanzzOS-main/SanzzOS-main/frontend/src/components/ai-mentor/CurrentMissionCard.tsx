import React from 'react';
import { useAIMentorStore } from '../../app/store/useAIMentorStore';
import { useCareerStore } from '../../app/store/useCareerStore';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export const CurrentMissionCard: React.FC = () => {
  const { missions, toggleMission } = useAIMentorStore();
  const awardXP = useCareerStore((s) => s.awardXP);

  const activeMission = missions.find((m) => !m.completed) || missions[0] || null;

  const handleToggle = (id: string, xpReward: number) => {
    toggleMission(id);
    awardXP(xpReward);
    alert(`Mission accomplished! Awarded +${xpReward} XP!`);
  };

  if (!activeMission) {
    return (
      <Card className="p-4.5 border-white/5 bg-black/45 text-center text-textMuted select-none">
        No active mentor missions. Ask Shayla AI to generate a target goal checklist!
      </Card>
    );
  }

  return (
    <Card className="p-4.5 border-accentBlue/20 bg-accentBlue/[0.01] flex flex-col gap-3 select-none">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5 font-bold">
          <Sparkles className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[9px] text-textMuted uppercase tracking-widest">Active Mentor Mission</span>
        </div>
        <Badge variant="primary">+{activeMission.xpReward} XP</Badge>
      </div>

      <div className="flex flex-col gap-1">
        <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider">{activeMission.title}</h4>
        <p className="text-[10px] text-textSecondary leading-relaxed mt-0.5">{activeMission.description}</p>
      </div>

      <div className="flex justify-between items-center border-t border-white/5 pt-2.5 mt-1 text-[9px] text-textMuted">
        <span>Deadline: {activeMission.deadline}</span>
        <button
          type="button"
          onClick={() => handleToggle(activeMission.id, activeMission.xpReward)}
          className="flex items-center gap-1 bg-accentBlue text-white hover:bg-accentBlue/90 px-3 py-1 rounded-lg uppercase tracking-wider font-black text-[8px] transition"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Complete Mission
        </button>
      </div>
    </Card>
  );
};
export default CurrentMissionCard;
