import { DEFAULT_APP_ORIGIN, normalizeAppOrigin } from '../../contracts/appOrigin.js';

// Metadata stays on the deployment the visitor opened.
export const APP_ORIGIN = (typeof window !== 'undefined'
  ? normalizeAppOrigin(window.location.origin) : null) || DEFAULT_APP_ORIGIN;
