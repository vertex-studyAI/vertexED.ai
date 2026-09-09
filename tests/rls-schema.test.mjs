import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import test from 'node:test';

const migrationDirectory = new URL('../supabase/migrations/', import.meta.url);
const migrationFiles = (await readdir(migrationDirectory)).filter((name) => name.endsWith('.sql')).sort();
const schema = (await Promise.all(migrationFiles.map((name) => readFile(new URL(name, migrationDirectory), 'utf8')))).join('\n');
const hardening = await readFile(new URL('../supabase/migrations/20260901173000_security_definer_execute_hardening.sql', import.meta.url), 'utf8');

const publicTables = [...new Set(
  [...schema.matchAll(/create table(?: if not exists)? public\.([a-z_]+)/gi)].map((match) => match[1]),
)];

test('every canonical public table explicitly enables row level security', () => {
  assert.ok(publicTables.length >= 4);
  for (const table of publicTables) {
    assert.match(schema, new RegExp(`alter table public\\.${table} enable row level security`, 'i'), table);
  }
});

test('user-owned tables bind policies to auth.uid', () => {
  for (const table of ['profiles', 'user_study_artifacts']) {
    const policies = schema.match(new RegExp(`create policy[\\s\\S]+?on public\\.${table}[\\s\\S]+?(?=create policy|-- \\u002d|$)`, 'gi')) ?? [];
    assert.ok(policies.length >= 3, `${table} needs CRUD policy coverage`);
    assert.ok(policies.every((policy) => /auth\.uid\(\)/i.test(policy)), `${table} policy must bind auth.uid()`);
  }
});

test('service-only waitlist tables expose no client policies', () => {
  assert.doesNotMatch(schema, /create policy[^\n]+on public\.(waitlist|waitlist_rate_limits)/i);
});

test('security-definer functions pin search_path', () => {
  const definitions = schema.split(/create or replace function/i).slice(1);
  for (const definition of definitions.filter((value) => /security definer/i.test(value))) {
    assert.match(definition, /set search_path\s*=/i);
  }
});

test('API roles cannot directly execute security-definer helpers', () => {
  assert.match(hardening, /revoke execute on function public\.handle_new_user\(\) from public, anon, authenticated/i);
  assert.match(hardening, /revoke all on function public\.auth_email_exists\(text\) from public, anon, authenticated/i);
  assert.match(hardening, /grant execute on function public\.auth_email_exists\(text\) to service_role/i);
});

test('new waitlist invites are digest-only, expiring, and indexed for admin queries', () => {
  assert.match(schema, /add column if not exists invite_token_hash text/i);
  assert.match(schema, /check \(invite_token_hash is null or invite_token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/i);
  assert.match(schema, /invite_expires_at > invite_issued_at/i);
  assert.match(schema, /create unique index if not exists waitlist_invite_token_hash_idx/i);
  assert.match(schema, /create index if not exists waitlist_status_created_at_idx[\s\S]*?\(status, created_at desc\)/i);
});

test('mutable account tables maintain updated_at in the database', () => {
  assert.match(schema, /create or replace function public\.set_vertexed_updated_at\(\)/i);
  for (const table of ['profiles', 'waitlist', 'user_study_artifacts', 'learner_state_items']) {
    assert.match(schema, new RegExp(`before update on public\\.${table}`, 'i'), table);
  }
  assert.match(schema, /revoke all on function public\.set_vertexed_updated_at\(\) from public, anon, authenticated/i);
});
