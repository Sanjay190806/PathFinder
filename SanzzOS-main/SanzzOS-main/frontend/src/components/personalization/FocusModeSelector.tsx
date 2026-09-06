import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import { UserFocusMode } from '../../types/personalization';
import { Target, Code2, GraduationCap, BatteryCharging, FilePlus2, Presentation, Languages } from 'lucide-react';

export const FocusModeSelector: React.FC = () => {
  const { profile, updateProfile } = usePersonalization();

  const options: { id: UserFocusMode; label: string; desc: string; icon: any; color: string }[] = [
    { id: 'placement_sprint', label: 'Placement Sprint', desc: 'Focus on Java DSA, SQL, and Aptitude solves', icon: Target, color: 'text-accentOrange border-accentOrange/30 bg-accentOrange/5' },
    { id: 'project_builder', label: 'Project Builder', desc: 'Active commit pushing and README improvements', icon: Code2, color: 'text-accentBlue border-accentBlue/30 bg-accentBlue/5' },
    { id: 'learning_day', label: 'Learning Day', desc: 'Focus on revision topics and CS Core notes', icon: GraduationCap, color: 'text-accentPurple border-accentPurple/30 bg-accentPurple/5' },
    { id: 'resume_polish', label: 'Resume Polish', desc: 'ATS optimizations and project bullet updates', icon: FilePlus2, color: 'text-accentEmerald border-accentEmerald/30 bg-accentEmerald/5' },
    { id: 'interview_prep', label: 'Interview Prep', desc: 'Mock practice questions and STAR frameworks', icon: Presentation, color: 'text-pink-400 border-pink-400/30 bg-pink-400/5' },
    { id: 'german_practice', label: 'German Practice', desc: 'Vocabulary lessons and speech mic diagnostic tasks', icon: Languages, color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/5' },
    { id: 'no_zero_day', label: 'No Zero Day', desc: 'Quick 15-minute tasks to protect consistency streaks', icon: BatteryCharging, color: 'text-accentYellow border-accentYellow/30 bg-accentYellow/5' }
  ];

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Tactical Focus Mode</h4>
        <p className="text-[10px] text-textSecondary mt-0.5">Rebalances dashboard metrics based on what matters today.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((item) => {
          const Icon = item.icon;
          const active = profile.focusMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => updateProfile({ focusMode: item.id })}
              className={`rounded-2xl border p-4 text-left flex items-start gap-3 transition-all duration-300 ${
                active 
                  ? 'border-transparent bg-white/[0.04] ring-1 ring-white/10' 
                  : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.02]'
              }`}
              style={{
                borderColor: active ? 'var(--accent-primary)' : undefined,
                boxShadow: active ? '0 0 16px var(--accent-glow)' : undefined
              }}
            >
              <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex flex-col gap-1">
                <span className="text-xs font-bold text-textPrimary truncate">{item.label}</span>
                <p className="text-[9px] text-textSecondary leading-normal">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default FocusModeSelector;
