import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createServerSupabaseClient,
  getServerSupabaseConfig,
  hasServerSupabaseConfig,
  SUPABASE_REQUEST_TIMEOUT_MS,
} from '../api/_lib/serverSupabase.js';

test('server credentials accept documented aliases without promoting public keys', () => {
  assert.deepEqual(getServerSupabaseConfig({ VITE_SUPABASE_URL: 'https://fixture.supabase.co', SUPABASE_SECRET_KEY: ' secret-fixture ' }), {
    url: 'https://fixture.supabase.co', key: 'secret-fixture',
  });
  assert.deepEqual(getServerSupabaseConfig({ SUPABASE_URL: 'https://server.supabase.co', VITE_SUPABASE_URL: 'https://browser.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'legacy-fixture', SUPABASE_SECRET_KEY: 'new-fixture' }), {
    url: 'https://server.supabase.co', key: 'legacy-fixture',
  });
  assert.equal(hasServerSupabaseConfig({ SUPABASE_URL: 'https://fixture.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'public-fixture' }), false);
  assert.equal(hasServerSupabaseConfig({ SUPABASE_URL: ' ', SUPABASE_SECRET_KEY: 'secret-fixture' }), false);
});

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
