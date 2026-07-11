import crypto from 'crypto';

/**
 * Generate a per-user invite token when a waitlist entry is approved.
 */
export function generateInviteToken() {
  return crypto.randomBytes(24).toString('base64url');
}

export function buildInviteSignupUrl(origin, token) {
  const base = (origin || 'https://www.vertexed.app').replace(/\/$/, '');
  return `${base}/signup?invite=${encodeURIComponent(token)}`;
}
