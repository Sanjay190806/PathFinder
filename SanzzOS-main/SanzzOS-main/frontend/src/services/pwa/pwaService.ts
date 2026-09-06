/**
 * @deprecated Use `frontend/src/pwa/registerServiceWorker.ts` instead.
 * Kept for compatibility with older imports.
 */
import { registerServiceWorker } from '../../pwa/registerServiceWorker';

export const pwaService = {
  register: registerServiceWorker,
};

export default pwaService;
