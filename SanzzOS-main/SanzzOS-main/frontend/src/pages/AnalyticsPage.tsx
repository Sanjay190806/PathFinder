import React, { useEffect, useRef } from 'react';
import { AnalyticsOverviewCards } from '../components/analytics/AnalyticsOverviewCards';
import { AnalyticsInsightPanel } from '../components/analytics/AnalyticsInsightPanel';
import { BurnoutRiskCard } from '../components/analytics/BurnoutRiskCard';
import { CompletionRateChart } from '../components/analytics/CompletionRateChart';
import { FocusBalanceCard } from '../components/analytics/FocusBalanceCard';
import { LearningHeatmap } from '../components/analytics/LearningHeatmap';
import { MonthlyProgressChart } from '../components/analytics/MonthlyProgressChart';
import { ReadinessTrendChart } from '../components/analytics/ReadinessTrendChart';
import { SkillBreakdownChart } from '../components/analytics/SkillBreakdownChart';
import { TimeRangeSelector } from '../components/analytics/TimeRangeSelector';
import { WeeklyProgressChart } from '../components/analytics/WeeklyProgressChart';
import { XPTrendChart } from '../components/analytics/XPTrendChart';
import { useAnalytics } from '../hooks/useAnalytics';

export const AnalyticsPage: React.FC = () => {
  const { dashboard, range, setRange } = useAnalytics();
  
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

    const colors = ['#A855F7', '#EAB308', '#22C55E', '#3B82F6', '#F97316'];
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
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{ background: 'linear-gradient(135deg, #fff 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              📊 Sage Mode Analytics OS
            </h1>
            <p className="mt-2 max-w-3xl text-xs text-textSecondary leading-relaxed">
              Learning, placement, XP accumulation, burnout assessment, and focus balance analytics.
            </p>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-1 shrink-0">
            <TimeRangeSelector value={range} onChange={setRange} />
          </div>
        </div>

        {/* Overview cards */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,0,0,0.5))' }}>
          <AnalyticsOverviewCards snapshot={dashboard.snapshot} />
        </div>

        {/* Skill breakdown and insight panel */}
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkillBreakdownChart skills={dashboard.skills} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <AnalyticsInsightPanel insights={dashboard.insights} />
          </div>
        </div>

        {/* Weekly, Monthly, and Burnout charts */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <WeeklyProgressChart data={dashboard.weekly} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <MonthlyProgressChart data={dashboard.monthly} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <BurnoutRiskCard snapshot={dashboard.snapshot} />
          </div>
        </div>

        {/* Contribution heatmap, Trend and readiness curves */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <LearningHeatmap />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <XPTrendChart />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ReadinessTrendChart data={dashboard.readinessTrend} />
          </div>
        </div>

        {/* Completion rate & Focus balance */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CompletionRateChart data={dashboard.productivityTrend} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <FocusBalanceCard categories={dashboard.categories} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalyticsPage;
