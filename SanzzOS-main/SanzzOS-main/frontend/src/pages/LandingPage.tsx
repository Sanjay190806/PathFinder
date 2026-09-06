import React, { useEffect, useRef, useState } from 'react';
import { 
  Flame, BadgeCheck, Bot, Languages, Code2, TrendingUp, 
  FileText, CalendarClock, ShieldCheck, 
  Cpu, Sparkles, ArrowRight, Zap
} from 'lucide-react';
import { navigateToPath } from '../utils/navigation';
import { Card } from '../components/ui/Card';
import { useCareerStore } from '../app/store/useCareerStore';
import { getAnimeRankInfo } from '../utils/animeLevelUtils';

// ─────────────────────────────────────────────────────────────────────
// Hero/Villain Quote Marquee Data
// ─────────────────────────────────────────────────────────────────────
const MARQUEE_QUOTES = [
  '🕷️ "With great code comes great responsibility." — Spider-Man',
  '🦇 "It\'s not who I am underneath, but what I commit that defines me." — Batman',
  '🃏 "Why so serious? It\'s just a compile error." — The Joker',
  '🍥 "I\'m gonna be the Hokage of developers!" — Naruto',
  '🔥 "Set your heart ablaze — debug until dawn." — Rengoku',
  '📓 "The task written in the Dev Note shall be executed." — Ryuk\'s Rule',
  '🕷️ "The suit doesn\'t make the hero. The commits do." — Miles Morales',
  '🦇 "Why do we fall? So we learn to fix the bug next time." — Alfred',
  '🃏 "Introduce a little chaos into your code." — The Joker',
  '🍃 "If you don\'t like your destiny, don\'t accept it. Debug it." — Naruto',
];

type LaunchUniverseId = 'spiderVerse' | 'batcomputer' | 'arkhamChaos' | 'animeDomain';

type LaunchUniverse = {
  id: LaunchUniverseId;
  label: string;
  eyebrow: string;
  tagline: string;
  consolePrefix: string;
  primary: string;
  secondary: string;
  tertiary: string;
  glow: string;
  titleGradient: string;
  buttonGradient: string;
  selectionBg: string;
  canvasColors: string[];
  logs: (level: number, xp: number, anime: ReturnType<typeof getAnimeRankInfo>) => string[];
};

const LAUNCH_UNIVERSES: LaunchUniverse[] = [
  {
    id: 'spiderVerse',
    label: 'Multi-Verse Glitch',
    eyebrow: 'Spider-Verse launch signature',
    tagline: 'Dimensional panels, web lines, comic halftone pulses, and chromatic portal glitches.',
    consolePrefix: 'SPIDER-VERSE',
    primary: '#ef4444',
    secondary: '#3b82f6',
    tertiary: '#facc15',
    glow: 'rgba(239,68,68,0.38)',
    titleGradient: 'linear-gradient(120deg, #ffffff 8%, #ef4444 26%, #38bdf8 46%, #ffffff 56%, #facc15 74%, #ef4444 94%)',
    buttonGradient: 'linear-gradient(115deg, #dc2626, #2563eb 48%, #0f172a)',
    selectionBg: 'rgba(37,99,235,0.42)',
    canvasColors: ['#ef4444', '#3b82f6', '#facc15', '#ffffff'],
    logs: (level, xp) => [
      'Dimensional collider warming up...',
      `Spider-Sense route lock: Level ${level} / ${xp} XP`,
      'Comic panel shader online. Web trajectory calibrated.',
      'Multiverse glitch lanes stable. Launch window open.',
    ],
  },
  {
    id: 'batcomputer',
    label: 'Batcomputer Command Deck',
    eyebrow: 'Gotham tactical boot sequence',
    tagline: 'Radar sweeps, command-grid rain, forensic scanlines, and disciplined tactical glow.',
    consolePrefix: 'BATCOMPUTER',
    primary: '#facc15',
    secondary: '#60a5fa',
    tertiary: '#94a3b8',
    glow: 'rgba(250,204,21,0.32)',
    titleGradient: 'linear-gradient(120deg, #ffffff 10%, #facc15 35%, #94a3b8 56%, #60a5fa 78%, #ffffff 94%)',
    buttonGradient: 'linear-gradient(115deg, #a16207, #111827 46%, #1d4ed8)',
    selectionBg: 'rgba(250,204,21,0.36)',
    canvasColors: ['#facc15', '#60a5fa', '#94a3b8', '#111827'],
    logs: (level, xp, anime) => [
      'Gotham command deck waking up...',
      `Tactical profile: Level ${level} / ${xp} XP`,
      `Discipline index mapped to ${anime.narutoRank}`,
      'Radar sweep complete. Portal authorization granted.',
    ],
  },
  {
    id: 'arkhamChaos',
    label: 'Arkham Chaos Division',
    eyebrow: 'Joker-grade controlled instability',
    tagline: 'Glitch cards, green-violet fractures, unstable scan bursts, and chaotic launch energy.',
    consolePrefix: 'ARKHAM',
    primary: '#a855f7',
    secondary: '#22c55e',
    tertiary: '#f43f5e',
    glow: 'rgba(168,85,247,0.36)',
    titleGradient: 'linear-gradient(120deg, #ffffff 8%, #a855f7 30%, #22c55e 49%, #f43f5e 67%, #ffffff 92%)',
    buttonGradient: 'linear-gradient(115deg, #7e22ce, #16a34a 48%, #111827)',
    selectionBg: 'rgba(168,85,247,0.38)',
    canvasColors: ['#a855f7', '#22c55e', '#f43f5e', '#ffffff'],
    logs: (_level, xp, anime) => [
      'Chaos variable injected into launch core...',
      `Wildcard XP loaded: ${xp}`,
      `Breathing style corrupted into ${anime.demonSlayerBreathing.split(':')[0]}`,
      'Arkham division says: beautifully unstable, ready to ship.',
    ],
  },
  {
    id: 'animeDomain',
    label: 'Anime Domain Expansion',
    eyebrow: 'Shinobi, slayer, note, street, and ghoul domain',
    tagline: 'Chakra rings, breathing waves, gothic note flashes, neon street trails, and crimson ghoul arcs.',
    consolePrefix: 'DOMAIN',
    primary: '#fb923c',
    secondary: '#38bdf8',
    tertiary: '#ef4444',
    glow: 'rgba(251,146,60,0.34)',
    titleGradient: 'linear-gradient(120deg, #ffffff 7%, #fb923c 23%, #38bdf8 43%, #ef4444 62%, #a855f7 80%, #ffffff 96%)',
    buttonGradient: 'linear-gradient(115deg, #ea580c, #0284c7 38%, #991b1b 72%, #581c87)',
    selectionBg: 'rgba(251,146,60,0.36)',
    canvasColors: ['#fb923c', '#38bdf8', '#ef4444', '#a855f7', '#ffffff'],
    logs: (level, xp, anime) => [
      `Domain expansion syncing: ${anime.narutoRank}`,
      `Slayer style loaded: ${anime.demonSlayerBreathing.split(':')[0]}`,
      `Street momentum: Level ${level} / ${xp} XP`,
      'Notebook rules sealed. Ghoul-red arcs armed. Portal ready.',
    ],
  },
];

