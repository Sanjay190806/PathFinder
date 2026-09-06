import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { calcPlacementScore, calcResumeScore, getStreak, getTotalLCSolved } from '../../utils/xpUtils';
import { Medal } from 'lucide-react';

export const MilestoneList: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const projects = useCareerStore((s) => s.projects);
  const resume = useCareerStore((s) => s.resume);
  const applications = useCareerStore((s) => s.applications);
  const level = useCareerStore((s) => s.level);
  const badges = useCareerStore((s) => s.badges);

  const stateContext = { userProfile, dailyLogs, problemLogs, projects, resume, applications, level, badges };

  const solved = getTotalLCSolved(stateContext);
  const streak = getStreak(stateContext);
  const resumeScore = calcResumeScore(stateContext);
  const placementScore = calcPlacementScore(stateContext);

  const milestones = [
    { label: '7-Day Consistency Streak', check: streak >= 7, target: '7 days streak' },
    { label: '30-Day Beast Status', check: streak >= 30, target: '30 days streak' },
    { label: '100 LeetCode Solved', check: solved >= 100, target: '100 solved' },
    { label: 'ATS Resume Score > 80%', check: resumeScore >= 80, target: 'ATS score check' },
    { label: 'First Application Tracked', check: applications.length >= 1, target: '1 application' },
    { label: 'Placement Score > 75%', check: placementScore >= 75, target: 'Readiness score check' },
  ];

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Milestones</p>
          <h3 className="mt-1 text-lg font-semibold text-textPrimary">Placement checkpoints</h3>
        </div>
        <Medal className="h-4 w-4 text-accentYellow" />
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {milestones.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 rounded-2xl border border-border-subtle/70 bg-white/[0.04] px-3 py-3 text-xs">
            <div className="min-w-0">
              <p className={`font-medium ${m.check ? 'text-textPrimary' : 'text-textSecondary'}`}>
                {m.label}
              </p>
              <p className="mt-1 text-[11px] text-textMuted">{m.target}</p>
            </div>
            <Badge variant={m.check ? 'success' : 'neutral'}>
              {m.check ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};
