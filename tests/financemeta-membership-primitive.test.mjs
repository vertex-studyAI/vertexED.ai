import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../docs/FINANCEMETA_MEMBERSHIP_PRIMITIVE.sql', import.meta.url), 'utf8');

test('membership primitive is server-owned and browser roles cannot self-enroll', () => {
  assert.match(sql, /create table if not exists public\.financemeta_memberships/i);
  assert.match(sql, /alter table public\.financemeta_memberships enable row level security/i);
  assert.match(sql, /revoke all on table public\.financemeta_memberships from anon, authenticated/i);
  assert.match(sql, /grant select, insert, update, delete on table public\.financemeta_memberships to service_role/i);
  assert.doesNotMatch(sql, /grant\s+(?:select|insert|update|delete|all)[\s\S]*?financemeta_memberships[\s\S]*?to\s+(?:anon|authenticated)/i);
  assert.doesNotMatch(sql, /create policy[\s\S]*?on\s+public\.financemeta_memberships/i);
});

test('membership helper is private, fail-closed, and has a pinned search path', () => {
  assert.match(sql, /create or replace function financemeta_private\.financemeta_is_member\(\)/i);
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = ''/i);
  assert.match(sql, /from public\.financemeta_memberships fm/i);
  assert.match(sql, /fm\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(sql, /fm\.status = 'active'/i);
  assert.match(sql, /revoke execute on function financemeta_private\.financemeta_is_member\(\)[\s\S]*?from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function financemeta_private\.financemeta_is_member\(\)[\s\S]*?to authenticated/i);
});

test('preparation cannot infer or backfill membership from shared-auth artifacts', () => {
  assert.doesNotMatch(sql, /insert\s+into\s+public\.financemeta_memberships/i);
  assert.doesNotMatch(sql, /financemeta_member_profiles[\s\S]*?(?:insert|select)[\s\S]*?financemeta_memberships/i);
  assert.doesNotMatch(sql, /raw_user_meta_data|raw_app_meta_data/i);
  assert.doesNotMatch(sql, /waitlist/i);
});

test('preparation does not mutate current FinanceMeta enrollment trigger or existing policies', () => {
  assert.doesNotMatch(sql, /drop\s+trigger/i);
  assert.doesNotMatch(sql, /financemeta_on_auth_user_created/i);
  assert.doesNotMatch(sql, /financemeta_handle_new_user\s*\(/i);
  assert.doesNotMatch(sql, /drop\s+policy/i);
  assert.doesNotMatch(sql, /alter\s+policy/i);
});
