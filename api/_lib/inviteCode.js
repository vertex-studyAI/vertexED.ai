import crypto from 'crypto';

const MIN_INVITE_CODE_LENGTH = 24;
const KNOWN_UNSAFE_MARKERS = [
  'vertex2032',
  'change-me',
  'changeme',
  'replace-with',
  'example',
  'your-invite-code',
];

function normalizeCode(value) {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * A shared invite code is a server-side bearer credential. Unsafe
 * configuration disables the team-invite flow instead of silently accepting a
 * checked-in example or a short human-memorable secret.
 */
export function isInviteCodeConfiguredSafely(value = process.env.SIGNUP_INVITE_CODE) {
  const code = normalizeCode(value);
  if (code.length < MIN_INVITE_CODE_LENGTH) return false;

  const lowered = code.toLowerCase();
  return !KNOWN_UNSAFE_MARKERS.some((marker) => lowered.includes(marker));
}

/**
 * Compare invite code to SIGNUP_INVITE_CODE env var (server-only, never expose to client).
 */
export function verifyInviteCode(input) {
  const expected = process.env.SIGNUP_INVITE_CODE;
  const candidate = normalizeCode(input);

  if (!isInviteCodeConfiguredSafely(expected) || !candidate) return false;

  const a = Buffer.from(candidate, 'utf8');
  const b = Buffer.from(expected, 'utf8');

  if (a.length !== b.length) {
    const pad = Buffer.alloc(32);
    crypto.timingSafeEqual(pad, pad);
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}
