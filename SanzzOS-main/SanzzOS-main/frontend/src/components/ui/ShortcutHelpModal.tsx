import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ShortcutHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutHelpModal: React.FC<ShortcutHelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['Ctrl', '/'], desc: 'Open Keyboard Shortcut Help Dialog' },
    { keys: ['g', 'd'], desc: 'Go to Workspace Dashboard' },
    { keys: ['g', 't'], desc: 'Go to Today\'s Mission Checklist' },
    { keys: ['g', 'r'], desc: 'Go to 180-Day DSA Roadmap' },
    { keys: ['g', 's'], desc: 'Go to Shayla AI Mentor Chat' },
    { keys: ['g', 'c'], desc: 'Go to Placement Calendar' },
    { keys: ['g', 'p'], desc: 'Go to Projects Showcase' },
    { keys: ['g', 'k'], desc: 'Go to SQL + CS Core Fundamentals' },
    { keys: ['g', 'm'], desc: 'Go to German Academy Studio' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm select-none p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md rounded-3xl border border-white/10 bg-bgCard p-6 shadow-glow-purple/10 flex flex-col gap-4 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal container
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-textMuted hover:text-textPrimary hover:bg-white/5 transition"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>

        <div>
          <span className="text-[9px] font-bold text-accentPurple uppercase tracking-widest">Workspace Shortcuts</span>
          <h2 id="modal-title" className="text-lg font-bold text-textPrimary mt-1">Keyboard Shortcuts Quick Reference</h2>
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.desc} className="flex items-center justify-between gap-4 py-1.5 border-b border-white/5 last:border-b-0">
              <span className="text-xs text-textSecondary">{shortcut.desc}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((k, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <span className="text-[9px] text-textMuted font-mono">then</span>}
                    <kbd className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-textPrimary shadow-sm">
                      {k}
                    </kbd>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-[10px] text-textMuted text-center mt-3 font-medium">
          Press <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono text-[9px] text-textPrimary">Esc</kbd> or click outside to dismiss this dialog.
        </div>
      </div>
    </div>
  );
};
