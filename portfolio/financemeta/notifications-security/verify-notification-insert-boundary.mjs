#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || '');
if (!target) {
  throw new Error('usage: node verify-notification-insert-boundary.mjs TARGET_FINANCEMETA_CHECKOUT');
}

const migration003 = path.join(target, 'supabase/migrations/003_bookmarks_notifications.sql');
const migration004 = path.join(target, 'supabase/migrations/004_notifications_trigger_only_insert.sql');

for (const file of [migration003, migration004]) {
  if (!fs.existsSync(file)) throw new Error(`missing required file: ${file}`);
}

const source003 = fs.readFileSync(migration003, 'utf8');
const source004 = fs.readFileSync(migration004, 'utf8');

const failures = [];
if (!source003.includes('ON notifications FOR INSERT TO authenticated') || !source003.includes('WITH CHECK (true)')) {
  failures.push('003 no longer matches the observed vulnerable insert policy; re-audit before applying this overlay');
}
if (!source003.includes('SECURITY DEFINER')) {
  failures.push('003 does not prove trigger functions execute as SECURITY DEFINER');
}
if (!source004.includes('DROP POLICY IF EXISTS "System insert notifications" ON public.notifications')) {
  failures.push('004 does not remove the permissive insert policy');
}
if (!source004.includes('REVOKE INSERT ON TABLE public.notifications FROM anon, authenticated')) {
  failures.push('004 does not revoke direct client INSERT privilege');
}
if (/CREATE POLICY[\s\S]*FOR INSERT[\s\S]*WITH CHECK \(true\)/m.test(source004)) {
  failures.push('004 reintroduces a permissive INSERT policy');
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  verified: [
    'observed permissive authenticated INSERT policy exists in 003',
    'trigger functions are SECURITY DEFINER',
    '004 removes permissive INSERT RLS policy',
    '004 revokes anon/authenticated direct INSERT privilege',
  ],
}, null, 2));
