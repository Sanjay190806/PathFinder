import React from 'react';
import { FileText, Code2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCareerStore } from '../../app/store/useCareerStore';


export const ProjectResumePriorityPanel: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const projectsList = Object.values(careerState.projects || {});
  const flagship = projectsList[0];
  const resumeAts = careerState.resume?.atsScore || 0;

  // Calculate project overall progress average
  const getFlagshipProgress = () => {
    if (!flagship || !flagship.progress) return 0;
    const values = Object.values(flagship.progress);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  const flagshipProgress = getFlagshipProgress();

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-white/5 bg-white/[0.01] p-4.5 select-none">
      <div className="flex justify-between items-center pl-0.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-textSecondary">Portfolio Priority targets</span>
        <span className="text-[8px] text-textMuted uppercase font-bold">Resume & Projects</span>
      </div>

      <div className="flex flex-col gap-3">
        {/* Flagship Project Card */}
        {flagship ? (
          <div className="rounded-xl border border-white/5 bg-black/45 p-3 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-accentBlue" />
                <span className="text-xs font-bold text-textPrimary">{flagship.name}</span>
              </div>
              <span className="text-[10px] font-bold text-accentBlue">{flagshipProgress}% Done</span>
            </div>
            
            <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-accentBlue rounded-full" style={{ width: `${flagshipProgress}%` }} />
            </div>
            
            <p className="text-[9px] text-textSecondary leading-normal leading-relaxed">
              Flagship project README target is {flagship.progress?.docs || 0}% complete. Focus on documentation sync.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-black/45 p-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-textMuted" />
              <span className="text-xs font-bold text-textPrimary">No project tracked yet</span>
            </div>
            <p className="mt-2 text-[9px] text-textSecondary leading-relaxed">
              Add a real project before project priority targets appear here.
            </p>
          </div>
        )}

        {/* Resume ATS Card */}
        <div className="rounded-xl border border-white/5 bg-black/45 p-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accentPurple" />
              <span className="text-xs font-bold text-textPrimary">ATS Compliance</span>
            </div>
            <span className="text-[10px] font-bold text-accentPurple">{resumeAts}% Score</span>
          </div>
          
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div className="h-full bg-accentPurple rounded-full" style={{ width: `${resumeAts}%` }} />
          </div>

          <div className="flex items-start gap-1.5 text-[8.5px] text-textSecondary mt-0.5 leading-snug">
            {resumeAts <= 0 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-textMuted shrink-0" />
                <span>No resume analysis has been logged yet.</span>
              </>
            ) : resumeAts < 75 ? (
              <>
                <AlertTriangle className="h-3.5 w-3.5 text-accentYellow shrink-0" />
                <span>Optimize project bullet templates to raise rating over 75% target threshold.</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-accentEmerald shrink-0" />
                <span>Resume ATS parameters are within acceptable corporate thresholds.</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProjectResumePriorityPanel;
