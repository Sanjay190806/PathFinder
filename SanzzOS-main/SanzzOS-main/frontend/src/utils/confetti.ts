/**
 * confetti.ts
 * Lightweight canvas-based confetti that fires over the entire viewport.
 * No external library needed.
 */

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  shape: 'rect' | 'circle' | 'star';
  alpha: number;
  gravity: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx2d: CanvasRenderingContext2D | null = null;
let animId = 0;
let particles: Particle[] = [];

const COLORS = [
  '#f43f5e', '#a855f7', '#22c55e', '#3b82f6',
  '#f59e0b', '#ec4899', '#06b6d4', '#84cc16',
];

const makeParticle = (x: number, y: number): Particle => ({
  x, y,
  vx: (Math.random() - 0.5) * 14,
  vy: -(Math.random() * 12 + 4),
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  size: Math.random() * 8 + 4,
  rotation: Math.random() * Math.PI * 2,
  rotSpeed: (Math.random() - 0.5) * 0.25,
  shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
  alpha: 1,
  gravity: Math.random() * 0.4 + 0.2,
});

const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => {
  const spikes = 5;
  const inner = r * 0.4;
  c.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes - Math.PI / 2;
    const rad = i % 2 === 0 ? r : inner;
    i === 0 ? c.moveTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad)
             : c.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
  }
  c.closePath();
  c.fill();
};

const loop = () => {
  if (!canvas || !ctx2d) return;
  ctx2d.clearRect(0, 0, canvas.width, canvas.height);

  particles = particles.filter(p => p.alpha > 0.02);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += p.gravity;
    p.vx *= 0.99;
    p.rotation += p.rotSpeed;
    p.alpha -= 0.012;

    ctx2d!.save();
    ctx2d!.globalAlpha = Math.max(0, p.alpha);
    ctx2d!.fillStyle = p.color;
    ctx2d!.translate(p.x, p.y);
    ctx2d!.rotate(p.rotation);

    if (p.shape === 'circle') {
      ctx2d!.beginPath();
      ctx2d!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx2d!.fill();
    } else if (p.shape === 'star') {
      drawStar(ctx2d!, 0, 0, p.size / 2);
    } else {
      ctx2d!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    }

    ctx2d!.restore();
  });

  if (particles.length > 0) {
    animId = requestAnimationFrame(loop);
  } else {
    teardown();
  }
};

const teardown = () => {
  cancelAnimationFrame(animId);
  if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  canvas = null;
  ctx2d = null;
  particles = [];
};

/**
 * Launch confetti from bottom-center of viewport.
 * count = number of particles (default 120)
 */
export const launchConfetti = (count = 120) => {
  // Remove existing
  if (canvas) teardown();

  canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  ctx2d = canvas.getContext('2d');

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight;

  // Fire from 3 points: left, center, right
  const origins = [
    { x: window.innerWidth * 0.2, y: originY },
    { x: originX, y: originY },
    { x: window.innerWidth * 0.8, y: originY },
  ];

  for (let i = 0; i < count; i++) {
    const o = origins[i % 3];
    particles.push(makeParticle(o.x + (Math.random() - 0.5) * 40, o.y));
  }

  animId = requestAnimationFrame(loop);
};

/** Launch a smaller burst at a specific element */
export const launchBurst = (el: HTMLElement, count = 40) => {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:99999;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx2d = canvas.getContext('2d');
  }

  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20));
  }

  if (!animId) animId = requestAnimationFrame(loop);
};
