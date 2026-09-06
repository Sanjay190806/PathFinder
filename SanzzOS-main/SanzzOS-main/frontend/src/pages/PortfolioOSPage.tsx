import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { PortfolioReadinessScore } from '../components/portfolio/PortfolioReadinessScore';
import { PortfolioPrivacyWarning } from '../components/portfolio/PortfolioPrivacyWarning';
import { PortfolioVisibilityPanel } from '../components/portfolio/PortfolioVisibilityPanel';
import { PublicPortfolioPreview } from '../components/portfolio/PublicPortfolioPreview';
import { CaseStudyBuilder } from '../components/portfolio/CaseStudyBuilder';
import { RecruiterSummaryBuilder } from '../components/portfolio/RecruiterSummaryBuilder';
import { GitHubOSPanel } from '../components/portfolio/GitHubOSPanel';
import { LinkedInDraftBuilder } from '../components/portfolio/LinkedInDraftBuilder';
import { Eye, ShieldAlert, Sparkles, FolderLock, Bot } from 'lucide-react';

type TabType = 'summaries' | 'case_studies' | 'github_os' | 'linkedin' | 'visibility' | 'preview';

export const PortfolioOSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('summaries');
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
    <div className="flex flex-col gap-6 fade-in pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="⚡ Stark JARVIS Executive Portfolio Command"
          subtitle="Structure Stark-grade project case studies, audit GitHub clean code telemetry, draft LinkedIn executive updates, and verify public armor visibility."
        />

        {/* Tabs list */}
        <div className="flex flex-wrap bg-black/70 border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.15)] rounded-2xl p-1 text-xs font-black uppercase tracking-wider self-start select-none backdrop-blur-md" style={{ background: 'rgba(10,15,22,0.85)' }}>
          <button
            onClick={() => setActiveTab('summaries')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'summaries' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <Bot className="h-4 w-4" />
            <span>Recruiter Bio</span>
          </button>
          <button
            onClick={() => setActiveTab('case_studies')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'case_studies' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Case Studies</span>
          </button>
          <button
            onClick={() => setActiveTab('github_os')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'github_os' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <FolderLock className="h-4 w-4" />
            <span>GitHub OS</span>
          </button>
          <button
            onClick={() => setActiveTab('linkedin')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'linkedin' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>LinkedIn Assist</span>
          </button>
          <button
            onClick={() => setActiveTab('visibility')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'visibility' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Privacy Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl transition font-mono ${
              activeTab === 'preview' ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'text-textSecondary hover:bg-white/5 hover:text-white'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>Standalone Preview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left main workspace */}
          <div className="lg:col-span-2 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
            {activeTab === 'summaries' && <RecruiterSummaryBuilder />}
            {activeTab === 'case_studies' && <CaseStudyBuilder />}
            {activeTab === 'github_os' && <GitHubOSPanel />}
            {activeTab === 'linkedin' && <LinkedInDraftBuilder />}
            {activeTab === 'visibility' && <PortfolioVisibilityPanel />}
            {activeTab === 'preview' && <PublicPortfolioPreview />}
          </div>

          {/* Right sidebar metrics */}
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-black/60 border border-cyan-500/30 rounded-2xl shadow-[0_0_15px_rgba(0,240,255,0.1)] backdrop-blur-md">
              <PortfolioReadinessScore />
            </div>
            <div className="p-4 bg-black/60 border border-red-500/30 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.1)] backdrop-blur-md">
              <PortfolioPrivacyWarning />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PortfolioOSPage;
