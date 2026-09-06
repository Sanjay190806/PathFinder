import React, { useMemo, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTodayDay } from '../utils/dateUtils';

export const SkillRackPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const skillRackStats = careerState.skillRackStats || { totalSolved: 0, easyCount: 0, mediumCount: 0, hardCount: 0, categories: {} };
  const dailyLogs = careerState.dailyLogs || {};
  const userProfile = careerState.userProfile;
  const updateSkillRackStats = useCareerStore((s) => s.updateSkillRackStats);
  const updateSkillRackCategory = useCareerStore((s) => s.updateSkillRackCategory);

  const skillRackCategories = [
    'Basic I/O', 'If/Else', 'Loops', 'Arrays', 'Strings', 'Functions',
    'Recursion', 'Sorting', 'Searching', 'Pattern Printing', 'Math', 'Matrix', 'Hashing'
  ];

  const todayDay = getTodayDay(userProfile.startDate);

  const metrics = useMemo(() => {
    const dayNumbers = Array.from({ length: todayDay }, (_, index) => index + 1);
    const solvedByDay = dayNumbers.map((day) => dailyLogs[day]?.counts?.skillrack || 0);
    const weeklySolved = solvedByDay.slice(-7).reduce((sum, value) => sum + value, 0);
    const bestDay = Math.max(0, ...solvedByDay);
    let streak = 0;
    for (let day = todayDay; day >= 1; day -= 1) {
      if ((dailyLogs[day]?.counts?.skillrack || 0) > 0) streak += 1;
      else break;
    }
    return {
      weeklySolved,
      bestDay,
      streak,
      todaySolved: dailyLogs[todayDay]?.counts?.skillrack || 0
    };
  }, [dailyLogs, todayDay]);

  const handleDifficultyIncrement = (diff: 'easyCount' | 'mediumCount' | 'hardCount', val: number) => {
    const currentVal = skillRackStats[diff] || 0;
    const newVal = Math.max(0, currentVal + val);
    const total = (diff === 'easyCount' ? newVal : skillRackStats.easyCount) +
      (diff === 'mediumCount' ? newVal : skillRackStats.mediumCount) +
      (diff === 'hardCount' ? newVal : skillRackStats.hardCount);

    updateSkillRackStats({
      [diff]: newVal,
      totalSolved: total
    });
  };

  const handleCategoryIncrement = (cat: string, val: number) => {
    const cats = skillRackStats.categories || {};
    const currentVal = cats[cat] || 0;
    updateSkillRackCategory(cat, Math.max(0, currentVal + val));
  };

  const targetProgress = Math.min(Math.round((skillRackStats.totalSolved / 1200) * 100), 100);
  const dailyTargetProgress = Math.min(Math.round((metrics.todaySolved / 10) * 100), 100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Ambient particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;
    const parent = canvas.parentElement;
    let w = (canvas.width = parent?.offsetWidth || window.innerWidth);
    let h = (canvas.height = parent?.offsetHeight || window.innerHeight);
    const onResize = () => {
      if (!canvas || !canvas.parentElement) return;
      w = canvas.width = canvas.parentElement.offsetWidth;
      h = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', onResize);

    const colors = ['#dc2626', '#3b82f6', '#a855f7', '#eab308'];
    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 1.5 + 0.4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.12 + 0.03
    }));

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 5; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, []);

  return (
    <div className="fade-in flex flex-col gap-6 pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="🕸️ Spider-Verse Web Matrix Coding Board"
          subtitle="Clean daily problem counters, multi-dimensional category progress, and high-velocity pacing toward the 1200 target"
        />

        <Card className="grid gap-4 p-5 bg-black/60 border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)] backdrop-blur-md md:grid-cols-4" style={{ border: '1px solid rgba(220,38,38,0.25)', background: 'rgba(15,10,18,0.85)' }}>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400 font-mono">Total Solved</p>
            <p className="mt-1 text-2xl font-black text-white font-mono">{skillRackStats.totalSolved}</p>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400 font-mono">Weekly Solved</p>
            <p className="mt-1 text-2xl font-black text-blue-400 font-mono">{metrics.weeklySolved}</p>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400 font-mono">Best Web Day</p>
            <p className="mt-1 text-2xl font-black text-purple-400 font-mono">{metrics.bestDay}</p>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-400 font-mono">Current Streak</p>
            <p className="mt-1 text-2xl font-black text-yellow-400 font-mono">{metrics.streak} days</p>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="flex flex-col gap-4 p-5 bg-black/60 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(59,130,246,0.25)', background: 'rgba(15,10,18,0.85)' }}>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-blue-400 font-mono">Web Slinger Counters</p>
                <h3 className="mt-1 text-lg font-black text-white">Easy / Medium / Hard</h3>
              </div>
              <span className="text-xs text-blue-300 font-mono font-bold px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">Daily target: 10</span>
            </div>

            <div className="grid gap-3">
              {([
                ['Easy Problems', 'easyCount', 'text-emerald-400'],
                ['Medium Problems', 'mediumCount', 'text-yellow-400'],
                ['Hard Problems', 'hardCount', 'text-red-400']
              ] as const).map(([label, key, colorClass]) => (
                <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-blue-500/30 transition-all">
                  <span className={`text-sm font-bold ${colorClass}`}>{label}</span>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => handleDifficultyIncrement(key, -1)} className="h-7 w-7 p-0 rounded-lg border-white/20 hover:bg-white/10">
                      -
                    </Button>
                    <span className="min-w-10 text-center text-lg font-black text-white font-mono">
                      {skillRackStats[key]}
                    </span>
                    <Button type="button" size="sm" onClick={() => handleDifficultyIncrement(key, 1)} className="h-7 w-7 p-0 rounded-lg bg-blue-600 hover:bg-blue-500 font-black">
                      +
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2 pt-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400 font-mono">Daily Target</p>
                <p className="mt-2 text-xl font-black text-white font-mono">{metrics.todaySolved}/10</p>
                <ProgressBar value={dailyTargetProgress} color="#3b82f6" className="mt-3" />
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400 font-mono">1200 Web Target</p>
                <p className="mt-2 text-xl font-black text-white font-mono">{skillRackStats.totalSolved}/1200</p>
                <ProgressBar value={targetProgress} color="#dc2626" className="mt-3" />
              </div>
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5 bg-black/60 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(15,10,18,0.85)' }}>
            <div className="border-b border-white/10 pb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400 font-mono">Multi-Verse Spread</p>
              <h3 className="mt-1 text-lg font-black text-white">SkillRack Topic Progress</h3>
            </div>
            <div className="flex flex-col gap-3 max-h-[480px] overflow-y-auto pr-1">
              {skillRackCategories.map((cat) => {
                const count = (skillRackStats.categories || {})[cat] || 0;
                const pct = Math.min(Math.round((count / 25) * 100), 100);
                return (
                  <div key={cat} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-purple-500/30 transition-all">
                    <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-white font-mono">{cat}</span>
                      <div className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleCategoryIncrement(cat, -1)} className="h-6 w-6 p-0 text-textMuted hover:text-white">
                          -
                        </Button>
                        <span className="w-6 text-center font-black text-purple-400 font-mono">{count}</span>
                        <Button type="button" size="sm" onClick={() => handleCategoryIncrement(cat, 1)} className="h-6 w-6 p-0 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded">
                          +
                        </Button>
                      </div>
                    </div>
                    <ProgressBar value={pct} color="#a855f7" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
