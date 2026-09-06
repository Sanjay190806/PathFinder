import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Save, Calendar, Target } from 'lucide-react';
import { PlannerInsights } from '../components/smart-planner/PlannerInsights';
import { PlannerModeSelector } from '../components/smart-planner/PlannerModeSelector';
import { SmartTaskCard } from '../components/smart-planner/SmartTaskCard';
import { TodayPlanSummary } from '../components/smart-planner/TodayPlanSummary';
import { GoalTrackerPanel } from '../components/smart-planner/GoalTrackerPanel';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useSmartPlanner } from '../hooks/useSmartPlanner';
import { PlannerMode } from '../types/smartPlanner';

export const SmartPlannerPage: React.FC = () => {
  const { plan, generate, save, completeTask } = useSmartPlanner();
  const [mode, setMode] = useState<PlannerMode>(plan.mode);
  const [activeTab, setActiveTab] = useState<'planner' | 'goals'>('planner');

  const completed = plan.tasks.filter((task) => task.status === 'completed').length;
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

    const colors = ['#f97316', '#a855f7', '#3b82f6', '#eab308'];
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
    <div className="workspace-page flex flex-col gap-5 pb-12 md:pb-8 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-5 w-full">
        {/* Page Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{ background: 'linear-gradient(135deg, #fff 40%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🍥 Hokage Smart Daily Planner &amp; Campaign Goals
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs text-textSecondary leading-relaxed">
              Generate AI daily schedules based on chakra energy levels and track your target milestones for placements.
            </p>
          </div>
          {activeTab === 'planner' && (
            <div className="flex flex-wrap gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => generate(mode)} className="text-xs h-9 rounded-xl border-orange-500/30 hover:border-orange-500/50">
                <RotateCcw className="mr-1.5 h-3.5 w-3.5 text-orange-400" /> Regenerate Plan
              </Button>
              <Button size="sm" onClick={save} className="text-xs h-9 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save Plan
              </Button>
            </div>
          )}
        </div>

        {/* Tabs Selector */}
        <div className="flex gap-2 border-b border-white/5 pb-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('planner')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
              activeTab === 'planner'
                ? 'border border-orange-500/40 bg-orange-950/30 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
                : 'border border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" /> Daily Planner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition ${
              activeTab === 'goals'
                ? 'border border-orange-500/40 bg-orange-950/30 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.25)]'
                : 'border border-transparent text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Target className="h-3.5 w-3.5" /> Campaign Goals
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'planner' ? (
          <div className="flex flex-col gap-5 animate-fadeIn">
            <Card className="border-white/5 bg-black/60 p-4" style={{ border: '1px solid rgba(249,115,22,0.2)', background: 'rgba(15,8,3,0.8)' }}>
              <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-orange-400/80 font-mono">Chakra Energy Mode</p>
              <PlannerModeSelector value={mode} onChange={(next) => { setMode(next); generate(next); }} />
            </Card>
            
            <TodayPlanSummary plan={plan} />
            <PlannerInsights insight={plan.insight} />
            
            <div className="flex flex-col gap-3">
              {plan.tasks.map((task) => (
                <SmartTaskCard key={task.id} task={task} onComplete={completeTask} />
              ))}
            </div>
            
            <Card className="border-white/5 bg-black/60 p-4" style={{ border: '1px solid rgba(249,115,22,0.18)', background: 'rgba(15,8,3,0.85)' }}>
              <h3 className="text-sm font-black text-textPrimary uppercase tracking-wider">Mission Completion Summary</h3>
              <p className="mt-1.5 text-xs text-textSecondary leading-relaxed">
                {completed === plan.tasks.length
                  ? '🎯 All missions complete! S-Rank performance achieved today.'
                  : `${completed} missions completed, ${plan.tasks.length - completed} remaining. Keep your focus steady and conquer the day.`}
              </p>
            </Card>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <GoalTrackerPanel />
          </div>
        )}
      </div>
    </div>
  );
};
export default SmartPlannerPage;
