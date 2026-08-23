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
