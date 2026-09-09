import crypto from 'crypto';

export const WAITLIST_INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a per-user invite token when a waitlist entry is approved.
 */
export function generateInviteToken() {
  return crypto.randomBytes(24).toString('base64url');
}

/** Store only a one-way digest. The raw token exists only in the emailed URL. */
export function hashInviteToken(token) {
  if (typeof token !== 'string' || token.length < 16 || token.length > 256) return null;
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getInviteExpiry(issuedAt = new Date()) {
  return new Date(issuedAt.getTime() + WAITLIST_INVITE_TTL_MS).toISOString();
}

export function buildInviteSignupUrl(origin, token) {
  const base = (origin || 'https://www.vertexed.app').replace(/\/$/, '');
  return `${base}/signup?invite=${encodeURIComponent(token)}`;
}
