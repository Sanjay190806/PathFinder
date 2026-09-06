import React from 'react';
import { usePersonalization } from '../../hooks/usePersonalization';
import { UserEnergyMode, UserCareerMode } from '../../types/personalization';
import { Sliders, Sparkles, User, Landmark } from 'lucide-react';
import { FocusModeSelector } from './FocusModeSelector';

export const PersonalizationPanel: React.FC = () => {
  const { profile, updateProfile } = usePersonalization();

  const energies: { id: UserEnergyMode; label: string; desc: string }[] = [
    { id: 'high', label: '⚡ High Energy', desc: 'Ready for deep-dive coding sessions' },
    { id: 'normal', label: '⚖️ Normal', desc: 'Standard placement preparation tasks' },
    { id: 'low', label: '🐢 Low Energy', desc: 'Quick revision and vocabulary review only' },
    { id: 'burnout_risk', label: '⚠️ Burnout Warning', desc: 'Streak saving task recommended' }
  ];

  const paths: { id: UserCareerMode; label: string }[] = [
    { id: 'product_analyst', label: 'Product Analyst' },
    { id: 'ai_product', label: 'AI Product Specialist' },
    { id: 'data_analyst', label: 'Data Analyst' },
    { id: 'business_analyst', label: 'Business Analyst' },
    { id: 'swe_backup', label: 'SWE backup (Java DSA)' },
    { id: 'ml_ai_basics', label: 'ML/AI Fundamentals' }
  ];

  return (
    <div className="flex flex-col gap-6 p-5 rounded-2xl border border-white/5 bg-white/[0.01]">
      <div className="flex items-center gap-2 text-accentBlue pb-4 border-b border-white/5">
        <Sliders className="h-4.5 w-4.5" />
        <h3 className="text-xs font-black uppercase tracking-wider text-textPrimary">Personalization Profile Settings</h3>
      </div>

      {/* 1. Profile metadata */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-accentBlue" />
            <span>Profile Name</span>
          </span>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => updateProfile({ name: e.target.value })}
            className="w-full rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-textPrimary focus:border-accentBlue focus:outline-none"
          />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5 text-accentBlue" />
            <span>Academic Degree</span>
          </span>
          <input
            type="text"
            value={profile.degree}
            onChange={(e) => updateProfile({ degree: e.target.value })}
            className="w-full rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-textPrimary focus:border-accentBlue focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[9px] font-bold text-textSecondary uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-accentBlue" />
            <span>Enrollment Year</span>
          </span>
          <input
            type="text"
            value={profile.year}
            onChange={(e) => updateProfile({ year: e.target.value })}
            className="w-full rounded-xl border border-white/5 bg-black/20 px-3 py-2 text-xs text-textPrimary focus:border-accentBlue focus:outline-none"
          />
        </div>
      </div>

      {/* 2. Focus mode selector */}
      <FocusModeSelector />

      {/* 3. Energy Mode Grid */}
      <div className="flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Energy Capacity</h4>
          <p className="text-[10px] text-textSecondary mt-0.5">Adapt daily study density to match your current stamina.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {energies.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateProfile({ energyMode: item.id })}
              className={`rounded-xl border p-3 text-left transition-all ${
                profile.energyMode === item.id 
                  ? 'border-accentEmerald bg-accentEmerald/10 text-textPrimary' 
                  : 'border-white/5 bg-black/20 text-textSecondary hover:bg-white/5'
              }`}
            >
              <span className="block text-xs font-bold">{item.label}</span>
              <span className="block text-[8px] opacity-70 mt-1">{item.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Career Target Paths */}
      <div className="flex flex-col gap-3">
        <div>
          <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider">Primary SWE/Analyst Path</h4>
          <p className="text-[10px] text-textSecondary mt-0.5">Focus placement readiness calculations on this target.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {paths.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateProfile({ careerMode: item.id })}
              className={`rounded-xl border p-2.5 text-center text-xs font-bold transition-all ${
                profile.careerMode === item.id 
                  ? 'border-accentBlue bg-accentBlue/10 text-textPrimary' 
                  : 'border-white/5 bg-black/20 text-textSecondary hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PersonalizationPanel;
