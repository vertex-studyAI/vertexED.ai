import crypto from 'crypto';

function normalizeCode(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Compare invite code to SIGNUP_INVITE_CODE env var (server-only, never expose to client).
 */
export function verifyInviteCode(input) {
  const expected = process.env.SIGNUP_INVITE_CODE;
  const candidate = normalizeCode(input);

  if (!expected || !candidate) return false;

  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(expected, 'utf8');

  if (a.length !== b.length) {
    const pad = Buffer.alloc(32);
    crypto.timingSafeEqual(pad, pad);
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}
