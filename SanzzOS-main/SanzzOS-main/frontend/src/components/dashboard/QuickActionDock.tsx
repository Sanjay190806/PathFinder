import React from 'react';
import { Target, Zap, GraduationCap, Languages, Code2 } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { useUIStore } from '../../app/store/useUIStore';

export const QuickActionDock: React.FC = () => {
  const currentDay = useUIStore((s) => s.currentDay);
  const careerState = useCareerStore((s) => s);
  const updateDailyLog = useCareerStore((s) => s.updateDailyLog);

  const todayLog = careerState.dailyLogs[currentDay] || {
    counts: { leetcode: 0, skillrack: 0, aptitude: 0, sql: 0, cscore: 0, german: 0, project: 0, resume: 0 }
  };

  const handleIncrement = (key: string) => {
    const prevVal = (todayLog.counts as any)[key] || 0;
    const nextCounts = { ...todayLog.counts, [key]: prevVal + 1 };
    updateDailyLog(currentDay, { counts: nextCounts });
    
    // Log progression events
    const award = key === 'leetcode' ? 20 : (key === 'sql' ? 15 : 10);
    careerState.awardXP(award);
  };

  const actions = [
    { key: 'leetcode', label: 'DSA Solved', icon: Target, color: 'hover:text-accentOrange hover:bg-accentOrange/5' },
    { key: 'sql', label: 'SQL query', icon: Zap, color: 'hover:text-accentYellow hover:bg-accentYellow/5' },
    { key: 'german', label: 'German Vocab', icon: Languages, color: 'hover:text-cyan-400 hover:bg-cyan-400/5' },
    { key: 'cscore', label: 'CS Revise', icon: GraduationCap, color: 'hover:text-accentPurple hover:bg-accentPurple/5' },
    { key: 'project', label: 'Commit Pushed', icon: Code2, color: 'hover:text-accentBlue hover:bg-accentBlue/5' }
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.01] p-4 select-none">
      <div className="flex justify-between items-center pl-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-textSecondary">Quick Action Dock</span>
        <span className="text-[8px] text-textMuted uppercase font-bold">Fast Log</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {actions.map((act) => (
          <button
            key={act.key}
            type="button"
            onClick={() => handleIncrement(act.key)}
            className={`rounded-xl border border-white/5 bg-black/40 p-2.5 flex flex-col items-center gap-1.5 transition text-textSecondary ${act.color}`}
          >
            <act.icon className="h-4.5 w-4.5" />
            <span className="text-[9px] font-bold tracking-tight">{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
export default QuickActionDock;
