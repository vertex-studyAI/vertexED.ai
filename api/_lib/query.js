/**
 * Read query params consistently across Vercel (req.query) and local dev (req.url).
 */
export function getQueryParam(req, key) {
  const fromQuery = req.query?.[key];
  if (fromQuery !== undefined && fromQuery !== null && fromQuery !== '') {
    return Array.isArray(fromQuery) ? fromQuery[0] : String(fromQuery);
  }

  const rawUrl = req.url;
  if (typeof rawUrl !== 'string' || !rawUrl.includes('?')) return null;

  try {
    const base = req.headers?.host ? `https://${req.headers.host}` : 'http://localhost';
    const pathname = rawUrl.startsWith('http') ? rawUrl : `${base}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
    return new URL(pathname).searchParams.get(key);
  } catch {
    return null;
  }
}

export function getQueryNumber(req, key, fallback, max = Infinity) {
  const raw = getQueryParam(req, key);
  const n = Number(raw ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(0, n), max);
}
