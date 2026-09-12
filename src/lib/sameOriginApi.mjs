export function resolveSameOriginApiPath(configured, fallback, currentOrigin) {
  const fallbackPath = typeof fallback === 'string' && fallback.trim() ? fallback.trim() : '/api';
  if (typeof configured !== 'string' || !configured.trim()) return fallbackPath;

  const candidate = configured.trim();
  const origin =
    typeof currentOrigin === 'string' && currentOrigin.trim()
      ? currentOrigin.trim()
      : '';
  if (!origin) return fallbackPath;

  try {
    const originUrl = new URL(origin);
    const url = new URL(candidate, originUrl);
    if (url.origin !== originUrl.origin) return fallbackPath;
    return `${url.pathname}${url.search}${url.hash}` || fallbackPath;
  } catch {
    return fallbackPath;
  }
}
