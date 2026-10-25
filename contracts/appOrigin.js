// Verified against GitHub deployment records and the app's /api/health endpoint.
export const DEFAULT_APP_ORIGIN = 'https://vertex-ed-ai.vercel.app';

export function normalizeAppOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null;
    if (url.hostname.includes('*')) return null;
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash) return null;
    if (/(^|\.)vertexed\.(app|ai)$/i.test(url.hostname)) return null;
    return url.origin;
  } catch { return null; }
}

export function resolveAppOrigin(env = {}) {
  const candidates = [env.APP_URL, env.SITE_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL && `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`,
    env.VERCEL_URL && `https://${env.VERCEL_URL}`];
  for (const value of candidates) {
    const origin = normalizeAppOrigin(value);
    if (origin) return origin;
  }
  return DEFAULT_APP_ORIGIN;
}

export function appAllowedOrigins(env = {}) {
  return [...new Set([DEFAULT_APP_ORIGIN, resolveAppOrigin(env),
    env.VERCEL_URL && `https://${env.VERCEL_URL}`,
    env.VERCEL_BRANCH_URL && `https://${env.VERCEL_BRANCH_URL}`,
    ...(env.ALLOWED_ORIGINS || '').split(','),
  ].map(value => normalizeAppOrigin(value)).filter(Boolean))];
}
