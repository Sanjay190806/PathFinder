import React from 'react';
import { Target, Zap, Clock, Award } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';

export const SkillProgressGrid: React.FC = () => {
  const careerState = useCareerStore((s) => s);

  const problemLogs = careerState.problemLogs || {};
  const totalDsa = Object.keys(problemLogs).length;

  let sqlCount = 0;
  let skillrackCount = 0;
  let aptitudeCount = 0;
  if (careerState.dailyLogs) {
    Object.values(careerState.dailyLogs).forEach((log: any) => {
      if (log.counts) {
        sqlCount += log.counts.sql || 0;
        skillrackCount += log.counts.skillrack || 0;
        aptitudeCount += log.counts.aptitude || 0;
      }
    });
  }

  const items = [
    { title: 'DSA Problems', value: totalDsa, target: 150, icon: Target, color: 'text-accentOrange border-accentOrange/10' },
    { title: 'SQL Queries', value: sqlCount, target: 90, icon: Zap, color: 'text-accentYellow border-accentYellow/10' },
    { title: 'SkillRack Tests', value: skillrackCount, target: 120, icon: Clock, color: 'text-accentBlue border-accentBlue/10' },
    { title: 'Aptitude Solves', value: aptitudeCount, target: 450, icon: Award, color: 'text-accentEmerald border-accentEmerald/10' }
  ];

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center pl-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-textSecondary">Skill Metrics Progress</span>
        <span className="text-[8px] text-textMuted uppercase font-bold">180d Target Goals</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => {
          const percent = Math.min(100, Math.round((it.value / it.target) * 100));
          return (
            <div key={it.title} className="rounded-xl border border-white/5 bg-black/30 p-3 flex flex-col gap-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-textSecondary truncate">{it.title}</span>
                <it.icon className={`h-4 w-4 ${it.color.split(' ')[0]}`} />
              </div>
              
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-black text-textPrimary">{it.value}</span>
                <span className="text-[8px] text-textMuted font-bold">/ {it.target}</span>
              </div>

              {/* Progress bar */}
              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                <div 
                  className="h-full bg-accentBlue rounded-full" 
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: `var(--accent-${it.color.split(' ')[0].replace('text-accent', '').toLowerCase()})`
                  }} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SkillProgressGrid;
