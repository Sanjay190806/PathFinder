import React, { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, X } from 'lucide-react';
import { Card } from '../ui/Card';

export const PWAUpdatePrompt: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setVisible(true);
    };

    window.addEventListener('pwa_update_available', handleUpdate);
    return () => window.removeEventListener('pwa_update_available', handleUpdate);
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full select-none animate-slide-up">
      <Card className="relative p-4 border-accentEmerald/20 bg-black/90 shadow-2xl flex items-center gap-3">
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary transition"
          aria-label="Close prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-10 w-10 rounded-xl bg-accentEmerald/10 border border-accentEmerald/20 flex items-center justify-center text-accentEmerald shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>

        <div className="flex flex-col gap-1 pr-6">
          <h4 className="text-xs font-black text-textPrimary leading-tight">Update Available</h4>
          <p className="text-[9px] text-textSecondary leading-normal">
            A new version of Sanju Career OS has been loaded in the background.
          </p>
          <button
            type="button"
            onClick={handleReload}
            className="flex items-center gap-1.5 text-[9px] font-black text-accentEmerald hover:text-accentEmerald/80 uppercase tracking-widest mt-1.5 self-start transition"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Apply Update & Reload</span>
          </button>
        </div>
      </Card>
    </div>
  );
};
export default PWAUpdatePrompt;
