import { createHash } from 'node:crypto';

// Conservative exact matching. Do not infer campuses or expose applications.
export function schoolIdentity(school, country) {
  const normalize = value => value.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
  return createHash('sha256').update(JSON.stringify([normalize(country), normalize(school)])).digest('hex');
}

export async function resolveSchool(supabase, profile) {
  if (!profile.school) return null;
  const identity_key = schoolIdentity(profile.school, profile.country);
  const { error } = await supabase.from('schools').upsert({
    identity_key, name: profile.school, country: profile.country,
  }, { onConflict: 'identity_key', ignoreDuplicates: true });
  if (error) throw error;
  const result = await supabase.from('schools').select('id').eq('identity_key', identity_key).single();
  if (result.error) throw result.error;
  return result.data.id;
}