export const CinematicSetPieces: React.FC<{ universe: LaunchUniverse }> = ({ universe }) => {
  if (universe.id === 'spiderVerse') {
    return (
      <div className="setpiece-layer spider-set">
        <svg className="web-corner web-corner-left" viewBox="0 0 360 360" aria-hidden="true">
          <path d="M0 0 L360 0 L0 360 Z" fill="rgba(10,12,24,0.25)" />
          {[35, 70, 110, 155, 210, 275].map((r) => (
            <path key={r} d={`M0 ${r} Q${r * 0.85} ${r * 0.25} ${r} 0`} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.55" />
          ))}
          {[18, 38, 60, 86, 118, 152, 190, 234, 282, 330].map((p) => (
            <line key={p} x1="0" y1="0" x2={p} y2="360" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
          ))}
        </svg>
        <div className="web-shot web-shot-a" />
        <div className="web-shot web-shot-b" />
        <div className="swing-line" />
        <div className="spider-silhouette">
          <span className="spider-head" />
          <span className="spider-body" />
          <span className="spider-arm spider-arm-left" />
          <span className="spider-arm spider-arm-right" />
          <span className="spider-leg spider-leg-left" />
          <span className="spider-leg spider-leg-right" />
        </div>
        <div className="comic-panel comic-panel-red">WEB ROUTE</div>
        <div className="comic-panel comic-panel-blue">GLITCH JUMP</div>
      </div>
    );
  }

  if (universe.id === 'batcomputer') {
    return (
      <div className="setpiece-layer bat-set">
        <div className="batcomputer-console">
          <div className="console-title">BATCOMPUTER</div>
          <div className="console-grid">
            <span>GADGETS</span>
            <span>FORENSICS</span>
            <span>VEHICLE</span>
            <span>ROUTE</span>
          </div>
          <div className="radar-sweep-mini" />
        </div>
        <svg className="batmobile-silhouette" viewBox="0 0 520 160" aria-hidden="true">
          <path d="M26 105 C58 56 116 48 166 66 L214 34 L257 71 L339 57 C410 45 462 64 503 104 L490 128 L33 130 Z" fill="currentColor" opacity="0.72" />
          <path d="M80 75 L36 20 L178 64 Z M363 60 L489 16 L444 78 Z" fill="currentColor" opacity="0.9" />
          <circle cx="128" cy="127" r="28" fill="#030712" stroke="currentColor" strokeWidth="8" />
          <circle cx="394" cy="127" r="28" fill="#030712" stroke="currentColor" strokeWidth="8" />
          <path d="M211 75 L257 52 L309 76" fill="none" stroke="#60a5fa" strokeWidth="4" opacity="0.8" />
        </svg>
        <div className="gadget batarang-gadget">⌁</div>
        <div className="gadget grapnel-gadget">⌖</div>
        <div className="gotham-skyline" />
      </div>
    );
  }

  if (universe.id === 'arkhamChaos') {
    return (
      <div className="setpiece-layer joker-set">
        <div className="joker-dialogue dialogue-one">WHY SO SERIOUS? DEBUG IT.</div>
        <div className="joker-dialogue dialogue-two">HAHA... SHIP THE CHAOS</div>
        <div className="card-stack">
          <div className="joker-card card-a">J</div>
          <div className="joker-card card-b">♣</div>
          <div className="joker-card card-c">♦</div>
        </div>
        <div className="joker-mask">
          <span className="mask-eye left" />
          <span className="mask-eye right" />
          <span className="mask-smile" />
        </div>
        <div className="chaos-scribble">HAHAHAHA</div>
      </div>
    );
  }

  return (
    <div className="setpiece-layer anime-set">
      <div className="anime-character shinobi-character">
        <span className="headband" />
        <span className="character-head" />
        <span className="character-body" />
        <span className="kunai" />
        <span className="character-label">SHINOBI</span>
      </div>
      <div className="anime-character slayer-character">
        <span className="character-head" />
        <span className="character-body" />
        <span className="slayer-blade" />
        <span className="breathing-flame" />
        <span className="character-label">SLAYER</span>
      </div>
      <div className="death-note-prop">
        <span>DEATH NOTE</span>
        <small>Rule written. Mission locked.</small>
      </div>
      <div className="street-ghoul-prop">
        <span className="bike-light" />
        <span className="ghoul-mask" />
        <small>TOKYO NIGHT OPS</small>
      </div>
    </div>
  );
};

