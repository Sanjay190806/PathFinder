import React from 'react';
import { FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';
import { usePlacementOS } from '../../hooks/usePlacementOS';

export const ReadinessHUD: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { readiness } = usePlacementOS();
  const resumeScore = careerState.resume.atsScore || 0;

  const totalDsa = Object.values(careerState.problemLogs).filter((log) => log.solved).length;
  const hasPlacementData = readiness.score > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {/* 1. Placement Readiness */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">Placement Readiness</span>
          <TrendingUp className="h-4 w-4 text-accentBlue" />
        </div>
        <span className="text-2xl font-black text-textPrimary">{hasPlacementData ? `${readiness.score}%` : '0%'}</span>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-1">
          <div className="h-full bg-accentBlue rounded-full" style={{ width: `${readiness?.score ?? 0}%` }} />
        </div>
        <p className="text-[9px] text-textMuted mt-1 leading-normal">{hasPlacementData ? 'Score based on target companies and preparation logs.' : 'Not enough real placement data yet.'}</p>
      </div>

      {/* 2. ATS Resume Score */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">ATS Resume Score</span>
          <FileText className="h-4 w-4 text-accentPurple" />
        </div>
        <span className="text-2xl font-black text-textPrimary">{resumeScore}%</span>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-1">
          <div className="h-full bg-accentPurple rounded-full" style={{ width: `${resumeScore}%` }} />
        </div>
        <p className="text-[9px] text-textMuted mt-1 leading-normal">{resumeScore > 0 ? 'Latest ATS compliance scanning result score.' : 'No resume analysis has been logged yet.'}</p>
      </div>

      {/* 3. DSA Coding Mastery */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-4 flex flex-col gap-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-textSecondary font-bold uppercase tracking-wider">LeetCode Solved</span>
          <CheckCircle2 className="h-4 w-4 text-accentEmerald" />
        </div>
        <span className="text-2xl font-black text-textPrimary">{totalDsa} Solved</span>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-1">
          <div className="h-full bg-accentEmerald rounded-full" style={{ width: `${Math.min(100, (totalDsa / 150) * 100)}%` }} />
        </div>
        <p className="text-[9px] text-textMuted mt-1 leading-normal">Questions solved towards the 180-day roadmap target.</p>
      </div>
    </div>
  );
};
export default ReadinessHUD;
