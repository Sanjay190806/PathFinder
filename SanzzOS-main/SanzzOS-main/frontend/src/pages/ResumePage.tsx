import React, { useMemo, useState, useEffect, useRef } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { ShaylaPromptButton } from '../components/ai/ShaylaPromptButton';
import { ResumeScoreCard } from '../components/resume/ResumeScoreCard';
import { ResumeChecklist } from '../components/resume/ResumeChecklist';
import { ResumeVersions } from '../components/resume/ResumeVersions';
import { ResumeKeywordPanel } from '../components/resume/ResumeKeywordPanel';
import { ResumeStudioTabs, ResumeStudioTab } from '../components/resume/ResumeStudioTabs';
import { ResumeBuilderPanel } from '../components/resume/ResumeBuilderPanel';
import { JobDescriptionAnalyzer } from '../components/resume/JobDescriptionAnalyzer';
import { BulletLab } from '../components/resume/BulletLab';
import { ATSKeywordMatcher } from '../components/resume/ATSKeywordMatcher';
import { RecruiterSimulation } from '../components/resume/RecruiterSimulation';
import { ResumeInterviewQuestions } from '../components/resume/ResumeInterviewQuestions';
import { ResumeScoreHistory } from '../components/resume/ResumeScoreHistory';
import { ResumeVersionCompare } from '../components/resume/ResumeVersionCompare';
import { ResumeSuggestionPreview } from '../components/resume/ResumeSuggestionPreview';
import { ResumeSuggestionConfirmation } from '../components/resume/ResumeSuggestionConfirmation';
import { StrictATSAnalyzer } from '../components/resume/StrictATSAnalyzer';
import { ATSAnalyzerPage } from '../components/resume/ATSAnalyzerPage';
import { useCareerStore } from '../app/store/useCareerStore';
import { useResumeStudioStore } from '../app/store/useResumeStudioStore';
import { buildResumeStudioContext, createTailoredVersionFromAnalysis } from '../utils/resumeStudioUtils';

export const ResumePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ResumeStudioTab>('overview');
  const careerState = useCareerStore((s) => s);
  const resumeStore = useResumeStudioStore((s) => s);
  const createTailoredVersion = useResumeStudioStore((s) => s.createTailoredVersion);

  const studioContext = useMemo(
    () => buildResumeStudioContext(careerState, resumeStore.selectedResumeVersion, resumeStore.lastJobDescription),
    [careerState, resumeStore.selectedResumeVersion, resumeStore.lastJobDescription]
  );

  const latestAnalysis = resumeStore.jobAnalyses[0] || null;
  const suggestions = latestAnalysis?.recommendations || studioContext.versionNotes;

  const handleConfirmTailor = () => {
    if (!latestAnalysis) return;
    createTailoredVersion(createTailoredVersionFromAnalysis(studioContext, latestAnalysis));
  };

  const content = useMemo(() => {
    switch (activeTab) {
      case 'builder':
        return <ResumeBuilderPanel />;
      case 'tailor':
        return (
          <div className="grid gap-6">
            <JobDescriptionAnalyzer />
            <Card className="flex flex-wrap gap-3 border-accentPurple/20 bg-accentPurple/5 p-4">
              <ShaylaPromptButton prompt={`Improve this bullet using my resume context. Selected version: ${resumeStore.selectedResumeVersion}. Job description summary: ${resumeStore.lastJobDescription || 'none'}.`}>
                Ask Shayla to improve this bullet
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Review my resume strictly but fairly. Selected version: ${resumeStore.selectedResumeVersion}. Missing keywords: ${studioContext.missingKeywords.join(', ') || 'none'}.`}>
                Ask Shayla to review this resume
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Tailor my resume for ${studioContext.currentTargetCompany || 'Zoho'} using my current resume and job description summary. Keep it placement-focused and truthful.`}>
                Ask Shayla to tailor for Zoho
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Generate interview questions from my resume. Selected version: ${resumeStore.selectedResumeVersion}. Target role: ${studioContext.currentTargetRole}.`}>
                Ask Shayla to generate interview questions
              </ShaylaPromptButton>
              <ShaylaPromptButton prompt={`Tell me the single highest-impact thing I should fix first in my resume. Be honest and specific.`}>
                Ask Shayla what to fix first
              </ShaylaPromptButton>
            </Card>
            <ResumeSuggestionPreview title="Tailor suggestions" items={suggestions} />
            <ResumeSuggestionConfirmation
              summary="Review the suggestions above, then confirm when you are ready to create a tailored version. Nothing is overwritten automatically."
              onConfirm={handleConfirmTailor}
              onCancel={() => setActiveTab('overview')}
            />
          </div>
        );
      case 'ats_analyzer':
        return <ATSAnalyzerPage />;
      case 'ats_strict':
        return <StrictATSAnalyzer />;
      case 'bullet':
        return <BulletLab />;
      case 'keywords':
        return (
          <div className="grid gap-6">
            <ATSKeywordMatcher />
            <ResumeKeywordPanel />
          </div>
        );
      case 'recruiter':
        return <RecruiterSimulation />;
      case 'interview':
        return <ResumeInterviewQuestions />;
      case 'versions':
        return <ResumeVersionCompare />;
      case 'history':
        return <ResumeScoreHistory />;
      case 'overview':
      default:
        return (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col gap-6">
              <ResumeScoreCard />
              <ResumeChecklist />
              <ResumeVersions />
            </div>
            <div className="flex flex-col gap-6">
              <ResumeVersionCompare />
              <ResumeScoreHistory />
            </div>
          </div>
        );
    }
  }, [activeTab, latestAnalysis, studioContext, suggestions]);

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

    const colors = ['#00f0ff', '#eab308', '#a855f7', '#3b82f6'];
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
          title="🦇 Gotham ATS Intelligence Matrix"
          subtitle="Analyze job descriptions, optimize high-impact bullet points, tailor resume variants, and monitor ATS match telemetry"
        />

        <Card className="flex flex-wrap items-center justify-between gap-3 p-5 bg-black/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.3)', background: 'rgba(10,12,18,0.9)' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-400 font-mono">BATCOMPUTER / Shayla AI Mentor</p>
            <h3 className="mt-1 text-base font-black text-white">Executive ATS Readiness Verification</h3>
          </div>
          <ShaylaPromptButton
            prompt={`Review my resume readiness using current tracker context. Selected version: ${resumeStore.selectedResumeVersion}. ATS score: ${studioContext.atsScore}%. Current target company: ${studioContext.currentTargetCompany}. Missing keywords: ${studioContext.missingKeywords.join(', ') || 'none'}.`}
          >
            ⚡ Inspect Resume Telemetry
          </ShaylaPromptButton>
        </Card>

        <ResumeStudioTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
          {content}
        </div>
      </div>
    </div>
  );
};
