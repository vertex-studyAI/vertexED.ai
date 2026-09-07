import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createServerSupabaseClient,
  SUPABASE_REQUEST_TIMEOUT_MS,
} from '../api/_lib/serverSupabase.js';

test('server Supabase clients disable browser session persistence and use bounded fetch', () => {
  let captured;
  const sentinel = {};
  const result = createServerSupabaseClient('https://project.supabase.co', 'server-key', {
    clientFactory(url, key, options) {
      captured = { url, key, options };
      return sentinel;
    },
  });

  assert.equal(result, sentinel);
  assert.equal(captured.url, 'https://project.supabase.co');
  assert.equal(captured.key, 'server-key');
  assert.deepEqual(captured.options.auth, {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  });
  assert.equal(typeof captured.options.global.fetch, 'function');
  assert.equal(SUPABASE_REQUEST_TIMEOUT_MS, 12_000);
});

test('server Supabase client rejects missing credentials before client creation', () => {
  assert.throws(
    () => createServerSupabaseClient('', 'server-key', { clientFactory: () => ({}) }),
    /Missing Supabase server credentials/,
  );
});
