import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ApplicationStatusBoard } from '../components/placement/ApplicationStatusBoard';
import { CompanyCard } from '../components/placement/CompanyCard';
import { CompanyDetailPanel } from '../components/placement/CompanyDetailPanel';
import { InterviewTimeline } from '../components/placement/InterviewTimeline';
import { OATracker } from '../components/placement/OATracker';
import { PlacementCalendarIntelligence } from '../components/placement/PlacementCalendarIntelligence';
import { PlacementReadinessCard } from '../components/placement/PlacementReadinessCard';
import { ResumeChecklist } from '../components/placement/ResumeChecklist';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { Card } from '../components/ui/Card';
import { usePlacementOS } from '../hooks/usePlacementOS';

export const PlacementOSPage: React.FC = () => {
  const { state, readiness, updateStatus, toggleChecklist } = usePlacementOS();
  const [selectedCompanyId, setSelectedCompanyId] = useState(state.companies[0]?.id || null);
  const selectedCompany = useMemo(() => state.companies.find((company) => company.id === selectedCompanyId) || null, [selectedCompanyId, state.companies]);
  const selectedApplication = state.applications.find((app) => app.companyId === selectedCompanyId);
  const selectedStatus = selectedApplication?.status || 'not_started';
  const selectedOaRecords = state.oaRecords.filter((record) => record.companyId === selectedCompanyId);
  const selectedInterviews = state.interviews.filter((round) => round.companyId === selectedCompanyId);
  
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

    const colors = ['#3B82F6', '#06B6D4', '#EAB308', '#A855F7', '#DC2626'];
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
            style={{ background: 'linear-gradient(135deg, #fff 40%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            🌊 Slayer Corps Placement OS
          </h1>
          <p className="mt-2 max-w-3xl text-xs text-textSecondary leading-relaxed">
            Track target companies, application status, OA/interview logs, and execution milestones.
          </p>
        </div>

        {/* Coach Card */}
        <Card className="flex flex-wrap items-center justify-between gap-4 p-5"
          style={{ border: '1px solid rgba(59,130,246,0.18)', background: 'rgba(5,10,30,0.85)' }}>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Shayla Placement Coach</h3>
            <p className="mt-1.5 text-xs text-textSecondary leading-relaxed max-w-2xl">
              Evaluate and score your interview readiness, weak topics, and active pipelines.
            </p>
          </div>
          <ShaylaPromptButton
            prompt={`Shayla, review my Placement OS. Overall readiness: ${readiness.score}%, resume: ${readiness.resumeScore}%, company prep: ${readiness.companyPrepScore}%, interviews: ${readiness.interviewScore}%, OA: ${readiness.oaScore}%. Next action shown: ${readiness.nextAction}. Give me a short German-English plan without inventing progress.`}
            variant="secondary"
            className="text-xs h-9 bg-blue-950/40 border border-blue-500/25 hover:border-blue-500/50 text-blue-400"
          >
            Ask Shayla Coach
          </ShaylaPromptButton>
        </Card>

        {/* Readiness and Details */}
        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(6,182,212,0.05))' }}>
            <PlacementReadinessCard readiness={readiness} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(249,115,22,0.05))' }}>
            <CompanyDetailPanel
              company={selectedCompany}
              status={selectedStatus}
              application={selectedApplication}
              oaRecords={selectedOaRecords}
              interviews={selectedInterviews}
              onStatusChange={(status) => selectedCompanyId && updateStatus(selectedCompanyId, status)}
            />
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.04))' }}>
          <PlacementCalendarIntelligence
            applications={state.applications}
            interviews={state.interviews}
            oaRecords={state.oaRecords}
            companies={state.companies}
            readiness={readiness}
          />
        </div>

        {/* Company Cards Grid */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">🏢</span>
          <span className="text-[10px] font-black uppercase tracking-wider text-white/50 font-mono">Target Company Pipeline</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {state.companies.map((company) => (
            <div key={company.id} className="transition transform hover:scale-[1.01] duration-200">
              <CompanyCard
                company={company}
                status={state.applications.find((app) => app.companyId === company.id)?.status || 'not_started'}
                onSelect={() => setSelectedCompanyId(company.id)}
              />
            </div>
          ))}
        </div>

        {/* Status Board */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(0,0,0,0.5))' }}>
          <ApplicationStatusBoard applications={state.applications} companies={state.companies} onStatusChange={updateStatus} />
        </div>

        {/* Timeline, OA and Resume checklists */}
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <InterviewTimeline interviews={state.interviews} companies={state.companies} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <OATracker records={state.oaRecords} companies={state.companies} />
          </div>
          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <ResumeChecklist checklist={state.resumeChecklist} onToggle={toggleChecklist} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default PlacementOSPage;
