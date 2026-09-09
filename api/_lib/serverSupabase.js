import { createClient } from '@supabase/supabase-js';
import { fetchWithTimeout } from './fetchWithTimeout.js';

export const SUPABASE_REQUEST_TIMEOUT_MS = 12_000;

// Keep readiness and privileged request guards aligned with the client itself.
// This module is server-only. Public browser variables are never secret aliases.
export function getServerSupabaseConfig(env = process.env) {
  const first = (...values) => values.find(value => typeof value === 'string' && value.trim())?.trim();
  return {
    url: first(env.SUPABASE_URL, env.VITE_SUPABASE_URL),
    key: first(env.SUPABASE_SERVICE_ROLE_KEY, env.SUPABASE_SECRET_KEY),
  };
}

export function hasServerSupabaseConfig(env = process.env) {
  const { url, key } = getServerSupabaseConfig(env);
  return Boolean(url && key);
}

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
