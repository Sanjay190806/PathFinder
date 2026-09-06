import React from 'react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-4">🧩</div>
      <h1 className="text-xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-textSecondary mb-6">The career operating system directory path you requested does not exist.</p>
    </div>
  );
};
