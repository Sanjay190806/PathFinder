import React from 'react';

export const LoadingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accentBlue mb-4"></div>
      <span className="text-xs text-textSecondary">Loading workspace...</span>
    </div>
  );
};
