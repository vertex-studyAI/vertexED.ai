const ARTIFACT_RETURN_FIELDS = 'id, kind, title, created_at, updated_at';

export async function replacePlannerArtifact(
  supabase,
  { userId, title, payload, updatedAt = new Date().toISOString() },
) {
  const { data: existing, error: lookupError } = await supabase
    .from('user_study_artifacts')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', 'planner')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lookupError) {
    return { data: null, error: lookupError, created: false };
  }

  if (existing?.id) {
    const { data, error } = await supabase
      .from('user_study_artifacts')
      .update({ title, payload, updated_at: updatedAt })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select(ARTIFACT_RETURN_FIELDS)
      .single();
    return { data, error, created: false };
  }

  const { data, error } = await supabase
    .from('user_study_artifacts')
    .insert({
      user_id: userId,
      kind: 'planner',
      title,
      payload,
      updated_at: updatedAt,
    })
    .select(ARTIFACT_RETURN_FIELDS)
    .single();
  return { data, error, created: true };
}
