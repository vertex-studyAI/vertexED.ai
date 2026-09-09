import { createServerSupabaseClient, getServerSupabaseConfig } from './serverSupabase.js';

export function getSupabaseAdmin() {
  const { url, key } = getServerSupabaseConfig();
  if (!url || !key) {
    throw new Error('Missing Supabase server URL or service credentials');
  }
  return createServerSupabaseClient(url, key);
}
