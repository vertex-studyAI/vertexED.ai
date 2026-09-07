export async function createApprovedWaitlistUser(
  supabase,
  { inviteEntry, inviteToken, password, username, updatedAt = new Date().toISOString() },
) {
  if (!inviteEntry?.id || !inviteEntry?.email || !inviteToken) {
    return { data: null, error: new Error('Invalid approved invite context.'), stage: 'validation' };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: inviteEntry.email,
    password,
    email_confirm: true,
    user_metadata: { username },
  });

  if (error) {
    return { data: null, error, stage: 'create' };
  }

  const userId = data?.user?.id;
  if (!userId) {
    return { data: null, error: new Error('Account provider returned no user id.'), stage: 'create' };
  }

  const { data: finalized, error: finalizeError } = await supabase
    .from('waitlist')
    .update({
      auth_user_id: userId,
      invite_token: null,
      updated_at: updatedAt,
    })
    .eq('id', inviteEntry.id)
    .eq('invite_token', inviteToken)
    .eq('status', 'approved')
    .select('id')
    .maybeSingle();

  if (finalizeError || !finalized) {
    const { error: rollbackError } = await supabase.auth.admin.deleteUser(userId);
    return {
      data: null,
      error: finalizeError || new Error('Invite finalization lost ownership.'),
      rollbackError: rollbackError || null,
      stage: 'finalize',
    };
  }

  return { data, error: null, rollbackError: null, stage: 'complete' };
}

async function rollbackInvitedUser(supabase, userId) {
  if (!userId) return null;
  const { error } = await supabase.auth.admin.deleteUser(userId);
  return error ?? null;
}

/**
 * Send a mailbox-verifying team invitation and persist its authorization row.
 * A Supabase invite creates the Auth user before the recipient accepts it, so a
 * database failure must remove that incomplete identity instead of leaving an
 * orphan that could depend on implicit access fallback behavior.
 */
export async function createTeamInvitedUser(
  supabase,
  { email, username, redirectTo, updatedAt = new Date().toISOString() },
) {
  const invited = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { username },
    redirectTo,
  });
  if (invited.error) {
    return { data: null, error: invited.error, rollbackError: null, stage: 'invite' };
  }

  const userId = invited.data?.user?.id;
  if (!userId) {
    return {
      data: null,
      error: new Error('Account provider returned no invited user id.'),
      rollbackError: null,
      stage: 'invite',
    };
  }

  const existing = await supabase
    .from('waitlist')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (existing.error) {
    return {
      data: null,
      error: existing.error,
      rollbackError: await rollbackInvitedUser(supabase, userId),
      stage: 'finalize',
    };
  }

  const authorization = existing.data?.id
    ? await supabase
        .from('waitlist')
        .update({
          status: 'approved',
          signup_method: 'email',
          auth_user_id: userId,
          invite_token: null,
          legacy_access: false,
          updated_at: updatedAt,
        })
        .eq('id', existing.data.id)
        .select('id')
        .maybeSingle()
    : await supabase
        .from('waitlist')
        .insert({
          email,
          status: 'approved',
          signup_method: 'email',
          auth_user_id: userId,
          invite_token: null,
          legacy_access: false,
          updated_at: updatedAt,
        })
        .select('id')
        .maybeSingle();

  if (authorization.error || !authorization.data) {
    return {
      data: null,
      error: authorization.error || new Error('Team invitation authorization was not persisted.'),
      rollbackError: await rollbackInvitedUser(supabase, userId),
      stage: 'finalize',
    };
  }

  return {
    data: invited.data,
    error: null,
    rollbackError: null,
    stage: 'complete',
  };
}
