import React, { useEffect, useState, useRef } from 'react';
import { CinematicUniverse } from '../visual/CinematicUniverseOverlay';

export const CursorAura: React.FC = () => {
  const [universe, setUniverse] = useState<CinematicUniverse>('spider-verse');
  const [visible, setVisible] = useState(false);
  
  const mouseRef = useRef({ x: -100, y: -100 });
  const auraRef = useRef({ x: -100, y: -100 });
  
  const dotElRef = useRef<HTMLDivElement | null>(null);
  const auraElRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initialTheme = document.documentElement.getAttribute('data-cinematic-theme') as CinematicUniverse;
    if (initialTheme) {
      setUniverse(initialTheme);
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<CinematicUniverse>;
      setUniverse(customEvent.detail);
    };

    window.addEventListener('cinematic-theme-changed', handleThemeChange);
    return () => window.removeEventListener('cinematic-theme-changed', handleThemeChange);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => setVisible(false);
    const handleMouseEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [visible]);

  useEffect(() => {
    let animId: number;

    const updatePosition = () => {
      if (!visible) {
        animId = requestAnimationFrame(updatePosition);
        return;
      }

      // Move inner dot instantly
      if (dotElRef.current) {
        dotElRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      // Interpolate aura position with spring effect
      const dx = mouseRef.current.x - auraRef.current.x;
      const dy = mouseRef.current.y - auraRef.current.y;
      
      auraRef.current.x += dx * 0.18; // slightly faster follow to reduce perceived lag
      auraRef.current.y += dy * 0.18;

      if (auraElRef.current) {
        auraElRef.current.style.transform = `translate3d(${auraRef.current.x}px, ${auraRef.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(updatePosition);
    };

    animId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animId);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="cursor-system fixed inset-0 w-full h-full pointer-events-none z-[9999] hidden lg:block overflow-hidden">
      {/* 1. Custom Inner Cursor Dot (Hardware Accelerated) */}
      <div 
        ref={dotElRef}
        style={{ willChange: 'transform' }}
        className={`absolute w-2 h-2 -ml-1 -mt-1 rounded-full transition-colors duration-300 z-20 pointer-events-none ${
          universe === 'spider-verse' ? 'bg-pink-500 shadow-[0_0_8px_#ec4899]' :
          universe === 'batman' ? 'bg-yellow-500 shadow-[0_0_8px_#eab308]' :
          universe === 'joker' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' :
          'bg-red-500 shadow-[0_0_8px_#ef4444]'
        }`}
      />

      {/* 2. Custom Outer Trailing Aura / HUD Ring (Hardware Accelerated) */}
      <div 
        ref={auraElRef}
        style={{ willChange: 'transform' }}
        className={`absolute -ml-5 -mt-5 rounded-full flex items-center justify-center transition-all duration-300 z-10 pointer-events-none ${
          universe === 'spider-verse' ? 'w-10 h-10 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] animate-pulse' :
          universe === 'batman' ? 'w-10 h-10 border border-yellow-500/40 shadow-[0_0_12px_rgba(234,179,8,0.15)]' :
          universe === 'joker' ? 'w-10 h-10 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]' :
          'w-10 h-10 border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
        }`}
      >
        {universe === 'spider-verse' && (
          <div className="absolute inset-0.5 border border-dashed border-pink-500/30 rounded-full animate-[spin_12s_linear_infinite]" />
        )}
        
        {universe === 'batman' && (
          <>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-yellow-500/15" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-yellow-500/15" />
            <div className="w-6 h-6 border border-cyan-500/20 rounded-full animate-spin-slow" />
          </>
        )}

        {universe === 'joker' && (
          <div className="absolute inset-1 border border-dotted border-green-500/30 rounded-full animate-[spin_6s_linear_infinite]" />
        )}

        {universe === 'anime' && (
          <div className="absolute w-3 h-3 bg-orange-500/25 rounded-full animate-ping" />
        )}
      </div>

      <style>{`
        .app-shell, .app-shell * {
          cursor: none !important;
        }
        a, button, [role="button"], input, select, textarea {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
};
export default CursorAura;
