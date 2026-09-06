import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useCareerStore } from '../app/store/useCareerStore';

export const SQLPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const sqlProgress = careerState.sqlProgress || {};
  const updateSQLTopic = useCareerStore((s) => s.updateSQLTopic);

  const [notes, setNotes] = useState("");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  const sqlTopics = [
    "SELECT basics", "WHERE filtering", "ORDER BY", "GROUP BY", "HAVING",
    "Aggregate functions", "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN",
    "Subqueries", "CTEs", "Window functions", "Ranking functions", "CASE WHEN",
    "Date functions", "String functions", "NULL handling", "Index basics", "Query optimization"
  ];

  const handleToggle = (topic: string) => {
    const current = sqlProgress[topic] || { completed: false, confidence: 3, notes: '', solvedCount: 0 };
    updateSQLTopic(topic, { completed: !current.completed });
  };

  const handleConfidence = (topic: string, val: number) => {
    updateSQLTopic(topic, { confidence: val });
  };

  const handleSaveNotes = (topic: string) => {
    updateSQLTopic(topic, { notes });
    setActiveTopic(null);
    setNotes("");
  };

  const totalCompleted = sqlTopics.filter(t => sqlProgress[t]?.completed).length;
  const progressPercent = Math.round((totalCompleted / sqlTopics.length) * 100);

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

    const colors = ['#00f0ff', '#3b82f6', '#eab308', '#a855f7'];
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
          title="🦇 Batcomputer SQL Database Matrix"
          subtitle="Track SQL query schemas, join operations, indexing checkpoints, and query optimization telemetry"
        />

        {/* Progress banner */}
        <Card className="flex flex-col gap-3 p-5 bg-black/60 border border-cyan-500/25 shadow-[0_0_12px_rgba(0,240,255,0.12)] backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.22)', background: 'rgba(8,12,18,0.85)' }}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-cyan-400 uppercase tracking-wider pl-0.5 font-mono">Database Mastery Telemetry</span>
            <span className="font-mono text-cyan-400 font-extrabold text-base">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} color="#00f0ff" />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Topics checklist */}
          <Card className="lg:col-span-2 flex flex-col gap-4 p-5 bg-black/60 border border-cyan-500/20 backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.18)', background: 'rgba(8,12,18,0.85)' }}>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block pl-0.5 border-b border-white/10 pb-2 font-mono">SQL Command Matrix Checklist</span>
            
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {sqlTopics.map((topic) => {
                const current = sqlProgress[topic] || { completed: false, confidence: 3, notes: '', solvedCount: 0 };
                return (
                  <div key={topic} className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/10 hover:border-cyan-500/30 transition-all rounded-xl">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={current.completed}
                          onChange={() => handleToggle(topic)}
                          className="w-4 h-4 rounded border-cyan-500/40 bg-bgSurface text-cyan-400 focus:ring-cyan-500/30 focus:ring-1 cursor-pointer"
                        />
                        <span className={`font-bold ${current.completed ? 'text-textSecondary line-through opacity-70' : 'text-textPrimary'}`}>
                          {topic}
                        </span>
                      </div>
                      
                      {/* Confidence dots */}
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] text-textMuted mr-1 font-mono uppercase">Lvl:</span>
                        {[1, 2, 3, 4, 5].map((val) => (
                          <button
                            key={val}
                            onClick={() => handleConfidence(topic, val)}
                            className={`w-4 h-4 rounded-full text-[8px] font-bold transition-all ${
                              current.confidence >= val ? 'bg-cyan-500 text-black shadow-[0_0_6px_rgba(0,240,255,0.5)] font-black' : 'bg-bgSurface text-textMuted border border-white/10'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Notes triggering */}
                    <div className="flex justify-between items-center text-[9px] text-textMuted font-mono mt-1 border-t border-white/5 pt-2 pl-0.5">
                      <button
                        onClick={() => {
                          setActiveTopic(topic);
                          setNotes(current.notes || "");
                        }}
                        className="hover:text-cyan-400 text-[10px] font-semibold text-textSecondary transition-colors"
                      >
                        ✏️ {current.notes ? "Edit Query Note" : "Add Practice notes"}
                      </button>
                      {current.notes && <span className="truncate max-w-[200px] text-cyan-400/80">{current.notes}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Notes Dialog panel */}
          {activeTopic && (
            <Card className="flex flex-col justify-between p-5 h-[250px] bg-black/80 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)] backdrop-blur-md" style={{ border: '1px solid rgba(0,240,255,0.35)', background: 'rgba(8,12,18,0.95)' }}>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-2 pl-0.5 font-mono">Query Notes: {activeTopic}</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Log specific SQL schemas, edge cases, indexing notes..."
                  className="w-full bg-white/5 border border-white/10 text-textPrimary text-xs rounded-xl p-3 h-28 resize-none focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSaveNotes(activeTopic)} className="flex-1 text-xs py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold shadow-[0_0_10px_rgba(0,240,255,0.4)]">Save Query Note</Button>
                <Button onClick={() => setActiveTopic(null)} variant="ghost" className="px-4 text-xs border border-white/10 hover:bg-white/5 rounded-xl text-textSecondary">Cancel</Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
