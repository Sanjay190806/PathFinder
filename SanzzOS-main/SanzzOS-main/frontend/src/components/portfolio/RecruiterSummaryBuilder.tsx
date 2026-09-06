import React, { useState } from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { Button } from '../ui/Button';
import { Copy, Sparkles } from 'lucide-react';

interface RoleTemplate {
  key: string;
  name: string;
  recruiterBio: string;
  linkedinAbout: string;
  githubSummary: string;
  resumeSummary: string;
  projectIntro: string;
}

const TEMPLATES: RoleTemplate[] = [
  {
    key: 'swe',
    name: 'SWE Intern',
    recruiterBio: 'React/TypeScript developer specializing in local state stores and WebSocket streaming protocols.',
    linkedinAbout: 'Software engineering student with hands-on experience building offline-first systems, progressive web app routing models, and automated backups.',
    githubSummary: 'Engineering portfolio focusing on robust React layouts, custom Zustand persisters, and client rendering speed gains.',
    resumeSummary: 'Passionate frontend and systems developer with experience implementing local cache layers and state synchronization routines.',
    projectIntro: 'Fleshed-out software architectures detailing matrix manipulations, collections API structures, and custom timers.',
  },
  {
    key: 'ai_product',
    name: 'AI Product Intern',
    recruiterBio: 'Product builder focused on patient risk scores calculations and adaptive learning syllabus matrices.',
    linkedinAbout: 'Product strategist bridging technical APIs with beautiful UI dashboards. Focused on vital anomaly trees and user learning roadmap charts.',
    githubSummary: 'Conceptual models repository checking vital parameters, isolation forest partitions, and adaptive roadmaps.',
    resumeSummary: 'AI Product enthusiast experienced in translating mathematical model metrics into responsive diagnostic panels.',
    projectIntro: 'Conceptual project designs detailing problem statement breakdowns, target personas, and priority logs.',
  },
  {
    key: 'data_analyst',
    name: 'Data Analyst Intern',
    recruiterBio: 'Data-driven researcher specializing in SQL joins, pandas analysis, and vital statistics.',
    linkedinAbout: 'Analytical developer focused on database schema normalizations, high frequency vital stream profiling, and performance reports.',
    githubSummary: 'SQL databases, data aggregations, and statistical analysis charts tracking placement parameters.',
    resumeSummary: 'Data analyst intern skilled in executing complex multi-table joins, normal forms, and reporting KPI summaries.',
    projectIntro: 'Database models, SQL query banks, and metric tracking charts.',
  }
];

export const RecruiterSummaryBuilder: React.FC = () => {
  const { profile, updateProfile } = usePortfolioOS();
  const [activeRoleKey, setActiveRoleKey] = useState('swe');

  const selectedRole = TEMPLATES.find((r) => r.key === activeRoleKey) || TEMPLATES[0];

  const handleGenerate = () => {
    updateProfile({
      targetRole: selectedRole.name,
      recruiterBio: selectedRole.recruiterBio,
      linkedinAbout: selectedRole.linkedinAbout,
      githubSummary: selectedRole.githubSummary,
      resumeSummary: selectedRole.resumeSummary,
      projectIntro: selectedRole.projectIntro,
    });
    alert(`Draft generated for ${selectedRole.name}! Feel free to edit the text below.`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-start border-b border-white/5 pb-2">
        <div>
          <span className="text-[9px] text-textMuted font-black uppercase tracking-widest">Profile Architect</span>
          <h3 className="text-sm font-black text-textPrimary mt-0.5">Recruiter Bio Summary Builder</h3>
        </div>
      </div>

      {/* Role selector tabs */}
      <div className="grid grid-cols-3 gap-2">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveRoleKey(t.key)}
            className={`p-2 rounded-xl border text-center font-bold transition ${
              activeRoleKey === t.key
                ? 'border-accentBlue bg-accentBlue/5 text-textPrimary'
                : 'border-white/5 bg-black/25 text-textSecondary hover:border-white/10'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        className="w-full bg-accentBlue text-white hover:bg-accentBlue/90 uppercase font-black tracking-widest text-[9px] h-9 flex items-center justify-center gap-1"
      >
        <Sparkles className="h-4 w-4" />
        Generate Draft Summary
      </Button>

      {/* Editable Fields list */}
      <div className="flex flex-col gap-3.5 mt-2">
        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">Recruiter 2-Line Bio</label>
            <button onClick={() => copyToClipboard(profile.recruiterBio)} className="text-textMuted hover:text-textPrimary flex items-center gap-0.5">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <textarea
            value={profile.recruiterBio}
            onChange={(e) => updateProfile({ recruiterBio: e.target.value })}
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">LinkedIn About Section</label>
            <button onClick={() => copyToClipboard(profile.linkedinAbout)} className="text-textMuted hover:text-textPrimary flex items-center gap-0.5">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <textarea
            value={profile.linkedinAbout}
            onChange={(e) => updateProfile({ linkedinAbout: e.target.value })}
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-[9px] font-bold text-accentBlue uppercase tracking-wider">GitHub Readme Summary</label>
            <button onClick={() => copyToClipboard(profile.githubSummary)} className="text-textMuted hover:text-textPrimary flex items-center gap-0.5">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <textarea
            value={profile.githubSummary}
            onChange={(e) => updateProfile({ githubSummary: e.target.value })}
            className="w-full min-h-[45px] px-3 py-2 rounded-xl border border-white/5 bg-black/45 text-textPrimary focus:outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
export default RecruiterSummaryBuilder;