const CinematicDirectorOverlay: React.FC<{ universe: LaunchUniverse; level: number; xp: number }> = ({ universe, level, xp }) => {
  const sequence = universe.id === 'spiderVerse'
    ? ['WEB LOCK', 'CANON EVENT', 'DIMENSION JUMP']
    : universe.id === 'batcomputer'
      ? ['GOTHAM MAP', 'GADGET ARMORY', 'PURSUIT READY']
      : universe.id === 'arkhamChaos'
        ? ['CHAOS CUT', 'WILD CARD', 'LAUGH TRACK']
        : ['DOMAIN SEAL', 'BREATHING FORM', 'NIGHT RAID'];

  return (
    <div className="director-layer" aria-hidden="true">
      <div className="letterbox letterbox-top">
        <span>SCENE 01</span>
        <span>{universe.label}</span>
        <span>LIVE RENDER</span>
      </div>
      <div className="letterbox letterbox-bottom">
        <span>RANK {level}</span>
        <span>{xp} XP</span>
        <span>REFRESH RANDOMIZES UNIVERSE</span>
      </div>

      <div className="camera-vignette" />
      <div className="film-grain" />
      <div className="spotlight spotlight-left" />
      <div className="spotlight spotlight-right" />

      <div className="director-panel">
        <span className="record-dot" />
        <span>UNIVERSE LOCKED</span>
        <strong>{universe.consolePrefix}</strong>
      </div>

      <div className="launch-countdown">
        <span>03</span>
        <span>02</span>
        <span>01</span>
      </div>

      <div className="scene-chip-rail">
        {sequence.map((item, index) => (
          <span key={item} className="scene-chip" style={{ animationDelay: `${index * 0.35}s` }}>
            {item}
          </span>
        ))}
      </div>

      <div className="energy-fragments">
        {Array.from({ length: 16 }).map((_, index) => (
          <span
            key={index}
            style={{
              left: `${6 + ((index * 17) % 88)}%`,
              top: `${12 + ((index * 23) % 62)}%`,
              animationDelay: `${index * 0.23}s`,
              backgroundColor: index % 3 === 0 ? universe.primary : index % 3 === 1 ? universe.secondary : universe.tertiary,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const LandingPage: React.FC = () => {
  const level = useCareerStore((s) => s.level);
  const xp = useCareerStore((s) => s.xp);
  const anime = getAnimeRankInfo(level);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeUniverse] = useState<LaunchUniverse>(() => LAUNCH_UNIVERSES[Math.floor(Math.random() * LAUNCH_UNIVERSES.length)]);
  const [terminalText, setTerminalText] = useState('Initializing career neural link...');
  const [heroVisible, setHeroVisible] = useState(false);

  const coreModules = [
    { title: 'Daily Mission', desc: 'Checklists driving placement routines.', icon: Flame, color: 'text-orange-500' },
    { title: '180-Day DSA Roadmap', desc: 'Java DSA progress maps & questions.', icon: BadgeCheck, color: 'text-emerald-400' },
    { title: 'SkillRack + Aptitude', desc: 'Speed coding counters & reasoning logs.', icon: Cpu, color: 'text-blue-400' },
    { title: 'SQL + CS Core', desc: 'DBMS, OS, networking fundamentals.', icon: Code2, color: 'text-purple-400' },
    { title: 'Resume Studio', desc: 'ATS scanner with scoring feedback.', icon: FileText, color: 'text-blue-400' },
    { title: 'Interview Coach', desc: 'Simulated technical & HR rounds.', icon: Bot, color: 'text-yellow-400' },
    { title: 'German Academy', desc: 'Fluent A1-B1 vocabulary & goals.', icon: Languages, color: 'text-emerald-400' },
    { title: 'Company Prep', desc: 'Target-specific company notes.', icon: CalendarClock, color: 'text-orange-400' },
    { title: 'Career Intelligence', desc: 'Consistency & placement metrics.', icon: TrendingUp, color: 'text-purple-400' },
    { title: 'Shayla AI Mentor', desc: 'German bestie & accountability guide.', icon: Sparkles, color: 'text-yellow-400' },
  ];

  const techStack = [
    { category: 'Frontend', items: 'React · TypeScript · Vite · Tailwind' },
    { category: 'State Management', items: 'Zustand (Persisted Local Schema)' },
    { category: 'Backend', items: 'Express · Prisma Client · Node.js' },
    { category: 'Database', items: 'PostgreSQL (Cloud & Local)' },
    { category: 'AI Routing', items: 'Groq · Ollama · OpenRouter · Gemini' },
  ];

  // ─── Startup sound ─────────────────────────────────────────────────
  const playStartupSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const playChime = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.0, start);
        gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      const now = ctx.currentTime;
      playChime(130.81, now, 1.5, 'triangle');
      playChime(261.63, now + 0.15, 1.2);
      playChime(329.63, now + 0.3, 1.0);
      playChime(392.00, now + 0.45, 0.8);
      playChime(493.88, now + 0.6, 1.2);
      playChime(587.33, now + 0.75, 1.5);
    } catch (e) {
      console.warn('Audio play blocked or failed', e);
    }
  };

  // ─── Terminal ticker ───────────────────────────────────────────────
  useEffect(() => {
    const logs = activeUniverse.logs(level, xp, anime);
    let idx = 0;
    const interval = setInterval(() => {
      setTerminalText(logs[idx]);
      idx = (idx + 1) % logs.length;
    }, 3000);
    return () => clearInterval(interval);
  }, [level, xp, anime, activeUniverse]);

  // ─── Cinematic entrance ────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // ─── Cinematic one-universe canvas engine ──────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = window.innerWidth;
    let h = window.innerHeight;
    let mouseX = w / 2;
    let mouseY = h / 2;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const colors = activeUniverse.canvasColors;

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resizeCanvas();

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];
    const onMouseMove = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', onMouseMove);

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number; pulse: number; };
    type WebStrand = { x1: number; y1: number; x2: number; y2: number; life: number; maxLife: number; color: string; bend: number; };
    type RainCode = { x: number; y: number; speed: number; text: string; alpha: number; };
    type ChaosCard = { x: number; y: number; vx: number; vy: number; symbol: string; size: number; rot: number; spin: number; color: string; };
    type DomainWave = { y: number; speed: number; amp: number; color: string; alpha: number; phase: number; };
    type PanelShard = { x: number; y: number; width: number; height: number; rot: number; color: string; alpha: number; drift: number; };

    const particleCount = prefersReducedMotion ? 34 : 88;
    const particles: Particle[] = Array.from({ length: particleCount }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.34, 0.34),
      vy: rand(-0.34, 0.34),
      size: rand(0.7, 2.4),
      color: pick(colors),
      alpha: rand(0.14, 0.72),
      pulse: rand(0, Math.PI * 2),
    }));

    const panels: PanelShard[] = Array.from({ length: 9 }, () => ({
      x: rand(-80, w + 80),
      y: rand(0, h * 0.82),
      width: rand(90, 260),
      height: rand(22, 92),
      rot: rand(-0.2, 0.2),
      color: pick(colors),
      alpha: rand(0.025, 0.09),
      drift: rand(0.15, 0.6),
    }));

    const strands: WebStrand[] = [];
    const rainCodes: RainCode[] = Array.from({ length: prefersReducedMotion ? 24 : 62 }, () => ({
      x: rand(0, w),
      y: rand(-h, h),
      speed: rand(1.8, 5.8),
      text: pick(['SYS', 'XP', 'DSA', 'AI', 'CV', 'SQL', 'OS', 'OK']),
      alpha: rand(0.08, 0.28),
    }));
    const suits = ['♦', '♣', '♠', '♥'];
    const chaosCards: ChaosCard[] = Array.from({ length: prefersReducedMotion ? 8 : 18 }, () => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.55, 0.55),
      vy: rand(-0.75, -0.18),
      symbol: pick(suits),
      size: rand(13, 34),
      rot: rand(0, Math.PI * 2),
      spin: rand(-0.035, 0.035),
      color: Math.random() > 0.5 ? activeUniverse.primary : activeUniverse.secondary,
    }));
    const domainWaves: DomainWave[] = Array.from({ length: 8 }, (_, index) => ({
      y: (h / 9) * (index + 1),
      speed: rand(0.006, 0.018),
      amp: rand(12, 42),
      color: pick(colors),
      alpha: rand(0.08, 0.2),
      phase: rand(0, Math.PI * 2),
    }));

    const spawnStrand = () => {
      const anchors = [
        { x: -40, y: rand(0, h * 0.35) },
        { x: w + 40, y: rand(0, h * 0.42) },
        { x: rand(0, w), y: -40 },
        { x: rand(0, w), y: h + 40 },
      ];
      const from = pick(anchors);
      strands.push({
        x1: from.x,
        y1: from.y,
        x2: rand(w * 0.16, w * 0.84),
        y2: rand(h * 0.1, h * 0.72),
        life: 0,
        maxLife: rand(95, 190),
        color: pick(colors),
        bend: rand(-120, 120),
      });
      if (strands.length > 18) strands.shift();
    };

    const drawGrid = (frame: number, step = 64, alpha = 0.028) => {
      ctx.save();
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      const offset = (frame * 0.18) % step;
      for (let x = -step + offset; x < w + step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = -step + offset; y < h + step; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawParticles = (frame: number, linkDistance = 104) => {
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.025;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const alpha = p.alpha * (0.65 + Math.sin(p.pulse + frame * 0.006) * 0.35);
        ctx.save();
        ctx.globalAlpha = Math.max(0.08, alpha);
        ctx.shadowBlur = 14;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < linkDistance) {
            ctx.save();
            ctx.globalAlpha = (1 - dist / linkDistance) * 0.055;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
          }
        }
      });
    };

    const drawSpiderVerse = (frame: number) => {
      drawGrid(frame, 58, 0.018);

      panels.forEach((panel, index) => {
        panel.x += panel.drift;
        if (panel.x > w + 180) panel.x = -panel.width - rand(20, 160);
        ctx.save();
        ctx.translate(panel.x, panel.y + Math.sin(frame * 0.01 + index) * 7);
        ctx.rotate(panel.rot);
        ctx.globalAlpha = panel.alpha;
        ctx.strokeStyle = panel.color;
        ctx.fillStyle = panel.color;
        ctx.lineWidth = 1.4;
        ctx.fillRect(0, 0, panel.width, panel.height);
        ctx.globalAlpha = panel.alpha * 2.4;
        ctx.strokeRect(0, 0, panel.width, panel.height);
        ctx.restore();
      });

      if (!prefersReducedMotion && frame % 24 === 0) spawnStrand();
      strands.forEach((s) => {
        s.life += 1;
        const progress = s.life / s.maxLife;
        const alpha = progress < 0.18 ? progress / 0.18 : progress > 0.76 ? (1 - progress) / 0.24 : 1;
        const cx = (s.x1 + s.x2) / 2 + s.bend + (mouseX - w / 2) * 0.04;
        const cy = (s.y1 + s.y2) / 2 + (mouseY - h / 2) * 0.04;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha) * 0.42;
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.y1);
        ctx.quadraticCurveTo(cx, cy, s.x2, s.y2);
        ctx.stroke();
        ctx.restore();
      });
      for (let y = 24; y < h; y += 36) {
        for (let x = (Math.floor(y / 36) % 2) * 18; x < w; x += 36) {
          const radius = 0.6 + Math.sin(frame * 0.035 + x * 0.02 + y * 0.02) * 0.45;
          ctx.save();
          ctx.globalAlpha = 0.05;
          ctx.fillStyle = activeUniverse.tertiary;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(0.2, radius), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
      drawParticles(frame, 118);
    };

    const drawBatcomputer = (frame: number) => {
      drawGrid(frame, 46, 0.035);
      rainCodes.forEach((drop) => {
        drop.y += drop.speed;
        if (drop.y > h + 24) {
          drop.y = rand(-220, -20);
          drop.x = rand(0, w);
        }
        ctx.save();
        ctx.globalAlpha = drop.alpha;
        ctx.fillStyle = Math.random() > 0.985 ? activeUniverse.primary : activeUniverse.secondary;
        ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
        ctx.fillText(drop.text, drop.x, drop.y);
        ctx.restore();
      });

      const cx = w * 0.5 + (mouseX - w / 2) * 0.025;
      const cy = h * 0.34 + (mouseY - h / 2) * 0.025;
      const radius = Math.min(w, h) * 0.27;
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 5; i++) {
        ctx.globalAlpha = 0.11 - i * 0.012;
        ctx.strokeStyle = i % 2 ? activeUniverse.secondary : activeUniverse.primary;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, radius * (0.35 + i * 0.17), 0, Math.PI * 2);
        ctx.stroke();
      }
      const sweep = frame * 0.018;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, 'rgba(250,204,21,0.16)');
      grad.addColorStop(1, 'rgba(250,204,21,0)');
      ctx.rotate(sweep);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, -0.16, 0.16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      drawParticles(frame, 86);
    };

    const drawArkhamChaos = (frame: number) => {
      drawGrid(frame, 72, 0.02);
      chaosCards.forEach((card) => {
        card.x += card.vx;
        card.y += card.vy;
        card.rot += card.spin;
        if (card.y < -40) {
          card.y = h + rand(20, 140);
          card.x = rand(0, w);
        }
        if (card.x < -30 || card.x > w + 30) card.vx *= -1;
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.rot + Math.sin(frame * 0.02) * 0.05);
        ctx.globalAlpha = 0.18;
        ctx.shadowBlur = 18;
        ctx.shadowColor = card.color;
        ctx.fillStyle = card.color;
        ctx.font = `${card.size}px Georgia, serif`;
        ctx.fillText(card.symbol, -card.size / 2, card.size / 2);
        ctx.restore();
      });

      if (!prefersReducedMotion && frame % 38 === 0) {
        for (let i = 0; i < 5; i++) {
          ctx.save();
          ctx.globalAlpha = rand(0.08, 0.22);
          ctx.fillStyle = pick(colors);
          ctx.fillRect(rand(0, w), rand(0, h * 0.72), rand(42, 210), rand(1, 5));
          ctx.restore();
        }
      }
      for (let i = 0; i < 7; i++) {
        ctx.save();
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = i % 2 ? activeUniverse.secondary : activeUniverse.primary;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const baseY = ((frame * (0.35 + i * 0.05)) + i * 90) % (h + 120) - 60;
        for (let x = -20; x < w + 20; x += 42) {
          const y = baseY + Math.sin(x * 0.035 + frame * 0.05 + i) * 18;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
      drawParticles(frame, 98);
    };

    const drawAnimeDomain = (frame: number) => {
      drawGrid(frame, 66, 0.019);
      const cx = w * 0.5 + Math.sin(frame * 0.009) * 24;
      const cy = h * 0.34 + Math.cos(frame * 0.012) * 18;
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 7; i++) {
        const r = 64 + i * 34 + Math.sin(frame * 0.025 + i) * 5;
        ctx.globalAlpha = 0.16 - i * 0.013;
        ctx.strokeStyle = pick(colors);
        ctx.lineWidth = i % 2 ? 1.8 : 0.85;
        ctx.beginPath();
        ctx.arc(0, 0, r, Math.sin(frame * 0.01 + i), Math.PI * 2 - Math.cos(frame * 0.011 + i));
        ctx.stroke();
      }
      ctx.restore();

      domainWaves.forEach((wave, index) => {
        wave.phase += wave.speed;
        ctx.save();
        ctx.globalAlpha = wave.alpha;
        ctx.strokeStyle = wave.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = wave.color;
        ctx.lineWidth = index % 2 ? 1.2 : 0.8;
        ctx.beginPath();
        for (let x = -20; x <= w + 20; x += 18) {
          const y = wave.y + Math.sin(x * 0.018 + wave.phase * 18 + index) * wave.amp;
          if (x === -20) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      });

      for (let i = 0; i < 6; i++) {
        const arcX = (w * (0.12 + i * 0.16) + Math.sin(frame * 0.011 + i) * 40) % w;
        const arcY = h * (0.18 + (i % 3) * 0.18);
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.strokeStyle = i % 2 ? activeUniverse.tertiary : activeUniverse.primary;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(arcX, arcY, 42 + i * 8, frame * 0.018, frame * 0.018 + Math.PI * 0.9);
        ctx.stroke();
        ctx.restore();
      }
      drawParticles(frame, 112);
    };

    let frame = 0;
    const render = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      const wash = ctx.createRadialGradient(mouseX, mouseY, 0, w / 2, h / 2, Math.max(w, h) * 0.72);
      const softGlow = activeUniverse.glow.replace(/0\.\d+\)/, '0.16)');
      wash.addColorStop(0, softGlow);
      wash.addColorStop(1, 'rgba(2,2,8,0)');
      ctx.fillStyle = wash;
      ctx.fillRect(0, 0, w, h);

      if (activeUniverse.id === 'spiderVerse') drawSpiderVerse(frame);
      if (activeUniverse.id === 'batcomputer') drawBatcomputer(frame);
      if (activeUniverse.id === 'arkhamChaos') drawArkhamChaos(frame);
      if (activeUniverse.id === 'animeDomain') drawAnimeDomain(frame);

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [activeUniverse]);

  const handleLaunch = () => {
    playStartupSound();
    setTimeout(() => navigateToPath('/dashboard'), 400);
  };

  const heroStyle = {
    '--hero-primary': activeUniverse.primary,
    '--hero-secondary': activeUniverse.secondary,
    '--hero-tertiary': activeUniverse.tertiary,
    '--hero-glow': activeUniverse.glow,
    '--hero-title-gradient': activeUniverse.titleGradient,
    '--hero-button-gradient': activeUniverse.buttonGradient,
    '--hero-selection': activeUniverse.selectionBg,
  } as React.CSSProperties;

  return (
    <div className="landing-cinematic-root min-h-screen bg-[#020208] text-white select-none overflow-x-hidden font-sans relative" style={heroStyle}>
      
      {/* One random cinematic universe is active per refresh. */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Global page animations */}
      <style>{`
        .landing-cinematic-root ::selection { background: var(--hero-selection); }
        @keyframes spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-ccw { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes hud-pulse { 
          0%, 100% { opacity: 0.24; filter: drop-shadow(0 0 8px var(--hero-glow)); transform: scale(0.985); }
          50% { opacity: 0.66; filter: drop-shadow(0 0 26px var(--hero-glow)); transform: scale(1.015); }
        }
        @keyframes scan-flash {
          0% { left: -60%; }
          100% { left: 110%; }
        }
        @keyframes title-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes color-ring {
          0% { stroke: var(--hero-primary); } 35% { stroke: var(--hero-secondary); }
          70% { stroke: var(--hero-tertiary); } 100% { stroke: var(--hero-primary); }
        }
        @keyframes hero-wipe {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          18% { opacity: 0.9; }
          52% { opacity: 0.34; }
          100% { transform: translateX(150%) skewX(-18deg); opacity: 0; }
        }
        @keyframes portal-shockwave {
          0% { transform: scale(0.68); opacity: 0; }
          18% { opacity: 0.38; }
          100% { transform: scale(1.32); opacity: 0; }
        }
        @keyframes chroma-drift {
          0%, 100% { transform: translate3d(0,0,0); text-shadow: 0 0 22px var(--hero-glow); }
          35% { transform: translate3d(1px,-1px,0); text-shadow: 2px 0 0 var(--hero-primary), -2px 0 0 var(--hero-secondary), 0 0 28px var(--hero-glow); }
          68% { transform: translate3d(-1px,1px,0); text-shadow: -2px 0 0 var(--hero-tertiary), 2px 0 0 var(--hero-secondary), 0 0 24px var(--hero-glow); }
        }
        @keyframes status-breathe {
          0%, 100% { box-shadow: 0 0 0 rgba(255,255,255,0), 0 0 18px var(--hero-glow); }
          50% { box-shadow: 0 0 0 1px color-mix(in srgb, var(--hero-primary) 42%, transparent), 0 0 32px var(--hero-glow); }
        }
        @keyframes setpiece-float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(var(--tilt, 0deg)); }
          50% { transform: translate3d(0, -16px, 0) rotate(calc(var(--tilt, 0deg) + 1.5deg)); }
        }
        @keyframes web-swing {
          0%, 100% { transform: translate(-50%, 0) rotate(-10deg); }
          50% { transform: translate(-42%, 16px) rotate(12deg); }
        }
        @keyframes web-pulse {
          0%, 100% { opacity: 0.24; transform: scaleX(0.84); }
          50% { opacity: 0.76; transform: scaleX(1); }
        }
        @keyframes batmobile-cruise {
          0%, 100% { transform: translateX(0) perspective(700px) rotateX(12deg) rotateY(-10deg); }
          50% { transform: translateX(22px) perspective(700px) rotateX(12deg) rotateY(-4deg); }
        }
        @keyframes gadget-orbit {
          from { transform: rotate(0deg) translateX(18px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(18px) rotate(-360deg); }
        }
        @keyframes card-tumble {
          0%, 100% { transform: rotateX(18deg) rotateY(-24deg) rotateZ(var(--card-rot)); }
          50% { transform: rotateX(30deg) rotateY(20deg) rotateZ(calc(var(--card-rot) + 8deg)) translateY(-12px); }
        }
        @keyframes dialogue-pop {
          0%, 100% { transform: translateY(0) rotate(var(--tilt)); opacity: 0.78; }
          45% { transform: translateY(-10px) rotate(calc(var(--tilt) * -1)); opacity: 1; }
        }
        @keyframes anime-aura {
          0%, 100% { filter: drop-shadow(0 0 12px var(--hero-glow)); transform: translateY(0) scale(1); }
          50% { filter: drop-shadow(0 0 34px var(--hero-glow)); transform: translateY(-12px) scale(1.035); }
        }
        @keyframes blade-sweep {
          0%, 100% { transform: rotate(-18deg) translateY(0); }
          50% { transform: rotate(-26deg) translateY(-10px); }
        }
        @keyframes letterbox-in {
          from { transform: translateY(var(--from)); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes record-blink {
          0%, 100% { opacity: 0.35; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes countdown-roll {
          0%, 22% { opacity: 0; transform: translateY(18px) scale(0.82); filter: blur(6px); }
          34%, 58% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          72%, 100% { opacity: 0; transform: translateY(-16px) scale(1.12); filter: blur(5px); }
        }
        @keyframes chip-scan {
          0%, 100% { border-color: rgba(255,255,255,0.12); color: rgba(255,255,255,0.42); transform: translateY(0); }
          45% { border-color: var(--hero-secondary); color: var(--hero-secondary); transform: translateY(-4px); box-shadow: 0 0 22px var(--hero-glow); }
        }
        @keyframes fragment-drift {
          0% { opacity: 0; transform: translate3d(0, 40px, 0) rotate(0deg) scale(0.4); }
          18% { opacity: 0.75; }
          100% { opacity: 0; transform: translate3d(34px, -86px, 0) rotate(220deg) scale(1); }
        }
        @keyframes spotlight-sweep {
          0%, 100% { opacity: 0.18; transform: rotate(var(--angle)) translateX(-18px); }
          50% { opacity: 0.42; transform: rotate(calc(var(--angle) + 4deg)) translateX(18px); }
        }
        @keyframes frame-jitter {
          0%, 100% { transform: translate3d(0, 0, 0); }
          20% { transform: translate3d(0.5px, -0.5px, 0); }
          45% { transform: translate3d(-0.5px, 0.5px, 0); }
          70% { transform: translate3d(0.35px, 0.25px, 0); }
        }
        .hud-ring { animation: hud-pulse 4s ease-in-out infinite; }
        .spin-cw { animation: spin-cw 22s linear infinite; }
        .spin-ccw { animation: spin-ccw 16s linear infinite; }
        .spin-slow { animation: spin-cw 35s linear infinite; }
        .marquee-track { animation: marquee 35s linear infinite; }
        .fade-up { animation: fade-up 0.9s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-2 { animation: fade-up 0.9s 0.15s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .fade-up-3 { animation: fade-up 0.9s 0.3s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .fade-up-4 { animation: fade-up 0.9s 0.45s cubic-bezier(0.16,1,0.3,1) forwards; opacity: 0; }
        .color-ring { animation: color-ring 8s linear infinite; }
        .shimmer-title {
          background: var(--hero-title-gradient);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: title-shimmer 6s linear infinite, chroma-drift 5.8s ease-in-out infinite;
        }
        .cinema-wipe { animation: hero-wipe 4.6s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .portal-shockwave { animation: portal-shockwave 3.8s cubic-bezier(0.16, 1, 0.3, 1) infinite; }
        .universe-status { animation: status-breathe 3.4s ease-in-out infinite; }
        .glass-panel {
          background: rgba(8, 8, 20, 0.72);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.06);
        }
        .director-layer {
          position: absolute;
          inset: 0;
          z-index: 8;
          pointer-events: none;
          overflow: hidden;
          animation: frame-jitter 7s steps(2, end) infinite;
        }
        .letterbox {
          position: fixed;
          left: 0;
          right: 0;
          z-index: 60;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 22px;
          background: rgba(0,0,0,0.84);
          border-color: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.42);
          font: 800 9px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          backdrop-filter: blur(12px);
        }
        .letterbox-top {
          --from: -100%;
          top: 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          animation: letterbox-in 0.9s cubic-bezier(0.16,1,0.3,1) both;
        }
        .letterbox-bottom {
          --from: 100%;
          bottom: 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          animation: letterbox-in 0.9s 0.08s cubic-bezier(0.16,1,0.3,1) both;
        }
        .camera-vignette {
          position: fixed;
          inset: 0;
          z-index: 55;
          background:
            radial-gradient(circle at 50% 42%, transparent 0 38%, rgba(0,0,0,0.28) 72%, rgba(0,0,0,0.72) 100%),
            linear-gradient(90deg, rgba(0,0,0,0.35), transparent 18%, transparent 82%, rgba(0,0,0,0.35));
          mix-blend-mode: multiply;
        }
        .film-grain {
          position: fixed;
          inset: 0;
          z-index: 56;
          opacity: 0.08;
          background-image:
            repeating-radial-gradient(circle at 17% 23%, rgba(255,255,255,0.9) 0 1px, transparent 1px 4px),
            repeating-radial-gradient(circle at 72% 61%, rgba(255,255,255,0.6) 0 1px, transparent 1px 5px);
          background-size: 180px 180px, 230px 230px;
          mix-blend-mode: screen;
        }
        .spotlight {
          position: absolute;
          top: -12vh;
          width: 44vw;
          height: 82vh;
          transform-origin: top center;
          background: linear-gradient(to bottom, color-mix(in srgb, var(--hero-primary) 24%, transparent), transparent 74%);
          clip-path: polygon(48% 0, 62% 0, 100% 100%, 0 100%);
          filter: blur(10px);
          animation: spotlight-sweep 6s ease-in-out infinite;
        }
        .spotlight-left { --angle: -14deg; left: 5vw; }
        .spotlight-right { --angle: 16deg; right: 4vw; background: linear-gradient(to bottom, color-mix(in srgb, var(--hero-secondary) 22%, transparent), transparent 76%); animation-delay: 1.4s; }
        .director-panel {
          position: absolute;
          left: 34px;
          top: 72px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 13px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(2,6,23,0.58);
          color: rgba(255,255,255,0.68);
          font: 850 9px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          box-shadow: 0 0 26px rgba(0,0,0,0.35);
        }
        .director-panel strong { color: var(--hero-secondary); }
        .record-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--hero-primary);
          box-shadow: 0 0 18px var(--hero-primary);
          animation: record-blink 1.2s ease-in-out infinite;
        }
        .launch-countdown {
          position: absolute;
          right: 42px;
          top: 78px;
          width: 76px;
          height: 76px;
          border: 1px solid color-mix(in srgb, var(--hero-primary) 44%, transparent);
          background: rgba(0,0,0,0.32);
          display: grid;
          place-items: center;
          box-shadow: 0 0 30px var(--hero-glow);
        }
        .launch-countdown span {
          grid-area: 1 / 1;
          color: var(--hero-primary);
          font: 950 28px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          text-shadow: 0 0 18px var(--hero-primary);
          animation: countdown-roll 4.8s ease-in-out infinite;
        }
        .launch-countdown span:nth-child(2) { animation-delay: 1.6s; }
        .launch-countdown span:nth-child(3) { animation-delay: 3.2s; }
        .scene-chip-rail {
          position: absolute;
          left: 50%;
          top: 68vh;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          justify-content: center;
          width: min(90vw, 760px);
        }
        .scene-chip {
          padding: 8px 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.34);
          color: rgba(255,255,255,0.42);
          font: 850 9px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          animation: chip-scan 3.2s ease-in-out infinite;
        }
        .energy-fragments span {
          position: absolute;
          width: 24px;
          height: 6px;
          opacity: 0;
          transform-origin: center;
          box-shadow: 0 0 18px currentColor;
          clip-path: polygon(12% 0, 100% 0, 86% 100%, 0 100%);
          animation: fragment-drift 4.4s linear infinite;
        }
        .setpiece-layer {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          overflow: hidden;
        }
        .setpiece-layer * { box-sizing: border-box; }
        .web-corner {
          position: absolute;
          color: rgba(255,255,255,0.52);
          filter: drop-shadow(0 0 18px rgba(59,130,246,0.45));
        }
        .web-corner-left {
          left: 0;
          top: 0;
          width: min(38vw, 520px);
          height: min(38vw, 520px);
        }
        .web-shot {
          position: absolute;
          height: 3px;
          width: 36vw;
          transform-origin: left center;
          background: repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 12px, rgba(59,130,246,0.35) 12px 20px);
          box-shadow: 0 0 18px rgba(59,130,246,0.55);
          animation: web-pulse 2.8s ease-in-out infinite;
        }
        .web-shot-a { left: 7vw; top: 26vh; transform: rotate(-13deg); }
        .web-shot-b { right: 4vw; top: 42vh; transform: rotate(164deg); animation-delay: 1.1s; }
        .swing-line {
          position: absolute;
          left: 72%;
          top: 0;
          height: 42vh;
          width: 2px;
          background: linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0));
          transform: rotate(18deg);
          transform-origin: top;
        }
        .spider-silhouette {
          position: absolute;
          left: 73%;
          top: 32vh;
          width: 78px;
          height: 110px;
          transform-origin: top center;
          animation: web-swing 4.6s ease-in-out infinite;
          filter: drop-shadow(0 0 24px rgba(239,68,68,0.62));
        }
        .spider-silhouette span { position: absolute; display: block; background: #050817; border: 2px solid rgba(239,68,68,0.9); }
        .spider-head { left: 27px; top: 0; width: 26px; height: 26px; border-radius: 50%; }
        .spider-body { left: 22px; top: 28px; width: 36px; height: 46px; border-radius: 50% 50% 42% 42%; }
        .spider-arm, .spider-leg { width: 48px; height: 10px; border-radius: 999px; transform-origin: center; }
        .spider-arm-left { left: -13px; top: 34px; transform: rotate(-34deg); }
        .spider-arm-right { left: 43px; top: 28px; transform: rotate(32deg); }
        .spider-leg-left { left: -2px; top: 74px; transform: rotate(40deg); }
        .spider-leg-right { left: 35px; top: 74px; transform: rotate(-38deg); }
        .comic-panel {
          position: absolute;
          padding: 10px 14px;
          border: 1px solid currentColor;
          background: rgba(2, 6, 23, 0.74);
          font: 900 10px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.22em;
          animation: setpiece-float 5s ease-in-out infinite;
          box-shadow: 0 0 24px currentColor;
        }
        .comic-panel-red { --tilt: -5deg; left: 10vw; top: 55vh; color: #ef4444; }
        .comic-panel-blue { --tilt: 4deg; right: 12vw; top: 18vh; color: #38bdf8; animation-delay: 0.7s; }
        .batcomputer-console {
          position: absolute;
          right: 6vw;
          top: 16vh;
          width: min(28vw, 390px);
          min-width: 260px;
          padding: 18px;
          border: 1px solid rgba(250,204,21,0.4);
          background: linear-gradient(145deg, rgba(8,12,20,0.85), rgba(17,24,39,0.45));
          box-shadow: 0 0 34px rgba(250,204,21,0.18), inset 0 0 28px rgba(96,165,250,0.08);
          transform: perspective(800px) rotateY(-12deg);
        }
        .console-title { color: #facc15; font: 900 12px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.34em; margin-bottom: 14px; }
        .console-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .console-grid span {
          min-height: 42px;
          border: 1px solid rgba(96,165,250,0.24);
          background: linear-gradient(135deg, rgba(96,165,250,0.13), transparent);
          color: rgba(226,232,240,0.82);
          font: 800 9px/42px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          text-align: center;
        }
        .radar-sweep-mini {
          position: absolute;
          right: 20px;
          bottom: 18px;
          width: 72px;
          height: 72px;
          border: 1px solid rgba(250,204,21,0.35);
          border-radius: 50%;
          background: conic-gradient(from 0deg, rgba(250,204,21,0.34), transparent 28%);
          animation: spin-cw 3s linear infinite;
        }
        .batmobile-silhouette {
          position: absolute;
          left: 5vw;
          bottom: 16vh;
          width: min(42vw, 620px);
          color: rgba(250,204,21,0.88);
          animation: batmobile-cruise 5.4s ease-in-out infinite;
          filter: drop-shadow(0 0 26px rgba(250,204,21,0.32));
        }
        .gadget {
          position: absolute;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 1px solid rgba(250,204,21,0.42);
          color: #facc15;
          background: rgba(2,6,23,0.58);
          display: grid;
          place-items: center;
          font-size: 36px;
          text-shadow: 0 0 18px rgba(250,204,21,0.62);
          animation: gadget-orbit 6s linear infinite;
        }
        .batarang-gadget { left: 13vw; top: 18vh; }
        .grapnel-gadget { right: 21vw; bottom: 20vh; animation-delay: -2s; color: #60a5fa; }
        .gotham-skyline {
          position: absolute;
          inset-x: 0;
          bottom: 0;
          height: 120px;
          opacity: 0.18;
          background: linear-gradient(to top, #000 50%, transparent), repeating-linear-gradient(90deg, #111827 0 42px, transparent 42px 62px, #0f172a 62px 108px, transparent 108px 128px);
        }
        .joker-dialogue {
          position: absolute;
          padding: 12px 16px;
          border: 2px solid currentColor;
          border-radius: 18px 18px 18px 4px;
          background: rgba(6, 0, 12, 0.84);
          font: 950 12px/1.25 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.08em;
          box-shadow: 0 0 30px currentColor;
          animation: dialogue-pop 3.8s ease-in-out infinite;
        }
        .dialogue-one { --tilt: -5deg; left: 8vw; top: 22vh; color: #22c55e; }
        .dialogue-two { --tilt: 4deg; right: 8vw; top: 48vh; color: #a855f7; animation-delay: 1.1s; }
        .card-stack {
          position: absolute;
          left: 64vw;
          top: 17vh;
          width: 180px;
          height: 240px;
          transform-style: preserve-3d;
          perspective: 900px;
        }
        .joker-card {
          position: absolute;
          width: 128px;
          height: 184px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          border: 2px solid rgba(255,255,255,0.72);
          background: linear-gradient(145deg, rgba(255,255,255,0.92), rgba(220,252,231,0.72));
          color: #111827;
          font: 950 58px/1 Georgia, serif;
          box-shadow: 0 24px 60px rgba(0,0,0,0.38), 0 0 30px rgba(168,85,247,0.36);
          animation: card-tumble 4.8s ease-in-out infinite;
        }
        .card-a { --card-rot: -14deg; left: 0; top: 8px; color: #7e22ce; }
        .card-b { --card-rot: 8deg; left: 34px; top: 28px; color: #16a34a; animation-delay: 0.6s; }
        .card-c { --card-rot: 23deg; left: 68px; top: 54px; color: #e11d48; animation-delay: 1.2s; }
        .joker-mask {
          position: absolute;
          left: 13vw;
          bottom: 14vh;
          width: 180px;
          height: 118px;
          border-radius: 50% 50% 44% 44%;
          border: 2px solid rgba(168,85,247,0.5);
          background: radial-gradient(circle at 50% 38%, rgba(255,255,255,0.24), rgba(10,0,20,0.68) 62%);
          transform: rotate(-8deg);
          box-shadow: 0 0 40px rgba(34,197,94,0.2);
        }
        .mask-eye { position: absolute; top: 38px; width: 36px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 16px #22c55e; }
        .mask-eye.left { left: 42px; transform: rotate(12deg); }
        .mask-eye.right { right: 42px; transform: rotate(-12deg); }
        .mask-smile { position: absolute; left: 48px; bottom: 24px; width: 84px; height: 30px; border-bottom: 5px solid #f43f5e; border-radius: 50%; }
        .chaos-scribble {
          position: absolute;
          right: 18vw;
          bottom: 18vh;
          color: rgba(34,197,94,0.18);
          font: 950 64px/1 Georgia, serif;
          transform: rotate(-12deg);
          letter-spacing: 0.05em;
        }
        .anime-character {
          position: absolute;
          width: 132px;
          height: 210px;
          animation: anime-aura 4s ease-in-out infinite;
        }
        .shinobi-character { left: 9vw; top: 19vh; color: #fb923c; }
        .slayer-character { right: 10vw; top: 19vh; color: #38bdf8; animation-delay: 0.9s; }
        .character-head {
          position: absolute;
          left: 43px;
          top: 18px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid currentColor;
        }
        .headband {
          position: absolute;
          left: 30px;
          top: 26px;
          width: 72px;
          height: 12px;
          background: currentColor;
          box-shadow: 0 0 18px currentColor;
          z-index: 2;
        }
        .character-body {
          position: absolute;
          left: 32px;
          top: 70px;
          width: 68px;
          height: 92px;
          border-radius: 34px 34px 18px 18px;
          background: rgba(2,6,23,0.86);
          border: 2px solid currentColor;
        }
        .kunai {
          position: absolute;
          left: 88px;
          top: 88px;
          width: 56px;
          height: 8px;
          background: currentColor;
          transform: rotate(-32deg);
          box-shadow: 0 0 16px currentColor;
        }
        .slayer-blade {
          position: absolute;
          left: 88px;
          top: 14px;
          width: 7px;
          height: 182px;
          background: linear-gradient(to bottom, #fff, currentColor);
          transform-origin: bottom center;
          animation: blade-sweep 3.6s ease-in-out infinite;
          box-shadow: 0 0 20px currentColor;
        }
        .breathing-flame {
          position: absolute;
          left: 14px;
          top: 116px;
          width: 110px;
          height: 44px;
          border-radius: 50%;
          border-top: 3px solid #ef4444;
          border-bottom: 3px solid #38bdf8;
          transform: rotate(-18deg);
          opacity: 0.82;
        }
        .character-label {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          color: currentColor;
          font: 950 10px/1 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          letter-spacing: 0.22em;
        }
        .death-note-prop {
          position: absolute;
          left: 18vw;
          bottom: 16vh;
          width: 190px;
          height: 124px;
          padding: 18px;
          border: 1px solid rgba(239,68,68,0.5);
          background: linear-gradient(145deg, rgba(5,5,8,0.92), rgba(69,10,10,0.42));
          color: #f8fafc;
          transform: perspective(700px) rotateX(18deg) rotateZ(-6deg);
          box-shadow: 0 22px 52px rgba(0,0,0,0.42), 0 0 28px rgba(239,68,68,0.18);
          animation: setpiece-float 5s ease-in-out infinite;
        }
        .death-note-prop span { display: block; font: 900 22px/1 Georgia, serif; letter-spacing: 0.08em; }
        .death-note-prop small, .street-ghoul-prop small { display: block; margin-top: 12px; color: rgba(255,255,255,0.52); font: 800 9px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.08em; }
        .street-ghoul-prop {
          position: absolute;
          right: 18vw;
          bottom: 14vh;
          width: 210px;
          height: 132px;
          border: 1px solid rgba(168,85,247,0.45);
          background: linear-gradient(135deg, rgba(15,23,42,0.88), rgba(88,28,135,0.22));
          transform: perspective(700px) rotateX(15deg) rotateZ(5deg);
          box-shadow: 0 0 34px rgba(168,85,247,0.2);
          animation: setpiece-float 5.6s ease-in-out infinite;
        }
        .bike-light {
          position: absolute;
          left: 22px;
          bottom: 30px;
          width: 124px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, #ef4444, #38bdf8);
          box-shadow: 0 0 22px #ef4444;
        }
        .ghoul-mask {
          position: absolute;
          right: 24px;
          top: 22px;
          width: 58px;
          height: 58px;
          border-radius: 50% 50% 45% 45%;
          border: 2px solid #ef4444;
          background: rgba(2,6,23,0.78);
          box-shadow: 0 0 24px rgba(239,68,68,0.38);
        }
        @media (max-width: 900px) {
          .setpiece-layer { opacity: 0.58; }
          .letterbox { height: 28px; padding: 0 12px; font-size: 7px; letter-spacing: 0.14em; }
          .letterbox span:nth-child(2) { display: none; }
          .director-panel { left: 12px; top: 48px; max-width: 210px; font-size: 7px; padding: 8px; }
          .launch-countdown { right: 14px; top: 48px; width: 54px; height: 54px; }
          .launch-countdown span { font-size: 20px; }
          .scene-chip-rail { top: 72vh; gap: 6px; }
          .scene-chip { padding: 6px 7px; font-size: 7px; letter-spacing: 0.08em; }
          .spotlight { width: 70vw; opacity: 0.5; }
          .film-grain { opacity: 0.045; }
          .batcomputer-console, .card-stack, .slayer-character, .street-ghoul-prop { display: none; }
          .spider-silhouette { left: 82%; top: 24vh; transform: scale(0.78); }
          .batmobile-silhouette { width: 78vw; left: 7vw; bottom: 8vh; }
          .joker-dialogue { max-width: 210px; font-size: 10px; }
          .shinobi-character { left: 3vw; top: 22vh; transform: scale(0.76); }
          .death-note-prop { left: 5vw; bottom: 10vh; transform: scale(0.82) rotate(-6deg); }
        }
      `}</style>

      {/* Ambient cinematic washes */}
      <div
        className="absolute inset-x-0 top-0 h-[520px] pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${activeUniverse.primary}12 0%, transparent 32%, ${activeUniverse.secondary}10 62%, transparent 100%)` }}
      />
      <div
        className="absolute inset-x-0 bottom-[18%] h-[420px] pointer-events-none"
        style={{ background: `linear-gradient(45deg, transparent 0%, ${activeUniverse.tertiary}0d 42%, ${activeUniverse.primary}0a 67%, transparent 100%)` }}
      />
      <div className="absolute inset-x-0 top-0 h-[680px] overflow-hidden pointer-events-none z-[1]">
        <div className="cinema-wipe absolute top-24 h-40 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" style={{ boxShadow: `0 0 90px ${activeUniverse.glow}` }} />
        <div className="portal-shockwave absolute left-1/2 top-28 h-[420px] w-[420px] -translate-x-1/2 rounded-full border" style={{ borderColor: activeUniverse.primary, boxShadow: `0 0 48px ${activeUniverse.glow}` }} />
      </div>
      <CinematicSetPieces universe={activeUniverse} />
      <CinematicDirectorOverlay universe={activeUniverse} level={level} xp={xp} />

      {/* ── HERO SECTION ── */}
      <header className={`max-w-6xl mx-auto px-6 pt-20 pb-10 text-center flex flex-col items-center relative z-20 transition-all duration-1000 ${heroVisible ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>

        {/* Multi-ring animated HUD portal */}
        <div className="absolute top-[5%] left-[50%] -translate-x-1/2 h-[480px] w-[480px] pointer-events-none z-0">
          <svg className="w-full h-full hud-ring" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" strokeWidth="0.35" strokeDasharray="8 12 25 5" className="spin-cw color-ring" />
            <circle cx="50" cy="50" r="43" fill="none" stroke={activeUniverse.secondary} strokeWidth="0.25" strokeDasharray="40 10 20 30" className="spin-ccw" />
            <circle cx="50" cy="50" r="39" fill="none" stroke={activeUniverse.tertiary} strokeWidth="0.15" strokeDasharray="4 6" className="spin-cw" />
            <circle cx="50" cy="50" r="35" fill="none" stroke={activeUniverse.primary} strokeWidth="0.12" strokeDasharray="2 8" className="spin-slow" />
            {/* Cardinal tick marks */}
            {[0, 90, 180, 270].map(a => (
              <line
                key={a}
                x1={50 + 44 * Math.cos((a - 90) * Math.PI / 180)}
                y1={50 + 44 * Math.sin((a - 90) * Math.PI / 180)}
                x2={50 + 48 * Math.cos((a - 90) * Math.PI / 180)}
                y2={50 + 48 * Math.sin((a - 90) * Math.PI / 180)}
                stroke={activeUniverse.secondary} strokeWidth="0.5"
              />
            ))}
            <ellipse cx="50" cy="51" rx="4" ry="2" fill={activeUniverse.primary} opacity="0.08" />
          </svg>
        </div>

        <div className="fade-up universe-status inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] backdrop-blur-md mb-4" style={{ borderColor: `${activeUniverse.primary}55`, color: activeUniverse.secondary, backgroundColor: 'rgba(255,255,255,0.025)' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: activeUniverse.primary, boxShadow: `0 0 14px ${activeUniverse.primary}` }} />
          {activeUniverse.label}
        </div>

        {/* Rank Badge */}
        <div className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] text-xs font-bold mb-8 tracking-wide backdrop-blur-md" style={{ color: activeUniverse.primary }}>
          <ShieldCheck className="h-3.5 w-3.5 animate-pulse" style={{ color: activeUniverse.tertiary }} />
          <span className="text-[10px]">🕷️ {anime.narutoRank.split(' ')[0]} · 🦇 Level {level} · 🃏 {xp} XP</span>
        </div>

        {/* Main title */}
        <h1 className="fade-up-2 text-5xl md:text-8xl font-black font-sans shimmer-title pb-2">
          SANJU CAREER OS
        </h1>

        <p className="fade-up-3 mt-5 max-w-2xl text-xs md:text-sm leading-relaxed text-white/50 text-center z-10">
          A superhero-grade AI career interface — track DSA, DBMS, SkillRack, and German fluency.
          Powered by Shayla AI. This refresh launched <span className="font-bold" style={{ color: activeUniverse.secondary }}>{activeUniverse.eyebrow}</span>: {activeUniverse.tagline}
        </p>

        {/* Terminal */}
        <div className="fade-up-4 mt-7 px-4 py-2 rounded-xl border bg-black/70 font-mono text-[9px] flex items-center gap-2.5 z-10" style={{ borderColor: `${activeUniverse.primary}33`, color: activeUniverse.secondary, boxShadow: `0 0 28px ${activeUniverse.glow}` }}>
          <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeUniverse.primary }} />
          <span>{activeUniverse.consolePrefix}: {terminalText}</span>
        </div>

        {/* CTA Buttons */}
        <div className="fade-up-4 mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-xl z-20">
          <button
            onClick={handleLaunch}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl text-white font-black text-xs uppercase tracking-widest px-8 py-4 transition duration-300 active:scale-95 group relative overflow-hidden"
            style={{ background: activeUniverse.buttonGradient, boxShadow: `0 0 34px ${activeUniverse.glow}` }}
          >
            <div className="absolute top-0 -left-[60%] w-[40%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" style={{ animation: 'scan-flash 2s linear infinite' }} />
            <Zap className="h-4 w-4" style={{ color: activeUniverse.tertiary }} />
            Launch OS Portal
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => navigateToPath('/portfolio')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.02] text-white font-bold text-xs uppercase tracking-wider px-6 py-4 hover:border-white/15 hover:bg-white/[0.04] transition active:scale-95"
          >
            Portfolio Mode
          </button>

          <button
            onClick={() => navigateToPath('/shayla')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border bg-white/[0.02] font-bold text-xs uppercase tracking-wider px-6 py-4 hover:bg-white/[0.04] transition active:scale-95"
            style={{ borderColor: `${activeUniverse.secondary}44`, color: activeUniverse.secondary }}
          >
            <Bot className="h-4 w-4" /> Shayla AI
          </button>
        </div>
      </header>

      {/* ── HERO UNIVERSE 6-CARD GRID ── */}
      <section className="max-w-6xl mx-auto px-6 py-10 relative z-10">
        <div className="text-center mb-8">
          <span className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">Your Universe · Six Realms</span>
          <h2 className="text-2xl font-bold tracking-tight mt-2">The <span className="text-red-500">Hero</span> · <span className="text-yellow-400">Villain</span> · <span className="text-orange-400">Shinobi</span> Registry</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* ── Card 1: Naruto ── */}
          <div className="rounded-2xl border border-orange-900/30 bg-gradient-to-br from-orange-950/30 via-black/85 to-[#0b0300] p-5 flex flex-col justify-between hover:border-orange-500/40 transition duration-300 relative group overflow-hidden">
            <div className="absolute -top-2 -right-2 text-[80px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">🍥</div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-orange-500 font-mono">Hidden Leaf · Shinobi License</span>
              <h3 className="text-base font-black text-white mt-1 tracking-wide">🍥 NARUTO RANK</h3>
              <p className="text-[10px] text-white/40 leading-relaxed mt-2.5">Your ninja rank advances with tracker levels and daily problem completions. Master Java DSA to reach Hokage.</p>
            </div>
            <div className="mt-5 pt-3 border-t border-orange-950/50 flex items-center justify-between">
              <div>
                <span className="text-[7px] text-white/30 uppercase font-bold block">Current Rank</span>
                <span className="text-xs font-black text-orange-400 uppercase tracking-wide mt-0.5 block">{anime.narutoRank}</span>
              </div>
              <span className="text-[9px] bg-orange-950/40 border border-orange-500/20 px-2 py-0.5 rounded text-orange-400 font-bold font-mono">{xp} XP</span>
            </div>
          </div>

          {/* ── Card 2: Demon Slayer ── */}
          <div className="rounded-2xl border border-blue-900/30 bg-gradient-to-br from-blue-950/25 via-black/85 to-[#00050f] p-5 flex flex-col justify-between hover:border-blue-500/40 transition duration-300 relative group overflow-hidden">
            <div className="absolute -top-2 -right-2 text-[80px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">🌊</div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-blue-400 font-mono">Demon Slayer Corps · Registry</span>
              <h3 className="text-base font-black text-white mt-1">🌊 SLAYER CORPS</h3>
              <p className="text-[10px] text-white/40 leading-relaxed mt-2.5">Maintained by consistent streaks. Unleash your code breathing style every day you complete your logs.</p>
            </div>
            <div className="mt-5 pt-3 border-t border-blue-950/50 flex items-center justify-between">
              <div>
                <span className="text-[7px] text-white/30 uppercase font-bold block">Breathing Style</span>
                <span className="text-xs font-black text-blue-400 uppercase tracking-wide mt-0.5 block">{anime.demonSlayerBreathing.split(':')[0]}</span>
              </div>
              <span className="text-[9px] bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded text-blue-400 font-bold font-mono">{anime.demonSlayerRank.split(' ')[0]}</span>
            </div>
          </div>

          {/* ── Card 3: Death Note ── */}
          <div className="rounded-2xl border border-red-950/40 bg-gradient-to-br from-red-950/20 via-black/85 to-[#0b0000] p-5 flex flex-col justify-between hover:border-red-900/50 transition duration-300 relative group overflow-hidden">
            <div className="absolute top-2 right-3 text-[70px] opacity-[0.04] group-hover:opacity-[0.07] transition-opacity pointer-events-none select-none font-serif">L</div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-red-500 font-mono">Dev Note · Rule #1</span>
              <h3 className="text-base font-black text-white mt-1 font-serif tracking-widest">📓 DEATH NOTE</h3>
              <p className="text-[10px] text-white/40 font-serif leading-relaxed mt-2.5">"The task whose name is written in the Developer Note shall be executed without fail."</p>
            </div>
            <div className="mt-5 pt-3 border-t border-red-950/50 flex items-center justify-between font-serif">
              <span className="text-xs font-bold text-red-500">Commit to daily goals</span>
              <span className="text-[9px] bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded text-red-400 font-mono uppercase">Gothic Mode</span>
            </div>
          </div>

          {/* ── Card 4: Spider-Man ── */}
          <div className="rounded-2xl border border-red-900/25 bg-gradient-to-br from-[#150005] via-[#070010] to-black p-5 flex flex-col justify-between hover:border-red-700/40 transition duration-300 relative group overflow-hidden">
            <div className="absolute -top-2 -right-2 text-[80px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">🕷️</div>
            {/* Corner web SVG */}
            <svg className="absolute top-0 left-0 w-14 h-14 opacity-10 pointer-events-none" viewBox="0 0 50 50">
              {[0, 45, 90].map(a => <line key={a} x1="0" y1="0" x2={50*Math.cos(a*Math.PI/180)} y2={50*Math.sin(a*Math.PI/180)} stroke="#DC2626" strokeWidth="0.8" />)}
              {[15, 30].map(r => <path key={r} d={`M${r},0 Q0,0 0,${r}`} fill="none" stroke="#3B82F6" strokeWidth="0.5" />)}
            </svg>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-red-500 font-mono">Spider-Verse · Code Patrol</span>
              <h3 className="text-base font-black text-white mt-1">
                🕷️ <span className="bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">SPIDER-MAN</span>
              </h3>
              <p className="text-[10px] text-white/40 leading-relaxed mt-2.5">
                "With great power comes great responsibility." Every LeetCode solution is a web shot fired at the darkness.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-red-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">Bug-Slinging Developer</span>
              <span className="text-[9px] bg-red-950/30 border border-red-600/20 px-2 py-0.5 rounded text-red-400 font-mono">Peter Parker</span>
            </div>
          </div>

          {/* ── Card 5: Batman ── */}
          <div className="rounded-2xl border border-yellow-900/25 bg-gradient-to-br from-[#0d0a00] via-[#06060e] to-black p-5 flex flex-col justify-between hover:border-yellow-700/40 transition duration-300 relative group overflow-hidden">
            {/* Gotham skyline hint */}
            <div className="absolute bottom-0 left-0 right-0 h-8 opacity-[0.04] pointer-events-none overflow-hidden">
              <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,30 L0,18 L5,18 L5,8 L8,8 L8,3 L12,3 L12,8 L15,8 L15,15 L20,15 L20,5 L23,5 L23,15 L30,15 L30,10 L35,10 L35,15 L45,15 L45,3 L48,3 L48,15 L55,15 L55,10 L60,10 L60,15 L70,15 L70,8 L74,8 L74,15 L80,15 L80,10 L85,10 L85,15 L95,15 L95,18 L100,18 L100,30 Z" fill="#EAB308"/>
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 text-[80px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">🦇</div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-yellow-600/80 font-mono">Gotham · Knight Protocol</span>
              <h3 className="text-base font-black text-white mt-1">
                🦇 <span className="text-yellow-400">BATMAN</span> <span className="text-white/60">MODE</span>
              </h3>
              <p className="text-[10px] text-white/40 leading-relaxed mt-2.5">
                "It's not who I am underneath, but what I commit that defines me." Discipline over inspiration. Every day.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-yellow-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-yellow-500">Dark Knight Dev</span>
              <span className="text-[9px] bg-yellow-950/30 border border-yellow-600/20 px-2 py-0.5 rounded text-yellow-500 font-mono">Bruce Wayne</span>
            </div>
          </div>

          {/* ── Card 6: Joker ── */}
          <div className="rounded-2xl border border-purple-900/25 bg-gradient-to-br from-[#0c0015] via-[#030010] to-[#000805] p-5 flex flex-col justify-between hover:border-purple-700/35 transition duration-300 relative group overflow-hidden">
            <div className="absolute -top-2 -right-2 text-[80px] opacity-[0.05] group-hover:opacity-[0.09] transition-opacity pointer-events-none select-none">🃏</div>
            {/* Diagonal chaos lines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(-45deg, #a855f7 0px, #a855f7 1px, transparent 1px, transparent 12px)' }} />
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] font-mono" style={{ color: '#a855f7' }}>Arkham · Chaos Division</span>
              <h3 className="text-base font-black mt-1" style={{ animation: 'joker-flicker 4s ease-in-out infinite' }}>
                🃏 <span style={{ color: '#a855f7' }}>JOKER'S</span> <span className="text-green-400">DEAL</span>
              </h3>
              <p className="text-[10px] text-white/40 leading-relaxed mt-2.5">
                "Why so serious? It's just a runtime error." Embrace the chaos, laugh at the bugs, ship anyway.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-purple-950/40 flex items-center justify-between">
              <span className="text-xs font-bold text-green-400">Agent of Chaos Coding</span>
              <span className="text-[9px] bg-purple-950/30 border border-purple-600/20 px-2 py-0.5 rounded font-mono" style={{ color: '#a855f7' }}>The Joker</span>
            </div>
          </div>

        </div>
      </section>

      {/* ── SCROLLING MARQUEE QUOTE STRIP ── */}
      <div className="relative z-10 border-y border-white/5 bg-black/40 backdrop-blur-sm py-3 overflow-hidden my-4">
        <div className="flex whitespace-nowrap marquee-track gap-12">
          {[...MARQUEE_QUOTES, ...MARQUEE_QUOTES].map((q, i) => (
            <span key={i} className="text-[10px] font-mono text-white/35 flex-shrink-0 px-4">
              {q} <span className="text-white/15 mx-4">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── CORE MODULES GRID ── */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-white/[0.04] relative z-10">
        <div className="text-center mb-10">
          <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-widest">Interactive Terminal</span>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-2">Active Mission Modules</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {coreModules.map((mod) => (
            <Card key={mod.title} className="p-3.5 flex flex-col items-start gap-2.5 bg-white/[0.01] border-white/[0.04] hover:border-white/8 hover:bg-white/[0.025] transition duration-200 group">
              <div className={`p-2 rounded-xl bg-white/[0.03] ${mod.color} group-hover:scale-110 transition-transform duration-200`}>
                <mod.icon className="h-4 w-4" />
              </div>
              <h3 className="text-[10px] font-bold text-white leading-tight">{mod.title}</h3>
              <p className="text-[9px] text-white/35 leading-normal">{mod.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── TECH ARCHITECTURE ── */}
      <section className="max-w-6xl mx-auto px-6 py-14 border-t border-white/[0.04] relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-blue-400/60 uppercase tracking-wider mb-2">System Architecture</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Built for Speed,<br />Designed for Legends.</h2>
            <p className="mt-4 text-xs md:text-sm leading-relaxed text-white/40">
              Career OS is built on a local-first schema designed to serialize your work safely inside localStorage with schema migration safeguards. Interfaces with a Node/Express service for offline file handling, database replication, and custom local model routing via Ollama.
            </p>
          </div>
          <div className="grid gap-2.5">
            {techStack.map((tech, i) => (
              <div key={tech.category} className="rounded-2xl border border-white/[0.04] bg-white/[0.01] p-3.5 flex justify-between items-center gap-4 hover:border-white/8 hover:bg-white/[0.025] transition duration-200 group" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="text-xs font-bold text-white">{tech.category}</span>
                <span className="text-[10px] text-white/35 text-right font-mono">{tech.items}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <footer className="max-w-6xl mx-auto px-6 pt-12 pb-24 border-t border-white/[0.04] text-center relative z-10">
        <h2 className="text-3xl font-black text-white">
          Ready to launch the <span style={{ color: activeUniverse.primary }}>{activeUniverse.label}</span>?
        </h2>
        <p className="mt-3 text-xs text-white/35 max-w-lg mx-auto leading-relaxed">
          Start logging solutions, practice aptitude, analyze resumes, and prepare for interviews from one integrated command center.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleLaunch}
            className="inline-flex items-center justify-center gap-2 rounded-xl text-white font-black text-xs uppercase tracking-widest px-8 py-4 hover:opacity-90 transition active:scale-95"
            style={{ background: activeUniverse.buttonGradient, boxShadow: `0 0 28px ${activeUniverse.glow}` }}
          >
            <Zap className="h-4 w-4" style={{ color: activeUniverse.tertiary }} />
            Launch OS Portal
          </button>
        </div>
        <p className="mt-14 text-[9px] text-white/15 uppercase tracking-widest font-mono">
          Sanju Career OS v1.7.2 · {activeUniverse.label} · Randomized per refresh
        </p>
      </footer>
    </div>
  );
};
