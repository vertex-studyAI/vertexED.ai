const ARTIFACT_RETURN_FIELDS = 'id, kind, title, created_at, updated_at';
const IDEMPOTENT_ARTIFACT_RETURN_FIELDS = `${ARTIFACT_RETURN_FIELDS}, payload, idempotency_key`;

function canonicalJson(value) {
  if (Array.isArray(value)) return value.map(canonicalJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalJson(value[key])]),
    );
  }
  return value;
}

function sameArtifact(existing, expected) {
  return existing?.kind === expected.kind
    && (existing?.title ?? null) === (expected.title ?? null)
    && JSON.stringify(canonicalJson(existing?.payload)) === JSON.stringify(canonicalJson(expected.payload));
}

export async function createStudyArtifact(
  supabase,
  { userId, kind, title, payload, idempotencyKey = null, updatedAt = new Date().toISOString() },
) {
  const record = {
    user_id: userId,
    kind,
    title,
    payload,
    updated_at: updatedAt,
    ...(idempotencyKey ? { idempotency_key: idempotencyKey } : {}),
  };
  const { data, error } = await supabase
    .from('user_study_artifacts')
    .insert(record)
    .select(IDEMPOTENT_ARTIFACT_RETURN_FIELDS)
    .single();

  if (!error || error.code !== '23505' || !idempotencyKey) {
    return { data, error, created: !error, replayed: false, conflict: false };
  }

  const replay = await supabase
    .from('user_study_artifacts')
    .select(IDEMPOTENT_ARTIFACT_RETURN_FIELDS)
    .eq('user_id', userId)
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (replay.error || !replay.data) {
    return { data: null, error: replay.error || error, created: false, replayed: false, conflict: false };
  }

  return {
    data: replay.data,
    error: null,
    created: false,
    replayed: sameArtifact(replay.data, { kind, title, payload }),
    conflict: !sameArtifact(replay.data, { kind, title, payload }),
  };
}

const SINGLETON_ARTIFACT_KINDS = new Set(['planner', 'notebook']);

export async function replaceSingletonArtifact(
  supabase,
  { userId, kind, title, payload, updatedAt = new Date().toISOString() },
) {
  if (!SINGLETON_ARTIFACT_KINDS.has(kind)) {
    throw new TypeError('Only planner and notebook artifacts can use singleton replacement.');
  }
  const { data: existing, error: lookupError } = await supabase
    .from('user_study_artifacts')
    .select('id')
    .eq('user_id', userId)
    .eq('kind', kind)
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
      kind,
      title,
      payload,
      updated_at: updatedAt,
    })
    .select(ARTIFACT_RETURN_FIELDS)
    .single();
  return { data, error, created: true };
}

export function replacePlannerArtifact(supabase, options) {
  return replaceSingletonArtifact(supabase, { ...options, kind: 'planner' });
}
