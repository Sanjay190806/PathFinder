import { useEffect, useRef } from 'react';
import { navigateToPath } from '../utils/navigation';

export function useGlobalShortcuts(onOpenHelp: () => void): void {
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts if user is typing in form controls
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Toggle Help: Ctrl + / or Cmd + /
      if (isCtrlOrCmd && e.key === '/') {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // 2. Sequential Navigation (Gmail/GitHub style: 'g' then 'd/t/r/s/c/p/k/m')
      const now = Date.now();
      const last = lastKeyRef.current;
      
      if (last && last.key === 'g' && now - last.time < 1000) {
        lastKeyRef.current = null;
        
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault();
            navigateToPath('/dashboard');
            return;
          case 't':
            e.preventDefault();
            navigateToPath('/today');
            return;
          case 'r':
            e.preventDefault();
            navigateToPath('/roadmap');
            return;
          case 's':
            e.preventDefault();
            navigateToPath('/shayla');
            return;
          case 'c':
            e.preventDefault();
            navigateToPath('/placement-calendar');
            return;
          case 'p':
            e.preventDefault();
            navigateToPath('/projects');
            return;
          case 'k':
            e.preventDefault();
            navigateToPath('/cs-core');
            return;
          case 'm':
            e.preventDefault();
            navigateToPath('/german');
            return;
          default:
            break;
        }
      }

      // Track 'g' command prefix
      if (e.key.toLowerCase() === 'g') {
        lastKeyRef.current = { key: 'g', time: now };
      } else {
        lastKeyRef.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenHelp]);
}
