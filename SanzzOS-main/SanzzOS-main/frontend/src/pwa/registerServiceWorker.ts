import { featureFlags } from '../config/featureFlags';

export function registerServiceWorker() {
  if (!featureFlags.enablePWA) return;
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (!installingWorker) return;
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.dispatchEvent(new Event('pwa_update_available'));
            }
          };
        };
      })
      .catch(() => {
        // Silent fallback: offline shell still works when registration is unavailable.
      });
  });
}
