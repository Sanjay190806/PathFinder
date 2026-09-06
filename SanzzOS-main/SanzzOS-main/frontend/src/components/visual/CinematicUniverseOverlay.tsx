import React, { useState, useEffect, useRef, useMemo } from 'react';

export type CinematicUniverse = 'spider-verse' | 'batman' | 'joker' | 'anime';

interface UniverseConfig {
  id: CinematicUniverse;
  name: string;
  icon: string;
  subtitle: string;
  color: string;
  borderColor: string;
  bgGlow: string;
}

const UNIVERSES: UniverseConfig[] = [
  {
    id: 'spider-verse',
    name: 'Multi-Verse Glitch Protocol',
    icon: '🕷️',
    subtitle: 'SPIDER-VERSE MATRIX ACTIVE',
    color: 'text-pink-400',
    borderColor: 'border-pink-500/60 shadow-[0_0_25px_rgba(236,72,153,0.4)]',
    bgGlow: 'from-pink-600/15 via-cyan-500/10 to-transparent'
  },
  {
    id: 'batman',
    name: 'Batcomputer Command Deck',
    icon: '🦇',
    subtitle: 'WAYNE CORP SONAR TELEMETRY',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-500/60 shadow-[0_0_25px_rgba(234,179,8,0.4)]',
    bgGlow: 'from-yellow-600/15 via-blue-600/10 to-transparent'
  },
  {
    id: 'joker',
    name: 'Arkham Chaos Division',
    icon: '🃏',
    subtitle: 'WHY SO SERIOUS? // LAUGHTER GAS',
    color: 'text-green-400',
    borderColor: 'border-green-500/60 shadow-[0_0_25px_rgba(34,197,94,0.4)]',
    bgGlow: 'from-green-600/20 via-purple-600/15 to-transparent'
  },
  {
    id: 'anime',
    name: 'Domain Expansion Matrix',
    icon: '⚡',
    subtitle: 'NARUTO • DEMON SLAYER • JJK • TOKYO GHOUL',
    color: 'text-red-400',
    borderColor: 'border-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.4)]',
    bgGlow: 'from-red-600/20 via-purple-600/15 to-transparent'
  }
];

