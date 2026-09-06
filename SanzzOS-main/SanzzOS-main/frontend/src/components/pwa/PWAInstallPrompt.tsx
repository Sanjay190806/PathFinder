import React, { useEffect, useState } from 'react';
import { Monitor, X, Download } from 'lucide-react';
import { Card } from '../ui/Card';

function isStandaloneInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isStandaloneInstalled()) return;

    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setVisible(false);
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!visible || isStandaloneInstalled()) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-full select-none animate-slide-up">
      <Card className="relative p-4 border-accentBlue/20 bg-black/90 shadow-2xl flex items-center gap-3">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-textSecondary hover:text-textPrimary transition"
          aria-label="Close prompt"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="h-10 w-10 rounded-xl bg-accentBlue/10 border border-accentBlue/20 flex items-center justify-center text-accentBlue shrink-0">
          <Monitor className="h-5 w-5" />
        </div>

        <div className="flex flex-col gap-1 pr-6">
          <h4 className="text-xs font-black text-textPrimary leading-tight">Install Career OS App</h4>
          <p className="text-[9px] text-textSecondary leading-normal">
            Install the standalone app for faster startup. Offline support depends on a prior successful load.
          </p>
          <button
            type="button"
            onClick={handleInstall}
            className="flex items-center gap-1.5 text-[9px] font-black text-accentBlue hover:text-accentBlue/80 uppercase tracking-widest mt-1.5 self-start transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Install Standalone</span>
          </button>
        </div>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
