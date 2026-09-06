import React from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export const PortfolioVisibilityPanel: React.FC = () => {
  const { visibility, updateVisibility } = usePortfolioOS();

  const SECTIONS = [
    { key: 'profileSummary', label: 'Profile Summary Bio' },
    { key: 'skills', label: 'Core Skills Matrices' },
    { key: 'projects', label: 'Showcase Projects List' },
    { key: 'resumeHighlights', label: 'Resume Key Highlights' },
    { key: 'achievements', label: 'Academic & XP Badges' },
    { key: 'certifications', label: 'Verifiable Certifications' },
    { key: 'githubLinks', label: 'GitHub Repositories Links' },
    { key: 'demoLinks', label: 'Live Application Demos' },
    { key: 'contactLinks', label: 'Contact Credentials' },
    { key: 'caseStudies', label: 'Project Case Studies Details' },
    { key: 'interviewStories', label: 'Mock Pitch & STAR walk-throughs' },
  ] as const;

  const handleChange = (key: keyof typeof visibility, val: 'private' | 'preview' | 'public') => {
    updateVisibility({ [key]: val });
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Portfolio Privacy Configuration</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {SECTIONS.map((sec) => {
          const val = visibility[sec.key];
          return (
            <div key={sec.key} className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-white/[0.01]">
              <span className="font-semibold text-textSecondary">{sec.label}</span>
              <div className="flex bg-white/5 border border-white/5 rounded-lg p-0.5 text-[8px] font-black uppercase tracking-wider">
                {(['private', 'preview', 'public'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleChange(sec.key, t)}
                    className={`px-2.5 py-1 rounded transition flex items-center gap-1 ${
                      val === t
                        ? t === 'private'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/20'
                          : t === 'preview'
                          ? 'bg-accentOrange/25 text-accentOrange border border-accentOrange/20'
                          : 'bg-accentEmerald/20 text-accentEmerald border border-accentEmerald/20'
                        : 'text-textMuted hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {t === 'private' && <EyeOff className="h-3 w-3" />}
                    {t !== 'private' && <Eye className="h-3 w-3" />}
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default PortfolioVisibilityPanel;
