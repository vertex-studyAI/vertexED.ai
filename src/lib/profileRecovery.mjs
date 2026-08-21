function firstNonEmptyString(...values) {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

export function getProfileIdentityFields(user, metadata = {}) {
  return {
    email: typeof user?.email === 'string' && user.email.trim() ? user.email.trim() : null,
    fullName: firstNonEmptyString(
      metadata?.full_name,
      user?.user_metadata?.full_name,
      user?.user_metadata?.name,
    ),
    avatarUrl: firstNonEmptyString(
      metadata?.avatar_url,
      user?.user_metadata?.avatar_url,
    ),
  };
}

export function buildProfileUpdate(user, metadata = {}, updatedAt = new Date().toISOString()) {
  const fields = getProfileIdentityFields(user, metadata);
  const update = { updated_at: updatedAt };

  if (fields.email) update.email = fields.email;
  // Preserve learner-edited values when Auth metadata is absent or blank.
  if (fields.fullName) update.full_name = fields.fullName;
  if (fields.avatarUrl) update.avatar_url = fields.avatarUrl;

  return update;
}

export function buildMissingProfileInsert(user, metadata = {}, updatedAt = new Date().toISOString()) {
  const fields = getProfileIdentityFields(user, metadata);
  return {
    id: user.id,
    email: fields.email,
    full_name: fields.fullName || 'Learner',
    avatar_url: fields.avatarUrl,
    updated_at: updatedAt,
  };
}
