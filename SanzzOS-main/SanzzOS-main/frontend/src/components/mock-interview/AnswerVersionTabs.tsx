import React, { useState } from 'react';

interface AnswerVersionTabsProps {
  v30s: string;
  v60s: string;
  v2m: string;
  bullets: string[];
  onChange: (fields: { v30s: string; v60s: string; v2m: string; bullets: string[] }) => void;
}

export const AnswerVersionTabs: React.FC<AnswerVersionTabsProps> = ({
  v30s,
  v60s,
  v2m,
  bullets,
  onChange,
}) => {
  const [activeTab, setActiveTab] = useState<'30s' | '60s' | '2m' | 'bullets'>('30s');
  const [bulletText, setBulletText] = useState('');

  const handleChange = (key: string, value: any) => {
    onChange({
      v30s,
      v60s,
      v2m,
      bullets,
      [key]: value,
    });
  };

  const handleAddBullet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletText.trim()) return;
    handleChange('bullets', [...bullets, bulletText]);
    setBulletText('');
  };

  const handleRemoveBullet = (idx: number) => {
    handleChange('bullets', bullets.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-3 border border-white/5 bg-black/45 p-4 rounded-2xl text-xs">
      {/* Tabs list */}
      <div className="flex bg-white/5 border border-white/5 rounded-xl p-0.5 self-start">
        {(['30s', '60s', '2m', 'bullets'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition ${
              activeTab === t ? 'bg-accentBlue text-white' : 'text-textSecondary hover:bg-white/5'
            }`}
          >
            {t === 'bullets' ? 'Bullet Points' : `${t} Pitch`}
          </button>
        ))}
      </div>

      {activeTab === '30s' && (
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Elevator Pitch (30 seconds)</label>
          <textarea
            value={v30s}
            onChange={(e) => handleChange('v30s', e.target.value)}
            placeholder="A short 2-3 sentence punchy summary of your background or project."
            className="w-full min-h-[85px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none resize-none"
          />
        </div>
      )}

      {activeTab === '60s' && (
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Detailed Pitch (60 seconds)</label>
          <textarea
            value={v60s}
            onChange={(e) => handleChange('v60s', e.target.value)}
            placeholder="A 5-6 sentence walkthrough explaining key technical architectures or stories."
            className="w-full min-h-[85px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none resize-none"
          />
        </div>
      )}

      {activeTab === '2m' && (
        <div>
          <label className="block text-[9px] font-bold text-textMuted uppercase mb-1">Comprehensive Answer (2 minutes)</label>
          <textarea
            value={v2m}
            onChange={(e) => handleChange('v2m', e.target.value)}
            placeholder="A fully fleshed out structured description detailing lessons, blockers, and results."
            className="w-full min-h-[90px] px-3 py-2 rounded-xl border border-white/5 bg-black/35 text-textPrimary placeholder:text-textMuted focus:outline-none resize-none"
          />
        </div>
      )}

      {activeTab === 'bullets' && (
        <div className="flex flex-col gap-2">
          <label className="block text-[9px] font-bold text-textMuted uppercase">Key Talking Points (Quick Scan)</label>
          
          <div className="flex flex-col gap-1.5">
            {bullets.map((b, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-black/30">
                <span className="text-textSecondary leading-normal">• {b}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveBullet(idx)}
                  className="text-red-400 hover:text-red-300 font-bold uppercase tracking-wider text-[8px] px-1.5"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddBullet} className="flex gap-2 mt-1">
            <input
              type="text"
              value={bulletText}
              onChange={(e) => setBulletText(e.target.value)}
              placeholder="e.g. Optimized SQL queries saving 10% load time."
              className="flex-1 h-8 px-2 rounded-lg border border-white/5 bg-black/35 text-textPrimary focus:outline-none"
            />
            <button
              type="submit"
              className="h-8 px-3 rounded-lg border border-accentBlue bg-accentBlue/10 text-accentBlue hover:bg-accentBlue/20 font-bold uppercase tracking-wider text-[9px]"
            >
              Add Bullet
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AnswerVersionTabs;