export const CinematicUniverseOverlay: React.FC = () => {
  const [activeUniverse, setActiveUniverse] = useState<CinematicUniverse>(() => {
    const randomIndex = Math.floor(Math.random() * UNIVERSES.length);
    return UNIVERSES[randomIndex].id;
  });

  const [isMinimized, setIsMinimized] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-cinematic-theme', activeUniverse);
    window.dispatchEvent(new CustomEvent('cinematic-theme-changed', { detail: activeUniverse }));
  }, [activeUniverse]);

  useEffect(() => {
    const handleRandomize = () => {
      const currentIndex = UNIVERSES.findIndex((u) => u.id === activeUniverse);
      let nextIndex = Math.floor(Math.random() * UNIVERSES.length);
      while (nextIndex === currentIndex && UNIVERSES.length > 1) {
        nextIndex = Math.floor(Math.random() * UNIVERSES.length);
      }
      setActiveUniverse(UNIVERSES[nextIndex].id);
    };

    window.addEventListener('randomize-cinematic-theme', handleRandomize);
    return () => window.removeEventListener('randomize-cinematic-theme', handleRandomize);
  }, [activeUniverse]);

  const currentTheme = useMemo(() => {
    return UNIVERSES.find((u) => u.id === activeUniverse) || UNIVERSES[0];
  }, [activeUniverse]);

  // 🚀 60FPS CINEMATIC CANVAS ENGINE
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Particle/Object definitions per universe
    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; color: string; alpha: number;
      text?: string; angle?: number; spin?: number;
      life?: number; maxLife?: number;
    }

    const particles: Particle[] = [];
    const slashes: { x1: number; y1: number; x2: number; y2: number; alpha: number; color: string; width: number }[] = [];
    let radarAngle = 0;

    // Initialize universe-specific particles
    if (activeUniverse === 'spider-verse') {
      const colors = ['#ec4899', '#00f0ff', '#a855f7', '#ffffff'];
      const symbols = ['🕷️', '🕸️', '⚡', 'マ', 'ス', 'グ', 'リ'];
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 3 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.6 + 0.2,
          text: Math.random() > 0.6 ? symbols[Math.floor(Math.random() * symbols.length)] : undefined,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.05
        });
      }
    } else if (activeUniverse === 'batman') {
      const colors = ['#00f0ff', '#10b981', '#eab308'];
      for (let i = 0; i < 45; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: 0, vy: Math.random() * 3 + 1.5, // Telemetry rain
          size: Math.random() * 2 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.5 + 0.1,
          text: Math.random() > 0.4 ? String.fromCharCode(0x30A0 + Math.random() * 96) : undefined
        });
      }
    } else if (activeUniverse === 'joker') {
      const symbols = ['🃏', '♦️', '♠️', '♥️', '♣️', 'HAHA', 'WHY SO SERIOUS?', '🤡', 'HAHAHA'];
      const colors = ['#22c55e', '#a855f7', '#ec4899', '#eab308'];
      for (let i = 0; i < 30; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 1.5) * 1.5, // Float upwards
          size: Math.random() * 14 + 10,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.7 + 0.2,
          text: symbols[Math.floor(Math.random() * symbols.length)],
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.04
        });
      }
    } else if (activeUniverse === 'anime') {
      const symbols = ['領域展開', '鬼殺隊', '九尾', '卍', '炎', '⚡', '⚔️', '🔥'];
      const colors = ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#ffffff'];
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - 0.5) * 2.5, vy: (Math.random() - 2) * 2, // Embers rising fast
          size: Math.random() * 4 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: Math.random() * 0.8 + 0.2,
          text: Math.random() > 0.7 ? symbols[Math.floor(Math.random() * symbols.length)] : undefined,
          angle: 0, spin: 0
        });
      }
    }

    let frameCount = 0;

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      frameCount++;

      // --- 1. SPIDER-VERSE RENDER ---
      if (activeUniverse === 'spider-verse') {
        // Draw connecting cyber webs between close particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.strokeStyle = (i % 2 === 0) ? 'rgba(236, 72, 153, 0.25)' : 'rgba(0, 240, 255, 0.25)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // --- 2. BATMAN SONAR SWEEP RENDER ---
      if (activeUniverse === 'batman') {
        radarAngle += 0.015;
        const cx = w / 2; const cy = h / 2; const radius = Math.max(w, h) * 0.6;
        
        // Rotating radar line
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(radarAngle);
        const grad = ctx.createLinearGradient(0, 0, radius, 0);
        grad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        grad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(radius, 0); ctx.stroke();
        ctx.restore();

        // Target reticles bounding boxes
        ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
        ctx.lineWidth = 1.5;
        const targets = [{x: w*0.2, y: h*0.3}, {x: w*0.8, y: h*0.25}, {x: w*0.7, y: h*0.75}, {x: w*0.3, y: h*0.8}];
        targets.forEach(t => {
          ctx.strokeRect(t.x - 20, t.y - 20, 40, 40);
          ctx.beginPath(); ctx.moveTo(t.x - 5, t.y); ctx.lineTo(t.x + 5, t.y); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(t.x, t.y - 5); ctx.lineTo(t.x, t.y + 5); ctx.stroke();
        });
      }

      // --- 3. ANIME HIGH-SPEED KATANA SLASHES ---
      if (activeUniverse === 'anime') {
        // Randomly trigger dramatic sword slashes
        if (Math.random() < 0.04) {
          const x1 = Math.random() * w; const y1 = Math.random() * h;
          slashes.push({
            x1, y1,
            x2: x1 + (Math.random() - 0.5) * 800,
            y2: y1 + (Math.random() - 0.5) * 800,
            alpha: 1,
            color: Math.random() > 0.5 ? '#ef4444' : '#ffffff',
            width: Math.random() * 3 + 2
          });
        }
        // Render slashes
        for (let i = slashes.length - 1; i >= 0; i--) {
          const s = slashes[i];
          ctx.save();
          ctx.globalAlpha = s.alpha;
          
          // Draw outer thick neon glow trail
          ctx.strokeStyle = s.color;
          ctx.lineWidth = s.width * 2.5;
          ctx.globalAlpha = s.alpha * 0.4;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          
          // Draw inner solid white core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = s.width;
          ctx.globalAlpha = s.alpha;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
          
          ctx.restore();
          s.alpha -= 0.04;
          if (s.alpha <= 0) slashes.splice(i, 1);
        }
      }

      // --- 4. UNIVERSAL PARTICLE RENDERER ---
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.angle !== undefined && p.spin !== undefined) p.angle += p.spin;

        // Wrap around boundaries
        if (p.x < -50) p.x = w + 50; if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50; if (p.y > h + 50) p.y = -50;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;

        if (p.text) {
          ctx.translate(p.x, p.y);
          if (p.angle) ctx.rotate(p.angle);
          ctx.font = `bold ${p.size * 2}px font-mono, sans-serif`;
          ctx.fillText(p.text, 0, 0);
        } else {
          // Draw outer glow circle first (very low opacity)
          ctx.beginPath();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.alpha * 0.3;
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Draw inner solid circle
          ctx.beginPath();
          ctx.globalAlpha = p.alpha;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, [activeUniverse]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* Background Ambient Gradient Core */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${currentTheme.bgGlow} opacity-80 transition-all duration-1000`} />
      
      {/* 🎬 60FPS CINEMATIC CANVAS LAYER */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

      {/* 🚀 MOVED TO BOTTOM-LEFT TO NEVER OVERLAP WITH BOTTOM-RIGHT BUTTONS! */}
      <div className="absolute bottom-6 left-[270px] max-lg:left-6 max-md:bottom-24 z-50 pointer-events-auto transition-all duration-500">
        {isMinimized ? (
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className={`flex items-center justify-center w-12 h-12 bg-black/90 backdrop-blur-xl border rounded-full transition-all duration-300 hover:scale-110 shadow-2xl ${currentTheme.borderColor}`}
            title="Expand Universe Theme Switcher"
          >
            <span className="text-xl animate-pulse">{currentTheme.icon}</span>
          </button>
        ) : (
          <div className={`flex items-center gap-3 bg-black/90 backdrop-blur-xl border px-4.5 py-2.5 rounded-2xl transition-all duration-500 hover:scale-102 shadow-2xl ${currentTheme.borderColor}`}>
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.dispatchEvent(new CustomEvent('randomize-cinematic-theme'))}
              title="Click to randomly Re-roll Universe Theme!"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">{currentTheme.icon}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`text-xs font-black uppercase tracking-wider font-mono ${currentTheme.color}`}>
                    {currentTheme.name}
                  </span>
                  <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded font-mono text-white/90 font-bold animate-pulse">RANDOMIZED</span>
                </div>
                <span className="text-[9px] text-textMuted uppercase font-mono tracking-widest group-hover:text-white transition-colors">
                  {currentTheme.subtitle} • Click to Re-roll
                </span>
              </div>
            </div>

            {/* Minimize / Hide Button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              className="ml-1 p-1 rounded-lg hover:bg-white/10 text-textMuted hover:text-white transition-colors"
              title="Minimize Badge"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CinematicUniverseOverlay;
