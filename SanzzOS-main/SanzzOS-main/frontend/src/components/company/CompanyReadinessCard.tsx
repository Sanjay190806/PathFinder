import React from 'react';
import { companyIntelligenceService } from '../../services/companyIntelligenceService';
import { ShieldCheck } from 'lucide-react';

interface CompanyReadinessCardProps {
  companyId: string;
}

export const CompanyReadinessCard: React.FC<CompanyReadinessCardProps> = ({ companyId }) => {
  const readiness = companyIntelligenceService.calculateReadiness(companyId);

  const subBars = [
    { label: 'Coding / DSA Readiness', score: readiness.coding, color: 'bg-accentBlue' },
    { label: 'Aptitude Prep', score: readiness.aptitude, color: 'bg-accentPurple' },
    { label: 'SQL / DB Readiness', score: readiness.sql, color: 'bg-cyan-400' },
    { label: 'Resume Profile Match', score: readiness.resume, color: 'bg-accentOrange' },
    { label: 'Project Portfolio Match', score: readiness.project, color: 'bg-accentYellow' },
    { label: 'Speaking & Comm Level', score: readiness.communication, color: 'bg-accentEmerald' },
  ];

  return (
    <div className="flex flex-col gap-4 text-xs select-none bg-black/45 border border-white/5 p-5 rounded-2xl">
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-accentBlue" />
          <span className="text-[10px] font-black uppercase tracking-wider text-textPrimary">Company Readiness OS</span>
        </div>
        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border ${readiness.color}`}>
          {readiness.band}
        </span>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-5 my-1">
        {/* Readiness radial dial */}
        <div className="relative h-20 w-20 flex items-center justify-center rounded-full border border-white/5 bg-[#070718] shadow-inner shrink-0">
          <div className="flex flex-col items-center">
            <span className="text-xl font-black text-textPrimary">{readiness.overall}%</span>
            <span className="text-[7px] text-textMuted uppercase font-bold tracking-widest mt-0.5">Readiness</span>
          </div>
        </div>

        <div className="flex flex-col gap-1 text-[10px] text-textSecondary font-semibold">
          <p>• Dials aggregate resume metrics, coding counts, and interview logs.</p>
          <p>• Targets: Service targets &gt;= 70%, Zoho/Analytics &gt;= 80%.</p>
        </div>
      </div>

      {/* Sub category progress bars */}
      <div className="flex flex-col gap-2.5 mt-1">
        {subBars.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1">
            <div className="flex justify-between text-[9px] font-bold text-textSecondary uppercase">
              <span>{bar.label}</span>
              <span className="font-mono">{bar.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div className={`h-full ${bar.color} transition-all`} style={{ width: `${bar.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default CompanyReadinessCard;
