import React, { useMemo, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import { DSAProblemIntelligencePanel } from '../components/dsa/DSAProblemIntelligencePanel';
import { useCareerStore } from '../app/store/useCareerStore';
import { getTotalLCSolved } from '../utils/xpUtils';
import { ROADMAP } from '../data/roadmap';
import {
  DSA_PATTERNS,
  normalizePatternName,
  getPatternMastery
} from '../utils/dsaPatternUtils';

type Mastery = 'Not Started' | 'Learning' | 'Practicing' | 'Strong' | 'Interview Ready';

export const DSATrackerPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const dsaPatternMastery = careerState.dsaPatternMastery || {};
  const problemLogs = careerState.problemLogs || {};
  const updateDSAPatternMastery = useCareerStore((s) => s.updateDSAPatternMastery);
  const updateProblemLog = useCareerStore((s) => s.updateProblemLog);

  const lcSolved = getTotalLCSolved(careerState);
  
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

    const colors = ['#dc2626', '#3b82f6', '#06b6d4', '#eab308', '#a855f7'];
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

  // Group all roadmap problems into our 23 defined primary patterns
  const patternStats = useMemo(() => {
    const stats = new Map<string, {
      pattern: string;
      totalCount: number;
      solvedCount: number;
      lowConfidenceCount: number;
      revisionQueueCount: number;
      topics: Set<string>;
      items: Array<{ day: number; index: number; topic: string; title: string; log?: typeof problemLogs[string] }>;
    }>();

    DSA_PATTERNS.forEach((p) => {
      stats.set(p, {
        pattern: p,
        totalCount: 0,
        solvedCount: 0,
        lowConfidenceCount: 0,
        revisionQueueCount: 0,
        topics: new Set<string>(),
        items: []
      });
    });

    stats.set('Uncategorized', {
      pattern: 'Uncategorized',
      totalCount: 0,
      solvedCount: 0,
      lowConfidenceCount: 0,
      revisionQueueCount: 0,
      topics: new Set<string>(),
      items: []
    });

    Array.from({ length: 180 }, (_, index) => index + 1).forEach((day) => {
      const problems = ROADMAP[String(day)] || [];
      problems.forEach((problem, problemIdx) => {
        const rawPattern = problem.pattern || 'General';
        const pattern = normalizePatternName(rawPattern);
        
        const current = stats.get(pattern) || stats.get('Uncategorized')!;
        const log = problemLogs[`d_${day}_${problemIdx}`];
        
        current.totalCount += 1;
        current.topics.add(problem.topic);
        current.items.push({ day, index: problemIdx, topic: problem.topic, title: problem.title, log });
        
        if (log?.solved) current.solvedCount += 1;
        if ((log?.confidence || 0) <= 2 && log?.solved) current.lowConfidenceCount += 1;
        if (log?.revisitFlag) current.revisionQueueCount += 1;
        
        stats.set(pattern, current);
      });
    });

    return Array.from(stats.values())
      .filter((entry) => entry.totalCount > 0 || entry.pattern !== 'Uncategorized')
      .sort((a, b) => a.pattern.localeCompare(b.pattern))
      .map((entry) => ({
        ...entry,
        topics: Array.from(entry.topics)
      }));
  }, [problemLogs]);

  const handleMasteryChange = (pattern: string, val: Mastery) => {
    updateDSAPatternMastery(pattern, { mastery: val });
  };

  const handleAddToRevision = (pattern: string, items: Array<{ day: number; index: number }>) => {
    items.forEach(({ day, index }) => {
      const key = `d_${day}_${index}`;
      updateProblemLog(key, { revisitFlag: true });
    });
    alert(`All problems under pattern "${pattern}" matching revision status have been added to your queue.`);
  };

  const handleRedoSoon = (items: Array<{ day: number; index: number }>, reason: string) => {
    items.forEach(({ day, index }) => {
      const key = `d_${day}_${index}`;
      const current = problemLogs[key];
      const note = current?.notes || '';
      updateProblemLog(key, {
        revisitFlag: true,
        notes: note.includes(reason) ? note : `${note}${note ? '\n' : ''}${reason}: scheduled by DSA intelligence.`
      });
    });
  };

  const handleResetPattern = (pattern: string) => {
    if (confirm(`Reset progress tracking statistics for pattern "${pattern}"?`)) {
      updateDSAPatternMastery(pattern, { mastery: 'Not Started', confidenceSum: 0, confidenceCount: 0 });
    }
  };

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        {/* Header */}
        <SectionHeader
          title={
            <span style={{ background: 'linear-gradient(135deg, #fff 40%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🕷️ Spider-Verse DSA Patterns Track
            </span>
          }
          subtitle="Visualize pattern mastery, confidence indices, and active revision counts across the 23 primary DSA templates."
        />

        {/* Global Stats Summary Banner */}
        <Card className="grid gap-4 border-white/5 bg-black/60 p-5 md:grid-cols-3"
          style={{ border: '1px solid rgba(220,38,38,0.18)', background: 'rgba(20,0,5,0.85)' }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Curriculum Solved</p>
            <h3 className="mt-1 text-sm font-semibold text-textPrimary">{lcSolved} Problems completed</h3>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Pattern Count</p>
            <p className="mt-1 text-xl font-bold text-textPrimary">{patternStats.length} DSA Categories</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Average Confidence</p>
            <p className="mt-1 text-xl font-bold text-textPrimary">
              {patternStats.length > 0
                ? (patternStats.reduce((sum, entry) => {
                    const mastery = dsaPatternMastery[entry.pattern];
                    const avg = mastery?.confidenceCount ? mastery.confidenceSum / mastery.confidenceCount : 0;
                    return sum + (avg || 0);
                  }, 0) / patternStats.length).toFixed(1)
                : '0.0'} / 5.0
            </p>
          </div>
        </Card>

        <DSAProblemIntelligencePanel patterns={patternStats} onRedoSoon={handleRedoSoon} />

        {/* Grid display */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {patternStats.map((entry) => {
            const current = dsaPatternMastery[entry.pattern] || {};
            const confidenceCount = current.confidenceCount || 0;
            const confidenceSum = current.confidenceSum || 0;
            const avgConfidence = confidenceCount > 0 ? (confidenceSum / confidenceCount) : 0;
            
            const computedMastery = getPatternMastery({
              solvedCount: entry.solvedCount,
              totalCount: entry.totalCount,
              confidenceAverage: avgConfidence
            }) as Mastery;

            const activeMastery = (current.mastery as Mastery) || computedMastery;
            const progress = entry.totalCount ? Math.round((entry.solvedCount / entry.totalCount) * 100) : 0;
            const confidenceText = avgConfidence > 0 ? avgConfidence.toFixed(1) : '0.0';

            return (
              <Card key={entry.pattern} className="flex flex-col gap-4 p-5 hover:border-red-500/20 transition"
                style={{ border: '1px solid rgba(220,38,38,0.1)', background: 'rgba(5,0,0,0.45)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-textMuted font-mono">{entry.pattern}</p>
                    <h3 className="mt-1 text-base font-bold text-textPrimary">Solved: {entry.solvedCount} / {entry.totalCount}</h3>
                  </div>
                  <Badge variant={activeMastery === 'Interview Ready' ? 'success' : activeMastery === 'Strong' ? 'primary' : 'neutral'}>
                    {activeMastery}
                  </Badge>
                </div>

                <ProgressBar value={progress} color="#dc2626" />

                <div className="grid grid-cols-2 gap-2 text-xs text-textSecondary">
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                    <p className="text-[8px] font-black uppercase tracking-wider text-textMuted font-mono">Confidence</p>
                    <p className="mt-0.5 text-xs font-bold text-textPrimary">{confidenceText}/5</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                    <p className="text-[8px] font-black uppercase tracking-wider text-textMuted font-mono">Revision Queue</p>
                    <p className="mt-0.5 text-xs font-bold text-textPrimary">{entry.revisionQueueCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                    <p className="text-[8px] font-black uppercase tracking-wider text-textMuted font-mono">Low Confidence</p>
                    <p className="mt-0.5 text-xs font-bold text-textPrimary">{entry.lowConfidenceCount}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.02] p-2">
                    <p className="text-[8px] font-black uppercase tracking-wider text-textMuted font-mono">Topic Groups</p>
                    <p className="mt-0.5 text-xs font-bold text-textPrimary">{entry.topics.length}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-[8px] font-black uppercase tracking-wider text-textMuted font-mono">Syllabus Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {entry.topics.slice(0, 3).map((topic) => (
                      <Badge key={topic} variant="neutral" className="text-[8px] bg-white/5">{topic}</Badge>
                    ))}
                    {entry.topics.length > 3 && <Badge variant="neutral" className="text-[8px] bg-white/5">+{entry.topics.length - 3} more</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2 border-t border-white/5">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleMasteryChange(entry.pattern, 'Practicing')} className="text-[9px] h-7 px-1 rounded-lg">
                    Mark Practiced
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={() => handleMasteryChange(entry.pattern, 'Strong')} className="text-[9px] h-7 px-1 rounded-lg bg-red-950/20 text-red-400 border border-red-500/30">
                    Mark Strong
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddToRevision(entry.pattern, entry.items)} className="text-[9px] h-7 px-1 rounded-lg">
                    Add Revision
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleResetPattern(entry.pattern)} className="text-[9px] h-7 px-1 rounded-lg">
                    Reset Progress
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
export default DSATrackerPage;
