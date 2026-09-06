import React, { useEffect, useRef } from 'react';
import { AIBrainCard } from '../components/ai-brain/AIBrainCard';
import { AIRecommendationPanel } from '../components/ai-brain/AIRecommendationPanel';
import { CareerRiskCard } from '../components/ai-brain/CareerRiskCard';
import { SkillInsightCard } from '../components/ai-brain/SkillInsightCard';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useAIBrain } from '../hooks/useAIBrain';

export const AIBrainPage: React.FC = () => {
  const { summary, refresh, isFallback } = useAIBrain();
  
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

    const colors = ['#A855F7', '#22C55E', '#3B82F6', '#EAB308', '#DC2626'];
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
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight"
              style={{ background: 'linear-gradient(135deg, #fff 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🃏 Joker Protocol AI Brain
            </h1>
            {isFallback && <Badge variant="warning" className="bg-yellow-950/40 border border-yellow-500/30 text-yellow-400">local fallback</Badge>}
          </div>
          <p className="max-w-3xl text-xs text-textSecondary leading-relaxed">
            Summarize skill signals, active project strength, placement readiness, risks, and next actions.
          </p>
        </div>

        {/* Brain card & Coach Card */}
        <div className="grid gap-4 xl:grid-cols-[1fr_0.55fr]">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,0,0,0.5))' }}>
            <AIBrainCard summary={summary} onRefresh={refresh} />
          </div>
          <Card className="flex flex-col justify-between gap-4 p-5"
            style={{ border: '1px solid rgba(168,85,247,0.18)', background: 'rgba(10,2,25,0.85)' }}>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Shayla Brain Coach</h3>
              <p className="mt-1.5 text-xs text-textSecondary leading-relaxed">
                Send your current snapshot to Shayla for a fresh context-honest action plan.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ShaylaPromptButton
                prompt={`Use my AI Brain summary and give me a tracker-honest plan. Strongest: ${summary.strongestSkills.map((s) => `${s.name} ${s.score}%`).join(', ') || 'missing'}. Weakest: ${summary.weakestSkills.map((s) => `${s.name} ${s.score}%`).join(', ') || 'missing'}. Risks: ${summary.riskFlags.map((r) => r.title).join(', ') || 'none logged'}. Keep it short, German-English, and call out only real data.`}
                variant="secondary"
                className="text-xs h-9 bg-purple-950/40 border border-purple-500/25 hover:border-purple-500/50 text-purple-400"
              >
                Ask For Plan
              </ShaylaPromptButton>
              <ShaylaPromptButton
                prompt="Shayla, review my weakest tracker areas and give me a 45-minute recovery session for today. Use only real tracker data."
                className="text-xs h-9 bg-green-950/40 border border-green-500/25 hover:border-green-500/50 text-green-400"
              >
                Fix Weak Area
              </ShaylaPromptButton>
            </div>
          </Card>
        </div>

        {/* Skill insights */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkillInsightCard title="Strongest skills" skills={summary.strongestSkills} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkillInsightCard title="Weakest skills" skills={summary.weakestSkills} />
          </div>
        </div>

        {/* Recommendations & Risks */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <AIRecommendationPanel recommendations={summary.recommendations} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <CareerRiskCard risks={summary.riskFlags} />
          </div>
        </div>

        {/* Project portfolio list */}
        <Card className="p-5 border-white/5 bg-black/60">
          <h3 className="mb-4 text-sm font-black text-white uppercase tracking-wider">Project portfolio status</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {summary.projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-xs text-textSecondary md:col-span-3">
                No real project data entered yet. Add a project before AI Brain scores portfolio strength.
              </div>
            ) : summary.projects.map((project) => (
              <div key={project.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                <p className="font-semibold text-textPrimary text-xs">{project.name}</p>
                <p className="mt-1 text-[10px] text-textSecondary">{project.status} · {project.score}%</p>
                <p className="mt-3 text-[9px] text-textMuted leading-relaxed">{project.nextAction}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
export default AIBrainPage;
