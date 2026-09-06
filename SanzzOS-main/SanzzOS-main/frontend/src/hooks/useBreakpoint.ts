import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setBreakpoint('xs');       // Mobile
      else if (w < 768) setBreakpoint('sm');  // Tablet Portrait
      else if (w < 1024) setBreakpoint('md'); // Tablet Landscape / Small Laptop
      else if (w < 1280) setBreakpoint('lg'); // Laptop
      else if (w < 1536) setBreakpoint('xl'); // Desktop Normal
      else setBreakpoint('2xl');              // Large Display
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}
export default useBreakpoint;
