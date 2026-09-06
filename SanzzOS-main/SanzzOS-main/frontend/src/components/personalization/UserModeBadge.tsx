import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import { Sparkles, Zap } from 'lucide-react';

export const UserModeBadge: React.FC = () => {
  const { focusMode, energyMode } = usePersonalization();

  const getFocusLabel = () => {
    return focusMode.replace('_', ' ').toUpperCase();
  };

  const getEnergyColors = () => {
    switch (energyMode) {
      case 'high': return 'text-accentEmerald border-accentEmerald/20 bg-accentEmerald/5';
      case 'low': return 'text-accentOrange border-accentOrange/20 bg-accentOrange/5';
      case 'burnout_risk': return 'text-accentRed border-accentRed/20 bg-accentRed/5';
      case 'normal':
      default:
        return 'text-accentBlue border-accentBlue/20 bg-accentBlue/5';
    }
  };

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-white/5 bg-white/[0.02] text-[9px] font-black uppercase tracking-wider text-textPrimary">
        <Sparkles className="h-3 w-3 text-accentBlue fill-current" />
        <span>{getFocusLabel()}</span>
      </div>
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-wider ${getEnergyColors()}`}>
        <Zap className="h-3 w-3 fill-current" />
        <span>ENERGY: {energyMode.toUpperCase()}</span>
      </div>
    </div>
  );
};
export default UserModeBadge;
