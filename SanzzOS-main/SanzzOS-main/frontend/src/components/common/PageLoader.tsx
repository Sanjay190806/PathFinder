import React from 'react';
import { Loader2 } from 'lucide-react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex h-64 w-full items-center justify-center select-none animate-pulse">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 text-accentBlue animate-spin" />
        <span className="text-[10px] text-textSecondary font-black uppercase tracking-[0.2em]">Loading Sector Data</span>
      </div>
    </div>
  );
};
export default PageLoader;
