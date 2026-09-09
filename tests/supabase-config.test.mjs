import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('local Supabase Auth mirrors the private-beta access and password policy', async () => {
  const config = await readFile(new URL('../supabase/config.toml', import.meta.url), 'utf8');
  assert.match(config, /site_url = "http:\/\/127\.0\.0\.1:8080"/);
  assert.match(config, /\[auth\][\s\S]*?enable_signup = false/);
  assert.match(config, /\[auth\.email\][\s\S]*?enable_signup = false/);
  assert.match(config, /minimum_password_length = 10/);
  assert.match(config, /password_requirements = "lower_upper_letters_digits"/);
});
