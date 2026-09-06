import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PortfolioHero } from '../components/portfolio/PortfolioHero';
import { PortfolioMetrics } from '../components/portfolio/PortfolioMetrics';
import { PortfolioArchitecture } from '../components/portfolio/PortfolioArchitecture';
import { PortfolioProjectShowcase } from '../components/portfolio/PortfolioProjectShowcase';
import { PortfolioAIDemo } from '../components/portfolio/PortfolioAIDemo';
import { PortfolioPrivacyToggle } from '../components/portfolio/PortfolioPrivacyToggle';
import { DEMO_PORTFOLIO } from '../data/demoPortfolioData';
import { ArrowRight, BookOpen, Code, Languages, LineChart, Sparkles, ShieldCheck } from 'lucide-react';
import { navigateToPath } from '../utils/navigation';

export const PortfolioModePage: React.FC = () => {
  const [demoMode, setDemoMode] = useState(true);
  const [activeSection, setActiveSection] = useState<'hero' | 'walkthrough' | 'architecture' | 'ai' | 'german' | 'analytics' | 'projects' | 'tech' | 'script'>('hero');

  const content = useMemo(() => {
    if (!demoMode) {
      return {
        ...DEMO_PORTFOLIO,
        hero: {
          ...DEMO_PORTFOLIO.hero,
          subtitle: 'Sanitized live shell with private data hidden.',
          pitch: 'This mode still keeps the recruiter-facing story safe while showing the product shell.',
        }
      };
    }
    return DEMO_PORTFOLIO;
  }, [demoMode]);

  const walkthroughSections = [
    { id: 'hero', label: 'Hero', icon: Sparkles },
    { id: 'walkthrough', label: 'Why I built this', icon: ShieldCheck },
    { id: 'architecture', label: 'Architecture', icon: Code },
    { id: 'ai', label: 'Shayla AI', icon: Sparkles },
    { id: 'german', label: 'German Academy', icon: Languages },
    { id: 'analytics', label: 'Career intelligence', icon: LineChart },
    { id: 'projects', label: 'Projects', icon: BookOpen },
    { id: 'tech', label: 'Tech stack', icon: Code },
    { id: 'script', label: 'Demo script', icon: ArrowRight },
  ] as const;

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

    const colors = ['#00f0ff', '#eab308', '#3b82f6', '#a855f7'];
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
    <div className="flex flex-col gap-6 px-4 py-6 md:px-6 lg:px-8 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <div className="flex flex-col gap-3 border-b border-cyan-500/30 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-400 font-mono">⚡ STARK INDUSTRIES / RECRUITER PORTFOLIO VIEW</p>
            <h1 className="mt-1 text-2xl font-black text-white font-mono">Sanju Career OS // Armor Command</h1>
          </div>
          <Button variant="primary" className="gap-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" onClick={() => navigateToPath('/dashboard')}>
            Enter workspace <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-1 bg-black/40 rounded-3xl border border-cyan-500/20 backdrop-blur-sm">
          <PortfolioHero
            name={content.hero.name}
            subtitle={content.hero.subtitle}
            pitch={content.hero.pitch}
            githubUrl={content.githubUrl}
            onViewWalkthrough={() => setActiveSection('walkthrough')}
          />
        </div>

        <PortfolioPrivacyToggle demoMode={demoMode} onToggle={setDemoMode} />

      <div className="flex flex-wrap gap-2">
        {walkthroughSections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveSection(section.id)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition ${
              activeSection === section.id
                ? 'border-accentBlue/30 bg-accentBlue/10 text-accentBlue'
                : 'border-border-subtle bg-white/[0.03] text-textSecondary hover:text-textPrimary'
            }`}
          >
            <section.icon className="h-3.5 w-3.5" />
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'hero' && <PortfolioMetrics items={content.metrics} />}

      {activeSection === 'hero' && (
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Achievements</p>
          <div className="grid gap-2 md:grid-cols-3">
            {content.achievements.map((item) => (
              <div key={item} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3 text-sm text-textSecondary">
                {item}
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeSection === 'walkthrough' && (
        <Card className="flex flex-col gap-4">
          <SectionHeader title="Why I built this" subtitle="A private workspace that can be shown safely in recruiter conversations." />
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-textPrimary">One system</p>
              <p className="mt-2 text-sm leading-6 text-textSecondary">Combine roadmap, AI, German, and project prep in one focused workspace.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-textPrimary">Safety first</p>
              <p className="mt-2 text-sm leading-6 text-textSecondary">Demo mode and redaction keep private data off the portfolio route.</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-4">
              <p className="text-sm font-semibold text-textPrimary">Engineering story</p>
              <p className="mt-2 text-sm leading-6 text-textSecondary">Show architecture, provider routing, and local-first state design clearly.</p>
            </div>
          </div>
        </Card>
      )}

      {activeSection === 'architecture' && <PortfolioArchitecture nodes={content.architecture} />}

      {activeSection === 'ai' && (
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">AI provider system</p>
            <h3 className="text-lg font-semibold text-textPrimary">One router, many providers</h3>
            <div className="grid gap-3 text-sm text-textSecondary">
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">Groq, OpenRouter, Ollama, LM Studio, OpenAI, Anthropic, and Gemini share one front-end contract.</div>
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">Fallbacks and stream retries keep the UX stable when one provider is down or quota-limited.</div>
              <div className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">The frontend only talks to the AI service, not to provider-specific APIs directly.</div>
            </div>
          </Card>
          <PortfolioAIDemo messages={content.aiChat} />
        </div>
      )}

      {activeSection === 'german' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">German Academy demo</p>
            <h3 className="text-lg font-semibold text-textPrimary">Lessons, speaking, listening, stories, and review</h3>
            <p className="text-sm leading-6 text-textSecondary">{content.germanDemo.summary}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="primary">{content.germanDemo.level}</Badge>
              <Badge variant="success">Safe demo only</Badge>
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Product walkthrough</p>
            <h3 className="text-lg font-semibold text-textPrimary">Show how the academy works</h3>
            <div className="grid gap-2 text-sm text-textSecondary">
              <div>1. Open the lessons and explain the locked/unlocked flow.</div>
              <div>2. Show speaking and listening practice without auto microphone start.</div>
              <div>3. Use stories and review to show learning depth.</div>
            </div>
          </Card>
        </div>
      )}

      {activeSection === 'analytics' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Career intelligence</p>
            <h3 className="text-lg font-semibold text-textPrimary">High-level placement signals</h3>
            <div className="grid gap-3 md:grid-cols-2">
              {content.analyticsDemo.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
                  <p className="text-xs text-textMuted">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-textPrimary">{item.value}</p>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Demo safety</p>
            <h3 className="text-lg font-semibold text-textPrimary">Only safe analytics on portfolio</h3>
            <p className="text-sm leading-6 text-textSecondary">No personal mood notes, applications, or private chat are exposed here. The dashboard shows only recruiter-friendly summary metrics.</p>
          </Card>
        </div>
      )}

      {activeSection === 'projects' && <PortfolioProjectShowcase projects={content.projects} />}

      {activeSection === 'tech' && (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Tech stack</p>
            <div className="flex flex-wrap gap-2">
              {content.techStack.map((item) => <Badge key={item} variant="neutral">{item}</Badge>)}
            </div>
          </Card>
          <Card className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">GitHub CTA</p>
            <a className="text-sm font-semibold text-accentBlue underline-offset-4 hover:underline" href={content.githubUrl} target="_blank" rel="noreferrer">
              {content.githubUrl}
            </a>
          </Card>
        </div>
      )}

      {activeSection === 'script' && (
        <Card className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-textMuted">Demo video script</p>
          <div className="grid gap-2 text-sm text-textSecondary">
            {content.videoScript.map((step, index) => (
              <div key={step} className="rounded-2xl border border-border-subtle bg-white/[0.03] p-3">
                <span className="font-semibold text-textPrimary">Step {index + 1}:</span> {step}
              </div>
            ))}
          </div>
        </Card>
      )}
      </div>
    </div>
  );
};
