import React, { useState } from 'react';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './components/ui/ToastProvider';
import { ShortcutHelpModal } from './components/ui/ShortcutHelpModal';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { PWAUpdatePrompt } from './components/pwa/PWAUpdatePrompt';

const App: React.FC = () => {
  const [helpOpen, setHelpOpen] = useState(false);
  useGlobalShortcuts(() => setHelpOpen(true));

  return (
    <ToastProvider>
      <AppRouter />
      <ShortcutHelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
    </ToastProvider>
  );
};

export default App;
