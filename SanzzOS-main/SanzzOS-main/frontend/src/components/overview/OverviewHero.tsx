import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay, getPhaseName } from '../../utils/dateUtils';
import { getStreak } from '../../utils/xpUtils';
import { ROADMAP } from '../../data/roadmap';
import { Sparkles, Target, Flame } from 'lucide-react';

export const OverviewHero: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const dailyLogs = useCareerStore((s) => s.dailyLogs);
  const problemLogs = useCareerStore((s) => s.problemLogs);
  const projects = useCareerStore((s) => s.projects);
  const resume = useCareerStore((s) => s.resume);
  const applications = useCareerStore((s) => s.applications);
  const level = useCareerStore((s) => s.level);
  const badges = useCareerStore((s) => s.badges);

  const stateContext = { userProfile, dailyLogs, problemLogs, projects, resume, applications, level, badges };

  const currentDay = getTodayDay(userProfile.startDate);
  const phase = getPhaseName(currentDay);
  const streak = getStreak(stateContext);

  const todayProblems = ROADMAP[String(currentDay)] || [];
  const topicName = todayProblems[0]?.topic || 'Revision Phase';

  return (
    <Card className="relative overflow-hidden border-border-accent/30 bg-gradient-to-br from-bgCard/95 via-bgCard/80 to-accentBlue/5 p-6 md:p-7">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(139,92,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="orange" className="border-accentOrange/25 bg-accentOrange/10 text-accentOrange">
              <Flame className="mr-1 h-3.5 w-3.5" />
              {streak} day streak
            </Badge>
            <Badge variant="primary" className="border-accentBlue/20 bg-accentBlue/10 text-accentBlue">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Phase {phase}
            </Badge>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-textPrimary md:text-4xl">Hallo {userProfile.name}</h2>
            <p className="max-w-2xl text-sm leading-6 text-textSecondary md:text-base">
              Day <span className="font-semibold text-textPrimary">{currentDay}</span> of <span className="font-semibold text-textPrimary">180</span>, focused on <span className="text-accentBlue">{topicName}</span>.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-textSecondary">
            <span className="topbar-chip">
              <Target className="h-3.5 w-3.5 text-accentBlue" />
              Current phase: {phase}
            </span>
            <span className="topbar-chip">
              <Flame className="h-3.5 w-3.5 text-accentOrange" />
              {streak} day streak
            </span>
            <span className="topbar-chip">
              <Sparkles className="h-3.5 w-3.5 text-accentPurple" />
              {todayProblems.length} tasks queued
            </span>
          </div>
        </div>

        <div className="glass-card relative w-full max-w-sm border-border-subtle/80 bg-white/[0.04] p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accentBlue/15 text-accentBlue">
              <Target className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Today&apos;s focus</p>
              <p className="mt-1 text-lg font-semibold text-textPrimary">{topicName}</p>
              <p className="mt-1 text-sm text-textSecondary">{todayProblems.length} LeetCode problem{todayProblems.length === 1 ? '' : 's'} scheduled for today.</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
