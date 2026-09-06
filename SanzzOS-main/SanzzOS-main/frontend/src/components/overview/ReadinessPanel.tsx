import React from 'react';
import { Card } from '../ui/Card';
import { CircularProgress } from '../ui/CircularProgress';
import { useCareerStore } from '../../app/store/useCareerStore';
import { calcPlacementScore, calcConsistencyScore, calcResumeScore } from '../../utils/xpUtils';
import { Target, Repeat2, FileText } from 'lucide-react';

export const ReadinessPanel: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const projects = useCareerStore((s) => s.projects);
  const resume = useCareerStore((s) => s.resume);
  const applications = useCareerStore((s) => s.applications);
  const level = useCareerStore((s) => s.level);
  const badges = useCareerStore((s) => s.badges);

  const stateContext = { userProfile, dailyLogs, problemLogs, projects, resume, applications, level, badges };

  const readiness = calcPlacementScore(stateContext);
  const consistency = calcConsistencyScore(stateContext);
  const resumeScore = calcResumeScore(stateContext);

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Readiness Rings</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Placement, consistency, and resume score</h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col items-center text-center">
          <CircularProgress value={readiness} size={108} strokeWidth={10} color="#3B82F6" />
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-textPrimary">
            <Target className="h-3.5 w-3.5 text-accentBlue" />
            <span>Placement readiness</span>
          </div>
          <p className="mt-1 max-w-[170px] text-[11px] leading-5 text-textSecondary">Weighted readiness from DSA, SkillRack, aptitude, SQL, CS Core, projects, resume, and consistency.</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <CircularProgress value={consistency} size={100} strokeWidth={9} color="#10B981" />
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-textPrimary">
            <Repeat2 className="h-3.5 w-3.5 text-accentEmerald" />
            <span>Consistency</span>
          </div>
          <p className="mt-1 max-w-[170px] text-[11px] leading-5 text-textSecondary">Measures streak depth and day-to-day completion quality.</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <CircularProgress value={resumeScore} size={100} strokeWidth={9} color="#8B5CF6" />
          <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-textPrimary">
            <FileText className="h-3.5 w-3.5 text-accentPurple" />
            <span>Resume score</span>
          </div>
          <p className="mt-1 max-w-[170px] text-[11px] leading-5 text-textSecondary">ATS-ready structure, achievements, and profile completeness.</p>
        </div>
      </div>
    </Card>
  );
};
