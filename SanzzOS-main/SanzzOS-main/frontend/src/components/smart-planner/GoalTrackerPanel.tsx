import React from 'react';
import { Card } from '../ui/Card';
import { useCareerStore } from '../../app/store/useCareerStore';
import { getTodayDay } from '../../utils/dateUtils';
import { Sparkles } from 'lucide-react';

export const GoalTrackerPanel: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const problemLogs = useCareerStore((s) => s.problemLogs || {});
  const userProfile = useCareerStore((s) => s.userProfile || { startDate: '2026-07-01' });
  const companyTargets = careerState.companyTargets || [];

  const todayDay = getTodayDay(userProfile.startDate);

  // 1. DSA Metrics
  const totalLCSolved = Object.keys(problemLogs).length;
  const dsaTarget = 360;
  const dsaProgress = Math.min(100, Math.round((totalLCSolved / dsaTarget) * 100));

  // 2. German Vocabulary Metrics
  const vocabProgress = careerState.vocabulary || {};
  const totalGermanVocab = 100; // General target
  const knownGermanVocab = Object.values(vocabProgress).filter((v: any) => v.status === 'known').length;
  const germanProgress = Math.min(100, Math.round((knownGermanVocab / totalGermanVocab) * 100));

  // 3. Calendar Timeline
  const timeProgress = Math.min(100, Math.round((todayDay / 180) * 100));

  // 4. Project Release Metrics
  const projectsList = careerState.projects || [];
  const projectReleasesCount = Object.values(projectsList).reduce((acc: number, p: any) => acc + (p.releases?.length || 0), 0);
  const releaseTarget = 5;
  const projectProgress = Math.min(100, Math.round((projectReleasesCount / releaseTarget) * 100));

  // 5. Placement CRM pipeline
  const pipelineTarget = 15;
  const pipelineCount = companyTargets.length;
  const pipelineProgress = Math.min(100, Math.round((pipelineCount / pipelineTarget) * 100));

  const goals = [
    {
      title: '🕷️ Spider-Verse DSA Target',
      subtitle: 'Complete 360 LeetCode pattern questions',
      current: totalLCSolved,
      target: dsaTarget,
      pct: dsaProgress,
      color: 'from-red-500 to-rose-600',
      shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]',
      desc: 'Master basic linear, trees, graphs, and backtracking algorithms.'
    },
    {
      title: '📓 Death Note Vocab Target',
      subtitle: 'Achieve vocabulary mastery across 100 words',
      current: knownGermanVocab,
      target: totalGermanVocab,
      pct: germanProgress,
      color: 'from-red-600 to-crimson-800',
      shadow: 'shadow-[0_0_12px_rgba(185,28,28,0.25)]',
      desc: 'Keep cards review-clear under spaced repetition stages.'
    },
    {
      title: '🦇 Gotham Career Pipeline',
      subtitle: 'Build a list of 15 target active companies',
      current: pipelineCount,
      target: pipelineTarget,
      pct: pipelineProgress,
      color: 'from-yellow-500 to-orange-500',
      shadow: 'shadow-[0_0_12px_rgba(234,179,8,0.25)]',
      desc: 'Connect with mentors, track interviews, and align applications.'
    },
    {
      title: '🌊 Slayer Project Releases',
      subtitle: 'Log and deploy 5 project feature releases',
      current: projectReleasesCount,
      target: releaseTarget,
      pct: projectProgress,
      color: 'from-cyan-500 to-blue-500',
      shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]',
      desc: 'Develop modular, interview-ready applications.'
    },
    {
      title: '🍥 180-Day Chronology Path',
      subtitle: 'Complete the consistency study arc',
      current: todayDay,
      target: 180,
      pct: timeProgress,
      color: 'from-purple-500 to-indigo-600',
      shadow: 'shadow-[0_0_12px_rgba(168,85,247,0.25)]',
      desc: 'Build strong study habits through consistent daily logs.'
    }
  ];

  return (
    <div className="flex flex-col gap-6 select-none animate-fadeIn">
      {/* Overview Milestone Card */}
      <Card className="p-5 border-white/5 bg-gradient-to-r from-purple-950/20 via-black to-black flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-[120px] opacity-[0.01] pointer-events-none select-none">🎯</div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[8px] font-black uppercase tracking-[0.25em] text-purple-400 font-mono">Milestone Status</span>
          <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
            Sanju's Placement Campaign Objectives <Sparkles className="h-4 w-4 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          </h2>
          <p className="text-xs text-textSecondary max-w-xl leading-relaxed">
            These parameters represent the ultimate target milestones needed to successfully clear your campus placement preparation. Keep them green!
          </p>
        </div>
        <div className="flex gap-4 shrink-0 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-white/40">Active Goals</span>
            <span className="text-base font-black text-white">{goals.length}</span>
          </div>
          <div className="h-8 w-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase font-bold text-white/40">Average Progress</span>
            <span className="text-base font-black text-purple-400">
              {Math.round(goals.reduce((acc, g) => acc + g.pct, 0) / goals.length)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between gap-4 border-white/5 bg-black/60 relative overflow-hidden group">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-white">{g.title}</span>
                <span className="text-[10px] font-black font-mono text-white/40">{g.pct}%</span>
              </div>
              <span className="text-[10px] text-textMuted font-medium">{g.subtitle}</span>
              <p className="text-[9px] text-textSecondary leading-relaxed mt-1">{g.desc}</p>
            </div>

            <div className="flex flex-col gap-2">
              {/* Progress bar container */}
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                <div
                  className={`h-full bg-gradient-to-r ${g.color} ${g.shadow} transition-all duration-500 rounded-full`}
                  style={{ width: `${g.pct}%` }}
                />
              </div>

              {/* Progress indicators */}
              <div className="flex justify-between items-center text-[9px] font-mono text-white/30">
                <span>Current: {g.current}</span>
                <span>Target: {g.target}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
export default GoalTrackerPanel;
