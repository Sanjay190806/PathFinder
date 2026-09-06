import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCareerStore } from '../app/store/useCareerStore';
import { useRoadmapStore } from '../app/store/useRoadmapStore';
import { RoadmapFilters } from '../components/roadmap/RoadmapFilters';
import { RoadmapDayCard } from '../components/roadmap/RoadmapDayCard';
import { ProblemDrawer } from '../components/roadmap/ProblemDrawer';
import { RoadmapProgressSummary } from '../components/roadmap/RoadmapProgressSummary';
import { ROADMAP } from '../data/roadmap';
import { RoadmapProblem } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TOTAL_DAYS } from '../data/constants';

export const RoadmapPage: React.FC = () => {
  const userProfile = useCareerStore((s) => s.userProfile);
  const problemLogs = useCareerStore((s) => s.problemLogs);

  // Filters State
  const searchQuery = useRoadmapStore((s) => s.searchQuery);
  const selectedTopic = useRoadmapStore((s) => s.selectedTopic);
  const selectedDifficulty = useRoadmapStore((s) => s.selectedDifficulty);
  const selectedStatus = useRoadmapStore((s) => s.selectedStatus);

  // Drawer Toggles
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProb, setActiveProb] = useState<{ problem: RoadmapProblem; day: number; index: number } | null>(null);

  // Pagination limit
  const [visibleDaysCount, setVisibleDaysCount] = useState(30);
  
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

  // Memoize Filtered roadmap mapping
  const filteredTimeline = useMemo(() => {
    const matchedDays: { day: number; problems: RoadmapProblem[] }[] = [];

    // Solve status helper cache set
    const solvedKeys = new Set(
      Object.keys(problemLogs).filter(k => problemLogs[k]?.solved)
    );

    Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1).forEach((dayNum) => {
      const problems = ROADMAP[String(dayNum)] || [];

      const matchedProblems = problems.filter((p, idx) => {
        const logKey = `d_${dayNum}_${idx}`;
        const isSolved = solvedKeys.has(logKey);

        const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.pattern.toLowerCase().includes(searchQuery.toLowerCase());
        const matchTopic = !selectedTopic || p.topic === selectedTopic;
        const matchDiff = !selectedDifficulty || p.difficulty === selectedDifficulty;
        const matchStatus = selectedStatus === 'all' || (selectedStatus === 'solved' ? isSolved : !isSolved);

        return matchSearch && matchTopic && matchDiff && matchStatus;
      });

      if (matchedProblems.length > 0) {
        matchedDays.push({ day: dayNum, problems: matchedProblems });
      }
    });

    // Sort by day key index
    return matchedDays.sort((a, b) => a.day - b.day);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, problemLogs]);

  const handleProblemClick = (problem: RoadmapProblem, day: number, index: number) => {
    setActiveProb({ problem, day, index });
    setDrawerOpen(true);
  };

  const handleLoadMore = () => {
    setVisibleDaysCount((prev) => Math.min(prev + 30, 180));
  };

  const handleShowAll = () => {
    setVisibleDaysCount(180);
  };

  useEffect(() => {
    setVisibleDaysCount(30);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus]);

  const visibleTimeline = filteredTimeline.slice(0, visibleDaysCount);
  const hasMore = filteredTimeline.length > visibleDaysCount;
  const activeFilterLabel = [
    selectedTopic || 'All Topics',
    selectedDifficulty || 'All Difficulties',
    selectedStatus === 'all' ? 'All Statuses' : selectedStatus === 'solved' ? 'Solved Only' : 'Unsolved Only'
  ].join(' • ');

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight"
              style={{ background: 'linear-gradient(135deg, #fff 40%, #dc2626 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🕷️ Spider-Verse DSA Curriculum
            </h1>
            <p className="mt-2 max-w-3xl text-xs text-textSecondary leading-relaxed">
              Master the full 180-day pattern curriculum. Sort, search, and track solved progress.
            </p>
          </div>
        </div>

        {/* Stats card */}
        <Card className="grid gap-4 border-white/5 bg-black/60 p-4 md:grid-cols-4"
          style={{ border: '1px solid rgba(220,38,38,0.18)', background: 'rgba(20,0,5,0.85)' }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Roadmap Curriculum</p>
            <h3 className="mt-1 text-sm font-semibold text-textPrimary">All 180 days, 360 problems</h3>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Total Days</p>
            <p className="mt-1 text-xl font-bold text-textPrimary">180 Days</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Patterns Listed</p>
            <p className="mt-1 text-xl font-bold text-textPrimary">360 Problems</p>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-textMuted font-mono">Active Filter</p>
            <p className="mt-1 text-[10px] font-mono text-textSecondary truncate">{activeFilterLabel}</p>
          </div>
        </Card>

        {/* progress bars */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(0,0,0,0.5))' }}>
          <RoadmapProgressSummary />
        </div>

        {/* filters */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <RoadmapFilters />
        </div>

        {/* pagination info */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-[10px] font-mono text-textSecondary uppercase">
            Showing {Math.min(visibleDaysCount, filteredTimeline.length)} of {filteredTimeline.length} matching days
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleShowAll} className="text-[10px] h-8 rounded-xl">
              Show All Days
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setVisibleDaysCount(30)} className="text-[10px] h-8 rounded-xl">
              Show First 30
            </Button>
          </div>
        </div>

        {/* Grid of roadmap days */}
        {visibleTimeline.length === 0 ? (
          <div className="glass-card p-12 text-center text-xs text-textSecondary">
            No days or problems matched your search filters. Try adjusting your query parameters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visibleTimeline.map((item) => (
              <div key={item.day} className="transition transform hover:scale-[1.01] duration-200">
                <RoadmapDayCard
                  day={item.day}
                  startDate={userProfile.startDate}
                  problems={item.problems}
                  onProblemClick={(prob, index) => handleProblemClick(prob, item.day, index)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Load More Trigger */}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Button type="button" onClick={handleLoadMore} variant="outline" className="w-full max-w-xs rounded-xl text-xs py-2 h-10">
              Load More Days ({Math.min(visibleDaysCount, filteredTimeline.length)}/{filteredTimeline.length})
            </Button>
          </div>
        )}

        {/* Side Problem details drawer */}
        {activeProb && (
          <ProblemDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            problem={activeProb.problem}
            day={activeProb.day}
            problemIndex={activeProb.index}
          />
        )}
      </div>
    </div>
  );
};
export default RoadmapPage;
