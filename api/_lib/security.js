import crypto from 'node:crypto';

const PROD_VALUES = new Set(['production', 'prod']);

export function isProduction() {
  return PROD_VALUES.has(String(process.env.VERCEL_ENV || process.env.NODE_ENV || '').toLowerCase());
}

export function isAllowedOrigin(origin) {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && (hostname === 'localhost' || hostname === '127.0.0.1'))) {
      return false;
    }

    if (hostname === 'vertexed.app' || hostname === 'www.vertexed.app') return true;
    if (!isProduction() && (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.vercel.app'))) return true;
    return false;
  } catch {
    return false;
  }
}

export function assertAllowedOrigin(req, res) {
  const origin = req.headers?.origin;
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return false;
  }
  return true;
}

export function hashRateLimitIdentity(value, salt) {
  return crypto.createHmac('sha256', salt).update(String(value)).digest('hex');
}

export function getClientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (first) return String(first).split(',')[0].trim();
  return req.headers?.['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function validateEmail(email) {
  const value = normalizeEmail(email);
  if (!value || value.length > 254) return false;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false;
  return true;
}

const BASE64_RE = /^[A-Za-z0-9+/]*={0,2}$/;
const REVIEW_IMAGE_DATA_URL_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,/i;

export function validateWaitlistPayload(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body' };
  }

  const email = normalizeEmail(body.email);
  if (!validateEmail(email)) return { ok: false, error: 'Invalid email' };

  if (body.source !== undefined && typeof body.source !== 'string') {
    return { ok: false, error: 'Invalid source' };
  }
  if (typeof body.source === 'string' && body.source.length > 80) {
    return { ok: false, error: 'Invalid source' };
  }

  return {
    ok: true,
    value: {
      email,
      source: typeof body.source === 'string' && body.source.trim() ? body.source.trim() : 'website',
    },
  };
}

export function getWaitlistRateLimitSalt() {
  const configuredSalt = process.env.WAITLIST_RATE_LIMIT_SALT;
  if (configuredSalt && configuredSalt.trim()) return configuredSalt.trim();

  // The service-role key is already required to operate the server-side
  // waitlist. It is a strong, server-only fallback so deployments do not fail
  // merely because a separate rate-limit salt was not added.
  const serverSecret = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  if (serverSecret && serverSecret.trim()) {
    console.warn('WAITLIST_RATE_LIMIT_SALT is not configured; using a server-secret-derived fallback.');
    return serverSecret.trim();
  }

  if (isProduction()) {
    console.error('Waitlist rate limiting requires WAITLIST_RATE_LIMIT_SALT or a Supabase server secret.');
    return null;
  }
  return 'vertexed-waitlist';
}

export const MAX_REVIEW_IMAGES = 5;
export const MAX_REVIEW_IMAGE_BYTES = 4 * 1024 * 1024;

function getReviewImageDataUrl(image) {
  if (typeof image === 'string') return image;
  if (image && typeof image === 'object' && !Array.isArray(image) && typeof image.src === 'string') {
    return image.src;
  }
  return null;
}

export function validateReviewImages(images) {
  if (images === undefined || images === null) return { ok: true, images: [] };
  if (!Array.isArray(images)) {
    return { ok: false, error: 'Images must be provided as an array.' };
  }
  if (images.length > MAX_REVIEW_IMAGES) {
    return { ok: false, error: `Too many images (max ${MAX_REVIEW_IMAGES}).` };
  }

  const normalizedImages = [];
  for (const image of images) {
    const dataUrl = getReviewImageDataUrl(image);
    if (!dataUrl || !REVIEW_IMAGE_DATA_URL_RE.test(dataUrl)) {
      return { ok: false, error: 'Images must be PNG, JPEG, WEBP, or GIF base64 data URLs.' };
    }

    const comma = dataUrl.indexOf(',');
    const base64 = dataUrl.slice(comma + 1);
    if (!base64 || base64.length % 4 !== 0 || !BASE64_RE.test(base64)) {
      return { ok: false, error: 'Images must contain valid base64 data.' };
    }

    const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
    const bytes = (base64.length * 3) / 4 - padding;
    if (bytes > MAX_REVIEW_IMAGE_BYTES) {
      return { ok: false, error: `Each image must be ${MAX_REVIEW_IMAGE_BYTES / (1024 * 1024)} MB or smaller.` };
    }
    normalizedImages.push(dataUrl);
  }

  return { ok: true, images: normalizedImages };
}

export function safeErrorMessage(error, fallback = 'Request failed. Please try again.') {
  if (error instanceof Error && error.message) {
    return fallback;
  }
  return fallback;
}
