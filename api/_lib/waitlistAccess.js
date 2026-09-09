/**
 * Waitlist authorization for account creation when no team invite code is provided.
 */

import { normalizeEmail } from './security.js';
import { hashInviteToken } from './inviteToken.js';

export async function getWaitlistEntry(supabase, email) {
  const { data, error } = await supabase
    .from('waitlist')
    .select('id, status, invite_token, invite_token_hash, invite_expires_at')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWaitlistEntryByToken(supabase, token) {
  if (!token || typeof token !== 'string') return null;
  const normalized = token.trim();
  const tokenHash = hashInviteToken(normalized);
  if (!tokenHash) return null;

  const { data: hashed, error: hashedError } = await supabase
    .from('waitlist')
    .select('id, email, status')
    .eq('invite_token_hash', tokenHash)
    .gt('invite_expires_at', new Date().toISOString())
    .maybeSingle();

  if (hashedError) throw hashedError;
  if (hashed) return { ...hashed, tokenStorage: 'hash', inviteTokenHash: tokenHash };

  // Compatibility path for links issued before digest storage was deployed.
  const { data: legacy, error: legacyError } = await supabase
    .from('waitlist')
    .select('id, email, status, invite_token')
    .eq('invite_token', normalized)
    .maybeSingle();

  if (legacyError) throw legacyError;
  return legacy ? { ...legacy, tokenStorage: 'legacy' } : null;
}

/**
 * Resolve an authenticated account's explicit access row. Email matching is a
 * one-time ownership repair only: a row already linked to another Auth user is
 * never usable by the caller, and an unlinked row must be claimed atomically.
 */
export async function getAccountWaitlistEntry(supabase, user) {
  if (!user?.id) return null;

  let { data: entry, error } = await supabase
    .from('waitlist')
    .select('id, status, signup_method, auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  if (entry) return entry;

  const email = normalizeEmail(user.email);
  if (!email) return null;

  ({ data: entry, error } = await supabase
    .from('waitlist')
    .select('id, status, signup_method, auth_user_id')
    .eq('email', email)
    .maybeSingle());
  if (error) throw error;
  if (!entry || (entry.auth_user_id && entry.auth_user_id !== user.id)) return null;
  if (entry.auth_user_id === user.id) return entry;

  const { data: claimed, error: claimError } = await supabase
    .from('waitlist')
    .update({ auth_user_id: user.id, updated_at: new Date().toISOString() })
    .eq('id', entry.id)
    .is('auth_user_id', null)
    .select('id, status, signup_method, auth_user_id')
    .maybeSingle();
  if (claimError) throw claimError;
  if (claimed?.auth_user_id === user.id) return claimed;

  // A concurrent request may have completed the same safe claim.
  const { data: concurrent, error: concurrentError } = await supabase
    .from('waitlist')
    .select('id, status, signup_method, auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle();
  if (concurrentError) throw concurrentError;
  return concurrent ?? null;
}

/**
 * @returns {{ allowed: true, entry?: object } | { allowed: false, status: number, error: string }}
 */
export async function assertWaitlistSignupAllowed(supabase, email, options = {}) {
  const { inviteToken } = options;
  const entry = await getWaitlistEntry(supabase, email);

  const suppliedHash = hashInviteToken(inviteToken?.trim());
  const activeHash = entry?.invite_token_hash
    && entry.invite_expires_at
    && Date.parse(entry.invite_expires_at) > Date.now()
    && suppliedHash === entry.invite_token_hash;
  const activeLegacyToken = entry?.invite_token && entry.invite_token === inviteToken?.trim();
  if (inviteToken && (activeHash || activeLegacyToken)) {
    if (entry.status === 'approved') {
      return { allowed: true, entry };
    }
    return {
      allowed: false,
      status: 403,
      error: 'This invite link is not active yet. Contact support if you were approved recently.',
    };
  }

  if (!entry) {
    return {
      allowed: false,
      status: 403,
      error: 'Enter a valid invite code, or join the waitlist first.',
    };
  }

  if (entry.status === 'pending') {
    return {
      allowed: false,
      status: 403,
      error: 'Your waitlist application is still pending approval.',
    };
  }

  if (entry.status === 'rejected') {
    return {
      allowed: false,
      status: 403,
      error: 'Your waitlist application was not approved.',
    };
  }

  if (entry.status !== 'approved') {
    return {
      allowed: false,
      status: 403,
      error: 'Signup is not available for this email yet.',
    };
  }

  return { allowed: true, entry };
}
