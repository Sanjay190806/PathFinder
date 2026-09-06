import React from 'react';
import { usePortfolioOS } from '../../hooks/usePortfolioOS';
import { ShieldCheck } from 'lucide-react';

export const PortfolioReadinessScore: React.FC = () => {
  const { readiness } = usePortfolioOS();

  const subStats = [
    { label: 'Case Studies Done', val: `${readiness.caseStudyCompleteness}%`, color: 'bg-accentBlue' },
    { label: 'GitHub Repo Readiness', val: `${readiness.githubReadiness}%`, color: 'bg-accentPurple' },
    { label: 'LinkedIn Profile Ready', val: `${readiness.linkedinReadiness}%`, color: 'bg-accentEmerald' },
  ];

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Portfolio Readiness Score</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${readiness.color}`}>
          {readiness.band}
        </span>
      </div>

      <div className="flex items-center justify-around gap-4 py-2">
        {/* Radial dial */}
        <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-white/5 bg-[#070718] shadow-inner shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-textPrimary">{readiness.overall}%</span>
            <span className="text-[7px] text-textMuted uppercase font-bold tracking-widest mt-0.5">Readiness</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[10px] text-textSecondary font-semibold">
          <p>• A Strong Portfolio (86%+) ensures maximum recruiter callback rates.</p>
          <p>• Complete detailed problem/impact bullets to unlock bands.</p>
        </div>
      </div>

      {/* Sub bar grid */}
      <div className="grid grid-cols-3 gap-2.5 mt-1 border-t border-white/5 pt-3">
        {subStats.map((sub) => (
          <div key={sub.label} className="p-2 bg-white/[0.01] border border-white/5 rounded-xl flex flex-col gap-1 text-center">
            <span className="text-textMuted text-[8px] font-bold uppercase">{sub.label}</span>
            <span className="text-xs font-black text-textPrimary mt-0.5">{sub.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PortfolioReadinessScore;
