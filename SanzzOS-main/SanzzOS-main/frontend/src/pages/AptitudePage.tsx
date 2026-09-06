import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Input } from '../components/ui/Input';
import { useCareerStore } from '../app/store/useCareerStore';

export const AptitudePage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const aptitudeProgress = careerState.aptitudeProgress || {};
  const updateAptitudeCategory = useCareerStore((s) => s.updateAptitudeCategory);

  const [questions, setQuestions] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const aptCategories = [
    "Number System", "Percentages", "Profit and Loss", "Simple Interest", "Compound Interest",
    "Ratio and Proportion", "Time and Work", "Time, Speed and Distance", "Averages", "Mixtures",
    "Permutations and Combinations", "Probability", "Data Interpretation", "Logical Reasoning",
    "Blood Relations", "Direction Sense", "Coding-Decoding", "Syllogism", "Puzzles", "Verbal Ability"
  ];

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

    const colors = ['#EAB308', '#3B82F6', '#A855F7', '#DC2626', '#22C55E'];
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

  const handleSolvedChange = (cat: string, val: number) => {
    const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
    updateAptitudeCategory(cat, { questionsSolved: Math.max(0, current.questionsSolved + val) });
  };

  const handleToggleCompleted = (cat: string) => {
    const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
    updateAptitudeCategory(cat, { completed: !current.completed });
  };

  const handleSaveAccuracy = (cat: string) => {
    updateAptitudeCategory(cat, { accuracy: questions });
    setActiveCategory(null);
    setQuestions(0);
  };

  const totalCompleted = aptCategories.filter(c => aptitudeProgress[c]?.completed).length;
  const progressPercent = Math.round((totalCompleted / aptCategories.length) * 100);

  return (
    <div className="workspace-page flex flex-col gap-6 pb-12 md:pb-8 relative overflow-hidden select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title={
            <span style={{ background: 'linear-gradient(135deg, #fff 40%, #eab308 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🧮 Gotham Aptitude Practice Board
            </span>
          }
          subtitle="Track questions solved, correct/wrong percentages, and category completeness."
        />

        {/* Progress banner */}
        <Card className="flex flex-col gap-3 p-5"
          style={{ border: '1px solid rgba(234,179,8,0.18)', background: 'rgba(15,10,0,0.85)' }}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-textSecondary uppercase tracking-wider pl-0.5">Syllabus Completion</span>
            <span className="font-mono text-yellow-400 font-bold">{progressPercent}%</span>
          </div>
          <ProgressBar value={progressPercent} color="#eab308" />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories panel */}
          <Card className="lg:col-span-2 flex flex-col gap-4 p-5 bg-black/60">
            <span className="text-[10px] font-black text-textSecondary uppercase tracking-widest block pl-0.5 border-b border-white/5 pb-2">Aptitude Categories</span>
            
            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {aptCategories.map((cat) => {
                const current = aptitudeProgress[cat] || { questionsSolved: 0, accuracy: 100, confidence: 3, completed: false, notes: '' };
                return (
                  <div key={cat} className="flex flex-col gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-yellow-500/20 transition">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={current.completed}
                          onChange={() => handleToggleCompleted(cat)}
                          className="w-4 h-4 rounded border-white/10 bg-black text-yellow-500 focus:ring-0 cursor-pointer"
                        />
                        <span className={`font-bold text-xs ${current.completed ? 'text-textMuted line-through' : 'text-textPrimary'}`}>
                          {cat}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => handleSolvedChange(cat, -5)} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-bold text-[9px] hover:text-white">-5</button>
                        <span className="font-mono font-bold text-textPrimary text-[10px]">{current.questionsSolved} solved</span>
                        <button onClick={() => handleSolvedChange(cat, 5)} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded font-bold text-[9px] hover:text-white">+5</button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-textMuted font-mono mt-1 border-t border-white/5 pt-2 pl-0.5">
                      <button
                        onClick={() => {
                          setActiveCategory(cat);
                          setQuestions(current.accuracy || 100);
                        }}
                        className="hover:text-yellow-400 text-[9px] font-bold"
                      >
                        🎯 Accuracy: {current.accuracy}% (Edit)
                      </button>
                      {current.notes && <span className="truncate max-w-[200px]">{current.notes}</span>}
                    </div>

                    {activeCategory === cat && (
                      <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl border border-yellow-500/20 bg-yellow-950/20">
                        <span className="text-[10px] font-bold text-yellow-400 uppercase font-mono">Accuracy %:</span>
                        <Input
                          type="number"
                          value={questions}
                          onChange={(e) => setQuestions(Number(e.target.value))}
                          className="w-16 h-8 text-center text-xs"
                        />
                        <Button size="sm" onClick={() => handleSaveAccuracy(cat)} className="h-8 text-[10px] bg-yellow-600 text-black font-bold uppercase rounded-lg">Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setActiveCategory(null)} className="h-8 text-[10px] rounded-lg">Cancel</Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <Card className="p-4 border-white/5 bg-black/60 flex flex-col gap-3">
              <h4 className="text-xs font-black text-textPrimary uppercase tracking-wider border-b border-white/5 pb-2">Topic distribution</h4>
              <p className="text-[10px] text-textSecondary leading-relaxed">
                Aim to solve at least 30 questions per category to ensure optimal preparation for company placement tests.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AptitudePage;
