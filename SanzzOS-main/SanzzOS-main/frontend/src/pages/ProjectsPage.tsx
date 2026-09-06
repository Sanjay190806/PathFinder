import React, { useMemo, useState, useEffect, useRef } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ProjectDrawer } from '../components/projects/ProjectDrawer';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { useCareerStore } from '../app/store/useCareerStore';
import { Project } from '../types';
import { FolderKanban, Rocket, Layers3, Sparkles, TrendingUp } from 'lucide-react';

type WorkspaceTab = 'workspaces' | 'planning' | 'ai' | 'deployment';

export const ProjectsPage: React.FC = () => {
  const projects = useCareerStore((s) => s.projects);
  const updateProject = useCareerStore((s) => s.updateProject);

  const [activeProjKey, setActiveProjKey] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('workspaces');

  const projectList = useMemo(() => Object.keys(projects).map((key) => ({ key, ...projects[key] })), [projects]);

  const deployedCount = projectList.filter((p) => p.status === 'deployed').length;
  const avgCompleteness = projectList.length > 0
    ? Math.round(
      projectList.reduce((sum, p) => {
        const progress = p.progress || { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 };
        return sum + ((progress.backend + progress.frontend + progress.ai + progress.testing + progress.docs + progress.deploy) / 6);
      }, 0) / projectList.length
    )
    : 0;
  const activeProject = activeProjKey ? projects[activeProjKey] : null;

  const handleProjClick = (key: string) => {
    setActiveProjKey(key);
    setDrawerOpen(true);
  };

  const handleAddNew = () => {
    const newKey = `custom_${Date.now()}`;
    const newProj: Project = {
      name: 'New Custom Project',
      description: 'Describe your custom SWE project workspace here...',
      status: 'ideation',
      stack: ['React', 'Node'],
      github: '',
      demo: '',
      progress: { backend: 0, frontend: 0, ai: 0, testing: 0, docs: 0, deploy: 0 },
      bullets: [],
    };

    updateProject(newKey, newProj);
    setActiveProjKey(newKey);
    setDrawerOpen(true);
  };

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

    const colors = ['#00f0ff', '#eab308', '#dc2626', '#3b82f6'];
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
    <div className="flex flex-col gap-6 pb-10 fade-in select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="⚡ Stark Lab Engineering Matrix"
          subtitle="Architect, assemble, and deploy flagship SWE systems with high-tech holographic workspace tracking"
          actions={
            <Button onClick={handleAddNew} variant="primary" className="gap-2 text-xs py-2 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold shadow-[0_0_15px_rgba(234,179,8,0.4)] border border-yellow-400/30">
              <FolderKanban className="h-4 w-4" />
              New Armor Workspace
            </Button>
          }
        />

        <div className="grid gap-4 xl:grid-cols-4">
          <Card className="flex items-center justify-between gap-3 p-5 bg-black/60 border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.12)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.22)', background: 'rgba(12,14,18,0.85)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500/80 font-mono">Total Armor Workspaces</p>
              <div className="mt-1 text-2xl font-black text-white font-mono">{projectList.length}</div>
            </div>
            <FolderKanban className="h-6 w-6 text-yellow-400" />
          </Card>
          <Card className="flex items-center justify-between gap-3 p-5 bg-black/60 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.12)] backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.22)', background: 'rgba(12,14,18,0.85)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/80 font-mono">Deployed Live Systems</p>
              <div className="mt-1 text-2xl font-black text-cyan-400 font-mono">{deployedCount}</div>
            </div>
            <Rocket className="h-6 w-6 text-cyan-400" />
          </Card>
          <Card className="flex items-center justify-between gap-3 p-5 bg-black/60 border border-red-500/30 shadow-[0_0_12px_rgba(220,38,38,0.12)] backdrop-blur-md" style={{ border: '1px solid rgba(220,38,38,0.22)', background: 'rgba(12,14,18,0.85)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400/80 font-mono">Average Assembly Progress</p>
              <div className="mt-1 text-2xl font-black text-red-400 font-mono">{avgCompleteness}%</div>
            </div>
            <TrendingUp className="h-6 w-6 text-red-400" />
          </Card>
          <Card className="flex items-center justify-between gap-3 p-5 bg-black/60 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.12)] backdrop-blur-md" style={{ border: '1px solid rgba(168,85,247,0.22)', background: 'rgba(12,14,18,0.85)' }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400/80 font-mono">Architecture Style</p>
              <div className="mt-1 text-xl font-extrabold text-white">Stark Portfolio</div>
            </div>
            <Layers3 className="h-6 w-6 text-purple-400" />
          </Card>
        </div>

        <div className="flex gap-2 overflow-x-auto border-b border-white/10 pb-3">
          {[
            ['workspaces', '⚡ Armor Workspaces'],
            ['planning', '📐 Blueprint Planning'],
            ['ai', '🤖 JARVIS AI Coach'],
            ['deployment', '🚀 Orbital Deployment'],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id as WorkspaceTab)}
              className={`rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all ${
                activeTab === id
                  ? 'border border-yellow-500/50 bg-yellow-500/20 text-yellow-300 shadow-[0_0_12px_rgba(234,179,8,0.3)] scale-[1.02]'
                  : 'text-textSecondary hover:text-white bg-black/40 border border-white/5 hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'workspaces' && (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
              {projectList.map((item) => (
                <ProjectCard key={item.key} project={item} onClick={() => handleProjClick(item.key)} />
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <Card className="flex flex-col gap-3 p-5 bg-black/80 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(12,14,18,0.9)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400 font-mono">JARVIS / Shayla AI Engineering Mentor</p>
                </div>
                <h3 className="text-lg font-black text-white">Project Explanation & Pitch Optimizer</h3>
                <p className="text-xs leading-5 text-textSecondary">
                  Sharpen architectural bullet points, make the tech stack recruiter-readable, and keep system design explanations crisp and executive-ready.
                </p>
                <ShaylaPromptButton prompt="Improve my project explanation for placements using current project tracker context. Make it clear, technical, and recruiter-friendly.">
                  ⚡ Optimize Project Telemetry Pitch
                </ShaylaPromptButton>
              </Card>

              <Card className="flex flex-col gap-3 p-5 bg-black/60 border border-white/10 backdrop-blur-md" style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(12,14,18,0.85)' }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500/80 font-mono">Stark Lab Protocol Checklist</p>
                <div className="grid gap-2 text-xs text-textSecondary font-mono">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">1. Define core user problem and architectural outcome.</div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">2. Keep backend, frontend, and AI telemetries visible.</div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">3. Maintain live deployment proof or demo verification.</div>
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5">4. Generate one high-impact resume bullet per milestone.</div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="grid gap-4 xl:grid-cols-2">
            <Card className="flex flex-col gap-3 p-5 bg-black/60 border border-yellow-500/30 backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.22)', background: 'rgba(12,14,18,0.85)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500/80 font-mono">Assembly Blueprint</p>
              <h3 className="text-lg font-black text-white">Next System Upgrades</h3>
              <div className="grid gap-3 text-xs text-textSecondary font-mono">
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-yellow-500/30 transition-all">⚡ Tighten one product architecture story for each system.</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-yellow-500/30 transition-all">⚡ Add one measurable latency/throughput or deployment metric.</div>
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 hover:border-yellow-500/30 transition-all">⚡ Verify every workspace has a clean, verified GitHub repository link.</div>
              </div>
            </Card>
            <Card className="flex flex-col gap-3 p-5 bg-black/60 border border-cyan-500/30 backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.22)', background: 'rgba(12,14,18,0.85)' }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400/80 font-mono">Active Engineering Armor</p>
              <h3 className="text-lg font-black text-white">{activeProject?.name || 'Select an Armor Workspace'}</h3>
              <p className="text-xs leading-5 text-textSecondary">{activeProject?.description || 'Open an Armor Workspace to inspect telemetry and build details.'}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {activeProject?.stack?.map((item) => <Badge key={item} variant="primary">{item}</Badge>)}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <Card className="flex flex-col gap-4 p-6 bg-black/80 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.2)] backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(12,14,18,0.9)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400 font-mono">JARVIS Neural Interface</p>
            <h3 className="text-xl font-black text-white">Ask JARVIS / Shayla to synthesize a high-impact project pitch</h3>
            <ShaylaPromptButton prompt="Review my project tracker and suggest the strongest placement-focused project story I can tell in an interview.">
              ⚡ Synthesize Executive Project Story
            </ShaylaPromptButton>
          </Card>
        )}

        {activeTab === 'deployment' && (
          <Card className="flex flex-col gap-4 p-6 bg-black/60 border border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(220,38,38,0.22)', background: 'rgba(12,14,18,0.85)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400 font-mono">Orbital Deployment Telemetry</p>
            <h3 className="text-lg font-black text-white">Ship Readiness Verification</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 border-l-4 border-l-cyan-400">
                <p className="text-[10px] text-textMuted uppercase font-mono font-bold">Frontend Armor</p>
                <p className="mt-1 text-base font-black text-white">Clean Holographic UI</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 border-l-4 border-l-yellow-400">
                <p className="text-[10px] text-textMuted uppercase font-mono font-bold">Backend Arc Reactor</p>
                <p className="mt-1 text-base font-black text-white">Stable High-Throughput APIs</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 border-l-4 border-l-purple-400">
                <p className="text-[10px] text-textMuted uppercase font-mono font-bold">Live Telemetry</p>
                <p className="mt-1 text-base font-black text-white">Verified Deployment Proof</p>
              </div>
            </div>
          </Card>
        )}

        {activeProjKey && projects[activeProjKey] && (
          <ProjectDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            projectKey={activeProjKey}
            project={projects[activeProjKey]}
          />
        )}
      </div>
    </div>
  );
};

