import React from 'react';
import { Card } from '../ui/Card';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { useAIMentorStore } from '../../app/store/useAIMentorStore';
import { navigateToPath } from '../../utils/navigation';
import { ChevronRight } from 'lucide-react';

export const PortfolioMentorDashboardWidget: React.FC = () => {
  const { readiness } = usePortfolioOS();
  const { missions } = useAIMentorStore();

  const activeMission = missions.find((m) => !m.completed) || missions[0] || null;

  return (
    <Card className="p-4 border-white/5 bg-black/45 flex flex-col gap-3 select-none">
      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
        <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Portfolio & AI Mentor HUD</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Portfolio Readiness gauge */}
        <div
          onClick={() => navigateToPath('/portfolio-os')}
          className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition cursor-pointer flex flex-col gap-1"
        >
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-textMuted font-bold uppercase">Portfolio Ready</span>
            <ChevronRight className="h-3.5 w-3.5 text-textMuted" />
          </div>
          <span className="text-sm font-black text-textPrimary">{readiness.overall}%</span>
          <span className={`text-[7px] uppercase font-bold tracking-wider ${readiness.color.split(' ')[0]}`}>{readiness.band}</span>
        </div>

        {/* Mentor Mission widget */}
        <div
          onClick={() => navigateToPath('/ai-mentor')}
          className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition cursor-pointer flex flex-col justify-between gap-1"
        >
          <div className="flex justify-between items-center">
            <span className="text-[8px] text-textMuted font-bold uppercase">Mentor Target</span>
            <ChevronRight className="h-3.5 w-3.5 text-textMuted" />
          </div>
          {activeMission ? (
            <span className="text-[9px] font-black text-textPrimary truncate">{activeMission.title}</span>
          ) : (
            <span className="text-[9px] font-black text-textMuted">No active targets</span>
          )}
          <span className="text-[7px] text-textMuted uppercase font-bold">view mission OS</span>
        </div>
      </div>
    </Card>
  );
};
export default PortfolioMentorDashboardWidget;
