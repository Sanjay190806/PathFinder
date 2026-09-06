import React from 'react';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div className="flex h-[320px] w-full flex-col items-center justify-center gap-4 text-center select-none">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-accentBlue/20" />
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-accentBlue border-t-transparent" />
      </div>
      <p className="text-xs font-semibold text-textMuted tracking-wider uppercase animate-pulse">Loading Workspace Module...</p>
    </div>
  );
};
