import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useCareerStore } from '../app/store/useCareerStore';
import { useAchievements } from '../hooks/useAchievements';
import { achievementService } from '../services/achievementService';
import { AchievementCategoryTabs } from '../components/achievements/AchievementCategoryTabs';
import { AchievementGrid } from '../components/achievements/AchievementGrid';
import { AchievementProgressStrip } from '../components/achievements/AchievementProgressStrip';
import { AchievementUnlockModal } from '../components/achievements/AchievementUnlockModal';
import { AchievementCategory } from '../types/achievements';

export const AchievementsPage: React.FC = () => {
  const careerState = useCareerStore((s) => s);
  const { achievements, claimReward, unlockedIds, claimedIds } = useAchievements();
  
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const [activeUnlockId, setActiveUnlockId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync and check for new achievements when opening page
  useEffect(() => {
    achievementService.evaluateAll(careerState);
  }, [careerState]);

  // Listen for real-time achievement unlock event triggers
  useEffect(() => {
    const handleUnlocked = (e: Event) => {
      const customEvent = e as CustomEvent<{ id: string; title: string }>;
      setActiveUnlockId(customEvent.detail.id);
    };

    window.addEventListener('achievement_unlocked', handleUnlocked);
    return () => window.removeEventListener('achievement_unlocked', handleUnlocked);
  }, []);

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

    const colors = ['#dc2626', '#3b82f6', '#eab308', '#a855f7', '#22c55e'];
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

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  return (
    <div className="flex flex-col gap-6 fade-in pb-10 select-none relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60" />
      
      <div className="relative z-10 flex flex-col gap-6 w-full">
        <SectionHeader
          title={
            <span style={{ background: 'linear-gradient(135deg, #fff 40%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              🏆 Quests &amp; Achievements Board
            </span>
          }
          subtitle="Track unlocked badges, milestones, and experience level bonuses."
        />

        {/* Stats progress Strip */}
        <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(0,0,0,0.5))' }}>
          <AchievementProgressStrip />
        </div>

        {/* Filter categories tabs */}
        <AchievementCategoryTabs
          activeCategory={activeCategory}
          onChangeCategory={setActiveCategory}
        />

        {/* Grid displaying active collection */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center pl-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-textMuted font-mono">
              Unlocked Badges Grid ({filteredAchievements.filter(a => unlockedIds.includes(a.id)).length} / {filteredAchievements.length})
            </span>
          </div>

          <div className="rounded-3xl overflow-hidden p-0.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <AchievementGrid
              achievements={filteredAchievements}
              onClaim={claimReward}
              unlockedIds={unlockedIds}
              claimedIds={claimedIds}
            />
          </div>
        </div>

        {/* Unlock alert modal popup */}
        <AchievementUnlockModal
          unlockedId={activeUnlockId}
          onClose={() => setActiveUnlockId(null)}
          onClaim={claimReward}
        />
      </div>
    </div>
  );
};
export default AchievementsPage;
