import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      {/* Slide-out Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-bgSurface border-l border-border-subtle z-50 shadow-2xl transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col ${className}`}
      >
        <div className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-bgSurface/90 backdrop-blur-md sticky top-0">
          <h3 className="font-bold text-sm text-textPrimary uppercase tracking-wider">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="text-textSecondary hover:text-textPrimary hover:bg-bg-glass-hover p-1.5 rounded-lg transition"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
};
