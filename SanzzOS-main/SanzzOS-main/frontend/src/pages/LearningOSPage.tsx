import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LearningOverviewCard } from '../components/learning/LearningOverviewCard';
import { LearningPathCard } from '../components/learning/LearningPathCard';
import { LearningPathDetailPanel } from '../components/learning/LearningPathDetailPanel';
import { LearningSessionForm } from '../components/learning/LearningSessionForm';
import { RevisionQueue } from '../components/learning/RevisionQueue';
import { SkillMasteryGrid } from '../components/learning/SkillMasteryGrid';
import { LearningMilestones } from '../components/learning/LearningMilestones';
import { LearningRecommendations } from '../components/learning/LearningRecommendations';
import { WeakAreaPanel } from '../components/learning/WeakAreaPanel';
import { LearningResourceList } from '../components/learning/LearningResourceList';
import { KnowledgeVaultPanel } from '../components/learning/KnowledgeVaultPanel';
import { RevisionEnginePanel } from '../components/learning/RevisionEnginePanel';
import { SkillMasteryEvidencePanel } from '../components/learning/SkillMasteryEvidencePanel';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { Card } from '../components/ui/Card';
import { useLearningOS } from '../hooks/useLearningOS';

export const LearningOSPage: React.FC = () => {
  const { state, overview, dueRevision, addSession, completeRevision } = useLearningOS();
  const [selectedPathId, setSelectedPathId] = useState(state.paths[0]?.id || '');
  const selectedPath = useMemo(() => state.paths.find((path) => path.id === selectedPathId) || state.paths[0] || null, [selectedPathId, state.paths]);

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

    const colors = ['#f97316', '#eab308', '#22c55e', '#a855f7', '#3b82f6'];
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
        <div>
          <h1 className="text-3xl font-black tracking-tight"
            style={{ background: 'linear-gradient(135deg, #fff 40%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            🍥 Hokage Learning OS
          </h1>
          <p className="mt-2 max-w-3xl text-xs text-textSecondary leading-relaxed">
            A structured command center for skill mastery, revision queues, and milestones.
          </p>
        </div>

        {/* Overview Section */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(0,0,0,0.5))' }}>
          <LearningOverviewCard overview={overview} />
        </div>

        {/* Coach Card */}
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5"
          style={{ border: '1px solid rgba(249,115,22,0.18)', background: 'rgba(20,8,0,0.85)' }}>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Shayla Learning Coach</h3>
            <p className="mt-1.5 text-xs text-textSecondary leading-relaxed max-w-2xl">
              Ask for a personalized learning and revision plan based on your path goals.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ShaylaPromptButton
              prompt={`Shayla, build my next Learning OS session. Selected path: ${selectedPath?.title || 'missing'}. Due revisions: ${dueRevision.length}. Use my tracker data only and explain in German-English.`}
              variant="secondary"
              className="text-xs h-9 bg-orange-950/40 border border-orange-500/25 hover:border-orange-500/50 text-orange-400"
            >
              Build Session
            </ShaylaPromptButton>
            <ShaylaPromptButton
              prompt="Shayla, find my weakest Learning OS area and give me one focused drill with a tiny first step."
              className="text-xs h-9 bg-purple-950/40 border border-purple-500/25 hover:border-purple-500/50 text-purple-400"
            >
              Weak Area Drill
            </ShaylaPromptButton>
          </div>
        </Card>

        {/* Form and path details */}
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <LearningSessionForm paths={state.paths} selectedPathId={selectedPath?.id || ''} onSubmit={addSession} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <LearningPathDetailPanel path={selectedPath} sessions={state.sessions} />
          </div>
        </div>

        {/* Paths Grid */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">📓</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 font-mono font-bold">Active Learning Paths</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.paths.map((path) => (
            <div key={path.id} className="transition transform hover:scale-[1.01] duration-200">
              <LearningPathCard path={path} onSelect={() => setSelectedPathId(path.id)} />
            </div>
          ))}
        </div>

        {/* Mastery Grid & Revision Queue */}
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkillMasteryGrid paths={state.paths} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <RevisionQueue items={dueRevision} onComplete={completeRevision} />
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(59,130,246,0.04))' }}>
          <RevisionEnginePanel
            paths={state.paths}
            sessions={state.sessions}
            dueRevision={dueRevision}
            allRevision={state.revisionItems}
            onComplete={completeRevision}
          />
        </div>

        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(0,0,0,0.5))' }}>
          <KnowledgeVaultPanel />
        </div>

        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(249,115,22,0.04))' }}>
          <SkillMasteryEvidencePanel paths={state.paths} sessions={state.sessions} />
        </div>

        {/* Recommendations & Weak Area Panel */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <LearningRecommendations recommendations={state.recommendations} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <WeakAreaPanel paths={state.paths} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <LearningMilestones milestones={selectedPath?.milestones || []} />
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <LearningResourceList resources={selectedPath?.resources || []} />
        </div>
      </div>
    </div>
  );
};
export default LearningOSPage;
