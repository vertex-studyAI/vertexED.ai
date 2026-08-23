const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REVIEW_IMAGE_DATA_URL_RE = /^data:image\/(?:png|jpe?g|webp|gif);base64,/i;
const BASE64_RE = /^[A-Za-z0-9+/]+={0,2}$/;

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.vertexed.app',
  'https://vertexed.app',
];

export function isProduction() {
  return process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function applyApiSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

function getAllowedOrigins() {
  const extra = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = [...DEFAULT_ALLOWED_ORIGINS, ...extra];
  if (!isProduction()) {
    origins.push('http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:5173', 'http://127.0.0.1:5173');
  }
  return origins;
}

export function enforceSameOriginCors(req, res) {
  const origin = req.headers?.origin || req.headers?.Origin;
  if (!origin || typeof origin !== 'string') {
    return true;
  }

  const allowed = getAllowedOrigins();
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Max-Age', '600');
    return true;
  }

  res.status(403).json({ error: 'Cross-origin requests are not allowed.' });
  return false;
}

export function isValidUuid(value) {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function normalizeEmail(raw) {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) return null;
  return email;
}

export function validatePassword(password) {
  const pwd = typeof password === 'string' ? password : '';
  if (pwd.length < 10) {
    return { ok: false, error: 'Password must be at least 10 characters.' };
  }
  if (pwd.length > 128) {
    return { ok: false, error: 'Password must be 128 characters or fewer.' };
  }
  if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    return {
      ok: false,
      error: 'Password must include uppercase, lowercase, and a number.',
    };
  }
  return { ok: true };
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
