/**
 * Waitlist authorization for account creation when no team invite code is provided.
 */

export async function getWaitlistEntry(supabase, email) {
  const { data, error } = await supabase
    .from('waitlist')
    .select('id, status, invite_token')
    .eq('email', email)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWaitlistEntryByToken(supabase, token) {
  if (!token || typeof token !== 'string') return null;
  const { data, error } = await supabase
    .from('waitlist')
    .select('id, email, status, invite_token')
    .eq('invite_token', token.trim())
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * @returns {{ allowed: true, entry?: object } | { allowed: false, status: number, error: string }}
 */
export async function assertWaitlistSignupAllowed(supabase, email, options = {}) {
  const { inviteToken } = options;
  const entry = await getWaitlistEntry(supabase, email);

  if (inviteToken && entry?.invite_token && entry.invite_token === inviteToken.trim()) {
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
