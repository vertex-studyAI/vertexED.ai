/**
 * Allow only image sources that cannot execute script in the page.
 * Used for paper attachments, review uploads, and any user-influenced <img src>.
 */

const ALLOWED_DATA_IMAGE_RE =
  /^data:image\/(?:jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/]+={0,2}$/i;

function isBlockedHostname(hostname) {
  const host = String(hostname || '')
    .toLowerCase()
    .replace(/\.$/, '');
  if (!host) return true;
  if (
    host === 'localhost'
    || host.endsWith('.localhost')
    || host === 'metadata.google.internal'
    || host === 'metadata'
  ) {
    return true;
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split('.').map((part) => Number(part));
    if (parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  }

  if (host === '::1' || host === '[::1]') return true;
  if (host.startsWith('fc') || host.startsWith('fd') || host.startsWith('fe80')) return true;
  return false;
}

/**
 * @param {unknown} value
 * @returns {string | undefined} navigable https or safe data:image src, else undefined
 */
export function safeImageSrc(value) {
  if (typeof value !== 'string') return undefined;
  const src = value.trim();
  if (!src) return undefined;

  if (ALLOWED_DATA_IMAGE_RE.test(src)) {
    return src;
  }

  try {
    const url = new URL(src);
    if (url.protocol !== 'https:') return undefined;
    if (url.username || url.password) return undefined;
    if (isBlockedHostname(url.hostname)) return undefined;
    return url.href;
  } catch {
    return undefined;
  }
}

/**
 * Build a data URL only when mime + base64 are already allowlisted.
 * @param {string | null | undefined} mime
 * @param {string | null | undefined} b64
 */
export function safeDataImageSrc(mime, b64) {
  if (typeof mime !== 'string' || typeof b64 !== 'string') return undefined;
  const normalizedMime = mime.trim().toLowerCase() === 'image/jpg' ? 'image/jpeg' : mime.trim().toLowerCase();
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(normalizedMime)) {
    return undefined;
  }
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(b64) || b64.startsWith('data:')) return undefined;
  return safeImageSrc(`data:${normalizedMime};base64,${b64}`);
}

export function isBlockedImageHostname(hostname) {
  return isBlockedHostname(hostname);
}
