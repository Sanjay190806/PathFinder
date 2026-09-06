import React, { useState, useEffect, useRef } from 'react';
import { OverviewMetrics } from '../components/overview/OverviewMetrics';
import { WeeklyTrend } from '../components/overview/WeeklyTrend';
import { JourneyHeatmap } from '../components/overview/JourneyHeatmap';
import { ReadinessPanel } from '../components/overview/ReadinessPanel';
import { MilestoneList } from '../components/overview/MilestoneList';
import { ShaylaAdviceCard } from '../components/overview/ShaylaAdviceCard';
import { DeathNoteMotivationCard } from '../components/overview/DeathNoteMotivationCard';
import { SpiderManCodePatrolCard } from '../components/overview/SpiderManCodePatrolCard';
import { BatmanDisciplineCard } from '../components/overview/BatmanDisciplineCard';
import { JokerWildcardCard } from '../components/overview/JokerWildcardCard';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAISettingsStore } from '../app/store/useAISettingsStore';
import { useShaylaAgentStore } from '../app/store/useShaylaAgentStore';
import { buildAgentContext } from '../utils/agentContextUtils';
import { generateDailyBriefing } from '../services/agentService';
import { DailyBriefingPanel } from '../components/shayla-agent/DailyBriefingPanel';
import { ShaylaBriefingResult } from '../types/shaylaAgent';
import { AdaptiveDashboard } from '../components/dashboard/AdaptiveDashboard';
import { AccountSyncWidget } from '../components/dashboard/AccountSyncWidget';
import { DailyMotivationStoryCard } from '../components/overview/DailyMotivationStoryCard';
import { WeeklyReviewDashboard } from '../components/overview/WeeklyReviewDashboard';
import { Bot, ArrowRight, Sparkles } from 'lucide-react';
import { useUIStore } from '../app/store/useUIStore';
import { navigateToPath } from '../utils/navigation';

// ─── Cinematic Section Divider ─────────────────────────────────────────────
const SectionDivider: React.FC<{
  emoji: string;
  title: string;
  subtitle: string;
  gradientFrom: string;
  gradientTo: string;
  accentColor: string;
}> = ({ emoji, title, subtitle, gradientFrom, gradientTo, accentColor }) => (
  <div className="flex items-center gap-3 mb-1">
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-lg">{emoji}</span>
      <div className="flex flex-col">
        <h2 className={`text-xs font-black uppercase tracking-widest bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent`}>
          {title}
        </h2>
        <span className="text-[8px] text-white/25 font-mono uppercase tracking-wider">{subtitle}</span>
      </div>
    </div>
    <div className={`flex-1 h-px bg-gradient-to-r ${accentColor} to-transparent`} />
  </div>
);

export const OverviewPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const settings = useAISettingsStore((s) => s);
  const agentStore = useShaylaAgentStore((s) => s);
  const setActiveSection = useUIStore((s) => s.setActiveSection);
  const [briefing, setBriefing] = useState<ShaylaBriefingResult | null>(null);
  const [loading, setLoading] = useState(false);
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

    const colors = ['#DC2626', '#3B82F6', '#EAB308', '#A855F7', '#22C55E', '#F97316'];
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

  const handleGenerateMorning = async () => {
    setLoading(true);
    try {
      const context = buildAgentContext(careerState);
      const result = await generateDailyBriefing('morning', context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind: 'morning',
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecovery = async () => {
    setLoading(true);
    try {
      const context = buildAgentContext(careerState);
      const result = await generateDailyBriefing('recovery', context, {
        provider: settings.activeProvider,
        model: settings.activeModel,
        mode: settings.activeMode,
        streaming: settings.streamingEnabled,
      });
      setBriefing(result);
      agentStore.recordBriefing({
        id: `briefing-${Date.now()}`,
        kind: 'recovery',
        title: result.title,
        summary: result.summary,
        generatedAt: result.generatedAt,
        fallbackUsed: result.fallbackUsed,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8 relative">
      {/* Ambient canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ opacity: 0.5 }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Direct Link to Shayla AI Mentor */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/50 via-indigo-950/40 to-slate-950/70 p-4 sm:p-5 shadow-[0_0_24px_rgba(168,85,247,0.18)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-[0_0_18px_rgba(168,85,247,0.35)] shrink-0">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shayla AI Mentor</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-yellow-400" />
                  Direct Access
                </span>
              </div>
              <p className="text-xs text-white/60 mt-0.5">Your personal AI career coach, multi-language mentor, and placement strategist</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveSection('ai');
              navigateToPath('/shayla');
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
          >
            <span>Open Shayla AI Mentor</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Adaptive Command Center */}
        <AdaptiveDashboard />
        <AccountSyncWidget />
        <DailyMotivationStoryCard />
        <WeeklyReviewDashboard />

        {/* Daily AI Briefing */}
        <DailyBriefingPanel
          briefing={briefing}
          history={agentStore.briefingHistory}
          loading={loading}
          onGenerateMorning={handleGenerateMorning}
          onGenerateRecovery={handleGenerateRecovery}
        />

        {/* ── Spider-Sense Metrics ── */}
        <div>
          <OverviewMetrics />
        </div>

        {/* ── Gotham Calendar + Chaos Wave ── */}
        <div>
          <SectionDivider
            emoji="🦇"
            title="Gotham Calendar"
            subtitle="Journey Heatmap — 180 day mission grid"
            gradientFrom="from-yellow-400"
            gradientTo="to-yellow-200"
            accentColor="from-yellow-500/30"
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
            <div className="rounded-2xl border border-yellow-900/15 overflow-hidden">
              <JourneyHeatmap />
            </div>
            <div className="flex flex-col gap-2">
              <SectionDivider
                emoji="🃏"
                title="Chaos Wave"
                subtitle="Weekly trend analysis"
                gradientFrom="from-purple-400"
                gradientTo="to-green-400"
                accentColor="from-purple-500/25"
              />
              <div className="rounded-2xl border border-purple-900/15 overflow-hidden flex-1">
                <WeeklyTrend />
              </div>
            </div>
          </div>
        </div>

        {/* ── Shinobi Readiness + Corps Achievements ── */}
        <div>
          <SectionDivider
            emoji="🍥"
            title="Shinobi Readiness"
            subtitle="Interview readiness panel + milestones"
            gradientFrom="from-orange-400"
            gradientTo="to-yellow-300"
            accentColor="from-orange-500/25"
          />
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.9fr]">
            <div className="rounded-2xl border border-orange-900/12 overflow-hidden">
              <ReadinessPanel />
            </div>
            <div className="grid gap-4">
              <div>
                <SectionDivider
                  emoji="🌊"
                  title="Corps Log"
                  subtitle="Slayer corps milestones"
                  gradientFrom="from-blue-400"
                  gradientTo="to-cyan-300"
                  accentColor="from-blue-500/25"
                />
                <div className="rounded-2xl border border-blue-900/12 overflow-hidden">
                  <MilestoneList />
                </div>
              </div>
              <DeathNoteMotivationCard />
              <ShaylaAdviceCard />
            </div>
          </div>
        </div>

        {/* ── DC Hero/Villain Command Cards ── */}
        <div>
          <SectionDivider
            emoji="🦸"
            title="Hero · Villain · Shinobi Command"
            subtitle="Spider-Man · Batman · Joker tracker cards"
            gradientFrom="from-red-400"
            gradientTo="to-purple-400"
            accentColor="from-red-500/25 via-blue-500/15"
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <SpiderManCodePatrolCard />
            <BatmanDisciplineCard />
            <JokerWildcardCard />
          </div>
        </div>
      </div>
    </div>
  );
};
