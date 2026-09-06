import React from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';
import { Card } from '../components/ui/Card';

export const OfflinePage: React.FC = () => {
  const handleReload = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-bgSurface text-center select-none">
      <Card className="max-w-sm flex flex-col items-center gap-5 p-6 border-white/5 bg-gradient-to-br from-bgCard to-black/35">
        <div className="h-14 w-14 rounded-full bg-accentOrange/10 border border-accentOrange/30 flex items-center justify-center text-accentOrange shadow-glow-gold/15">
          <WifiOff className="h-6 w-6 animate-pulse" />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-base font-black text-textPrimary tracking-tight">Tactical Connection Offline</h2>
          <p className="text-[10px] text-textSecondary leading-relaxed">
            Your connection was lost. You can still review cached learning paths and planner tasks. 
            Reconnect to sync your progress with the cloud backup database.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReload}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-accentBlue py-3 text-xs font-bold text-white hover:bg-accentBlue/90 transition shadow-glow-blue/10"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reload Dashboard</span>
        </button>
      </Card>
    </div>
  );
};
export default OfflinePage;
