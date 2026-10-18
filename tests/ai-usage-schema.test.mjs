import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const migration = await readFile(new URL('../supabase/migrations/20261016123000_ai_usage_service_only.sql', import.meta.url), 'utf8');
const sql = migration.replace(/--[^\n]*/g, '');
const pgTap = await readFile(new URL('../supabase/tests/database/ai_usage.test.sql', import.meta.url), 'utf8');
const functions = new Map([...sql.matchAll(/create or replace function public\.([a-z_]+)\(([\s\S]*?)\)\s*returns jsonb([\s\S]*?)as \$\$([\s\S]*?)\$\$;/g)]
  .map((match) => [match[1], { args: match[2], settings: match[3], body: match[4] }]));
const signatures = [
  ['read_ai_usage', 'uuid,bigint,bigint,integer,integer'],
  ['reserve_ai_usage', 'uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer'],
  ['mark_ai_usage_dispatched', 'uuid,uuid'],
  ['settle_ai_usage', 'uuid,uuid,text,bigint'],
];

test('AI usage RPCs expose only the agreed typed service interface with invoker rights', () => {
  assert.deepEqual([...functions.keys()].sort(), signatures.map(([name]) => name).sort());
  for (const [name, signature] of signatures) {
    const fn = functions.get(name);
    const types = fn.args.split(',').map((arg) => arg.trim().split(/\s+/)[1]).join(',');
    assert.equal(types, signature, name);
    assert.match(fn.settings, /security invoker/);
    assert.match(fn.settings, /set search_path = ''/);
    assert.match(fn.settings, /set timezone = 'UTC'/);
    assert.ok(sql.includes(`revoke all on function public.${name}(${signature}) from public, anon, authenticated;`));
    assert.ok(sql.includes(`grant execute on function public.${name}(${signature}) to service_role;`));
  }
  assert.doesNotMatch(sql, /security definer|grant execute[^;]+to (?:public|anon|authenticated)/i);
});

test('ledger is forced RLS, has no browser policy and revokes table plus column grants', () => {
  assert.match(sql, /alter table public\.ai_usage_reservations enable row level security/);
  assert.match(sql, /alter table public\.ai_usage_reservations force row level security/);
  assert.match(sql, /revoke all on table public\.ai_usage_reservations from public, anon, authenticated, service_role/);
  assert.match(sql, /revoke all privileges \(%I\) on table public\.ai_usage_reservations from public, anon, authenticated, service_role/);
  assert.match(sql, /grant select, insert, update on table public\.ai_usage_reservations to service_role/);
  assert.doesNotMatch(sql, /create policy|grant (?:all|delete|truncate)[^;]+to service_role/i);
});

test('integer money and hard policy ceilings cannot become caller-defined unlimited budgets', () => {
  const read = functions.get('read_ai_usage').body;
  assert.match(sql, /reserved_microusd bigint not null check \(reserved_microusd between 1 and 1000000\)/);
  assert.match(sql, /charged_microusd bigint not null default 0 check \(charged_microusd between 0 and reserved_microusd\)/);
  assert.match(read, /p_account_limit_microusd not between 0 and 1000000/);
  assert.match(read, /p_project_limit_microusd not between 0 and 10000000/);
  assert.match(read, /p_account_concurrency not between 1 and 2/);
  assert.match(read, /p_project_concurrency not between 1 and 8/);
  assert.match(functions.get('reserve_ai_usage').body, /v_project_used \+ v_project_reserved \+ p_reserved_microusd > p_project_limit_microusd/);
  assert.doesNotMatch(sql, /(?:microusd\s+(?:numeric|real|double precision)|\b(?:NaN|Infinity)\b)/i);
});

test('all admitted transitions serialize project before account and bind operation identity', () => {
  for (const name of ['read_ai_usage', 'mark_ai_usage_dispatched', 'settle_ai_usage']) {
    const body = functions.get(name).body;
    const globalLock = body.indexOf("pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:project'");
    const accountLock = body.indexOf("pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:account:'");
    assert.ok(globalLock >= 0 && accountLock > globalLock, name);
  }
  const reserve = functions.get('reserve_ai_usage').body;
  assert.ok(reserve.indexOf('v_usage := public.read_ai_usage(') < reserve.indexOf('select * into v_existing'));
  assert.match(reserve, /where account_hash = v_account_hash and operation_hash = v_hash for update/);
  for (const field of ['request_fingerprint', 'capability', 'provider', 'model', 'policy_version', 'reserved_microusd']) assert.ok(reserve.includes(`v_existing.${field} = p_${field}`));
  assert.match(reserve, /if found then[\s\S]+?'allowed', false[\s\S]+?end if;[\s\S]+?insert into/);
  assert.match(functions.get('mark_ai_usage_dispatched').body, /if v_row\.state <> 'reserved' then[\s\S]+?'allowed', false/);
});

test('lease expiry and UTC rollover cannot refund unresolved exposure or reset live capacity', () => {
  const read = functions.get('read_ai_usage').body;
  assert.match(read, /where usage_day = v_day or state in \('reserved', 'dispatched', 'uncertain'\)/);
  assert.match(read, /usage_day < v_day and state in \('reserved', 'dispatched', 'uncertain'\)/);
  for (const field of ['account_carried_reserved_microusd', 'account_uncertain_count', 'account_capacity_blocked']) assert.ok(read.includes(`'${field}'`));
  assert.doesNotMatch(read, /expires_at|delete from|update public/);
  const mark = functions.get('mark_ai_usage_dispatched').body;
  assert.match(mark, /v_row\.expires_at <= pg_catalog\.clock_timestamp\(\)/);
  assert.match(mark, /v_row\.usage_day <> \(pg_catalog\.clock_timestamp\(\) at time zone 'UTC'\)::date/);
  assert.match(mark, /'reason', 'reservation_expired'/);
  const settle = functions.get('settle_ai_usage').body;
  assert.match(settle, /p_outcome = 'released' and v_row\.state <> 'reserved'/);
  assert.match(settle, /when p_outcome = 'failed' then v_row\.reserved_microusd/);
  assert.match(settle, /case when p_outcome = 'uncertain' then v_row\.reserved_microusd else 0 end/);
  assert.doesNotMatch(sql, /delete from public\.ai_usage_reservations|truncate public\.ai_usage_reservations/);
});

test('privacy deletion removes ownership while pseudonymous tombstones prevent same-UUID quota reset', () => {
  assert.match(sql, /user_id uuid references auth\.users\(id\) on delete set null/);
  assert.match(sql, /account_hash text not null check/);
  assert.match(sql, /unique \(account_hash, operation_hash\)/);
  assert.match(functions.get('read_ai_usage').body, /from public\.ai_usage_reservations where account_hash = v_account_hash/);
  assert.match(sql, /sha256\(pg_catalog\.convert_to\(p_user_id::text, 'UTF8'\)\)/);
  assert.match(sql, /sha256\(pg_catalog\.convert_to\(p_operation_id, 'UTF8'\)\)/);
  assert.doesNotMatch(sql, /\b(?:prompt|response|operation_id)\s+(?:text|jsonb)\b/);
  assert.match(pgTap, /same UUID recreation retains current-day spent quota/);
  assert.match(pgTap, /same UUID recreation retains current-day uncertain quota/);
  assert.match(pgTap, /old pseudonymous rows are excluded from live-owner export/);
});
