// Public build assets only. Account persistence remains owned by the existing
// account-scoped stores; service-worker caching must not acknowledge a save.
import { offlineEnabled } from './offlineControls.mjs';

export function registerOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  if (!offlineEnabled()) return;
  const register = () => {
    void navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {
      // Private browsing, quota limits or a failed install leave normal online
      // operation intact. A failed install is never presented as offline-ready.
    });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

registerOffline();
