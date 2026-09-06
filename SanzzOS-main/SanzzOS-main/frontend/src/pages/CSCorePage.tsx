import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useCareerStore } from '../app/store/useCareerStore';
import { CS_SUBJECTS, CSSubject } from '../data/csSubjects';
import { BookOpenText, CalendarDays, CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

type TopicState = {
  completed: boolean;
  confidence: number;
  notes: string;
  interviewReady: boolean;
  lastRevisedAt: string | null;
  sampleQuestion: string;
};

export const CSCorePage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const csCoreProgress = careerState.csCoreProgress || {};
  const updateCSCoreTopic = useCareerStore((s) => s.updateCSCoreTopic);
  const [activeSubject, setActiveSubject] = useState<CSSubject['id']>('dbms');

  const activeSubjectData = CS_SUBJECTS.find((subject) => subject.id === activeSubject) || CS_SUBJECTS[0];
  const activeProgress = csCoreProgress[activeSubject] || {};

  const subjectSummary = useMemo(() => {
    return CS_SUBJECTS.map((subject) => {
      const progress = csCoreProgress[subject.id] || {};
      const completed = subject.topics.filter((topic) => progress[topic.name]?.completed).length;
      return {
        ...subject,
        completed,
        total: subject.topics.length,
        pct: Math.round((completed / subject.topics.length) * 100)
      };
    });
  }, [csCoreProgress]);

  const updateTopic = (subjectId: string, topicName: string, patch: Partial<TopicState>) => {
    updateCSCoreTopic(subjectId, topicName, patch);
  };

  const markRevisedToday = (subjectId: string, topicName: string) => {
    updateTopic(subjectId, topicName, { lastRevisedAt: new Date().toISOString() });
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

    const colors = ['#eab308', '#a855f7', '#ec4899', '#3b82f6'];
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
    <div className="fade-in flex flex-col gap-6 pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />

      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title="⚡ Tokyo Revengers CS Core Command"
          subtitle="Conquer DBMS, Operating Systems, Computer Networks, and OOP with high-octane revision and interview readiness tracking"
        />

        <Card className="grid gap-4 p-5 bg-black/60 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] backdrop-blur-md md:grid-cols-4" style={{ border: '1px solid rgba(168,85,247,0.25)', background: 'rgba(15,10,22,0.85)' }}>
          {subjectSummary.map((subject) => (
            <div key={subject.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">{subject.name}</p>
              <p className="mt-1 text-2xl font-black text-white font-mono">{subject.completed}/{subject.total}</p>
              <ProgressBar value={subject.pct} color="#a855f7" className="mt-3" />
            </div>
          ))}
        </Card>

        <div className="flex flex-wrap gap-2">
          {CS_SUBJECTS.map((subject) => (
            <button
              key={subject.id}
              type="button"
              onClick={() => setActiveSubject(subject.id)}
              className={`rounded-2xl border px-5 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                activeSubject === subject.id
                  ? 'border-purple-500/50 bg-purple-500/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)] scale-[1.02]'
                  : 'border-white/10 bg-black/40 text-textSecondary hover:text-white hover:bg-white/5'
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <Card className="p-4 bg-black/60 border border-yellow-500/30 shadow-[0_0_12px_rgba(234,179,8,0.15)] backdrop-blur-md" style={{ border: '1px solid rgba(234,179,8,0.22)', background: 'rgba(15,10,22,0.85)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-yellow-500/80 font-mono">Active Command Division</p>
              <h3 className="mt-1 text-lg font-black text-white">{activeSubjectData.name}</h3>
            </div>
            <Badge variant="primary">
              <BookOpenText className="mr-1 h-3.5 w-3.5" />
              {activeSubjectData.topics.length} Gang Targets
            </Badge>
          </div>
        </Card>

        <div className="grid gap-4">
          {activeSubjectData.topics.map((topic) => {
            const current: TopicState = activeProgress[topic.name] || {
              completed: false,
              confidence: 3,
              notes: '',
              interviewReady: false,
              lastRevisedAt: null,
              sampleQuestion: topic.sampleQuestion
            };

            return (
              <Card key={topic.name} className="flex flex-col gap-4 p-5 bg-black/60 border border-white/10 hover:border-purple-500/40 transition-all backdrop-blur-md" style={{ border: '1px solid rgba(168,85,247,0.18)', background: 'rgba(15,10,22,0.85)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="min-w-0">
                    <h4 className={`text-base font-extrabold ${current.completed ? 'text-textSecondary line-through opacity-70' : 'text-white'}`}>
                      {topic.name}
                    </h4>
                    <p className="mt-1 text-xs text-purple-300/80 font-mono">⚡ {topic.sampleQuestion}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={current.interviewReady ? 'success' : 'neutral'}>
                      {current.interviewReady ? '⚡ Interview Ready' : 'In Training'}
                    </Badge>
                    <Badge variant={current.completed ? 'primary' : 'neutral'}>
                      {current.completed ? '✓ Conquered' : 'Pending'}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-4">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/5 transition-all">
                      <input
                        type="checkbox"
                        checked={current.completed}
                        onChange={() => updateTopic(activeSubjectData.id, topic.name, { completed: !current.completed })}
                        className="h-4 w-4 rounded border-purple-500/40 bg-bgSurface text-purple-500 focus:ring-purple-500/30"
                      />
                      <span className="text-xs font-bold text-white">Mark Module Conquered</span>
                    </label>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">Gang Mastery Level</span>
                        <span className="text-sm font-black text-yellow-400 font-mono">{current.confidence}/5</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={current.confidence}
                        onChange={(e) => updateTopic(activeSubjectData.id, topic.name, { confidence: Number(e.target.value) })}
                        className="w-full accent-purple-500 cursor-pointer"
                      />
                      <div className="mt-3 flex justify-between text-[10px] text-textMuted font-mono font-bold">
                        <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 flex flex-col justify-between">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">Last Revised</span>
                        <span className="text-xs text-textSecondary font-mono">
                          {current.lastRevisedAt ? new Date(current.lastRevisedAt).toLocaleDateString() : 'Not revised yet'}
                        </span>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => markRevisedToday(activeSubjectData.id, topic.name)} className="text-xs border-purple-500/40 text-purple-300 hover:bg-purple-500/20">
                        <CalendarDays className="mr-2 h-4 w-4" />
                        Log Today's Revision
                      </Button>
                    </div>

                    <label className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">Command Notes / Pitfalls</span>
                      <textarea
                        value={current.notes}
                        onChange={(e) => updateTopic(activeSubjectData.id, topic.name, { notes: e.target.value })}
                        placeholder="Add interview notes, pitfalls, examples, and quick reminders..."
                        className="min-h-20 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-textPrimary placeholder:text-textMuted focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-textSecondary flex items-center gap-1.5 font-medium text-[11px]">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Ready: <strong className="text-white">{current.interviewReady ? 'Yes' : 'No'}</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-textSecondary flex items-center gap-1.5 font-medium text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                      Lvl: <strong className="text-white">{current.confidence}/5</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-textSecondary flex items-center gap-1.5 font-medium text-[11px]">
                      <FileText className="h-3.5 w-3.5 text-yellow-400" />
                      Sample Question Locked
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant={current.interviewReady ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => updateTopic(activeSubjectData.id, topic.name, { interviewReady: !current.interviewReady })}
                    className="text-xs font-bold"
                  >
                    {current.interviewReady ? 'Unset Ready' : 'Mark Interview Ready'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
