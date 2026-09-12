export function resolveSameOriginApiPath(configured, fallback, currentOrigin) {
  const fallbackPath = typeof fallback === 'string' && fallback.trim() ? fallback.trim() : '/api';
  if (typeof configured !== 'string' || !configured.trim()) return fallbackPath;

  const candidate = configured.trim();

  if (candidate.startsWith('/') && !candidate.startsWith('//')) {
    return candidate;
  }

  const origin =
    typeof currentOrigin === 'string' && currentOrigin.trim()
      ? currentOrigin.trim().replace(/\/$/, '')
      : '';
  if (!origin) return fallbackPath;

  try {
    const url = new URL(candidate, origin);
    if (url.origin !== origin) return fallbackPath;
    return `${url.pathname}${url.search}${url.hash}` || fallbackPath;
  } catch {
    return fallbackPath;
  }
}
