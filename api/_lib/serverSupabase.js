import { createClient } from '@supabase/supabase-js';
import { fetchWithTimeout } from './fetchWithTimeout.js';

export const SUPABASE_REQUEST_TIMEOUT_MS = 12_000;

/**
 * Supabase clients used inside short-lived serverless requests must not persist
 * browser sessions or leave upstream HTTP calls unbounded.
 */
export function createServerSupabaseClient(
  url,
  key,
  { clientFactory = createClient, timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS } = {},
) {
  if (!url || !key) throw new Error('Missing Supabase server credentials');

  return clientFactory(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetchWithTimeout(input, init, timeoutMs),
    },
  });
}
