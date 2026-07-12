#!/usr/bin/env node
/**
 * Apply Supabase cloud-sync schema and verify the table is reachable.
 *
 * Option A — Supabase access token (recommended):
 *   SUPABASE_ACCESS_TOKEN=sbp_... npm run db:cloud-sync
 *
 * Option B — paste supabase/apply_cloud_sync.sql in the SQL editor:
 *   https://supabase.com/dashboard/project/<ref>/sql/new
 *
 * Then set on Vercel (Production + Preview):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY
 *   VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SQL_PATH = path.join(ROOT, 'supabase/apply_cloud_sync.sql');
const DEFAULT_REF = 'xwlrzgfuhfbckgvcmyoq';

const projectRef = process.env.SUPABASE_PROJECT_REF || DEFAULT_REF;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const supabaseUrl =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || `https://${projectRef}.supabase.co`;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function applyViaManagementApi(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || body?.error || `Management API ${res.status}`);
  }
  return body;
}

async function verifyTable() {
  if (!anonKey) {
    console.log('Skip verify: set SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY to probe REST.');
    return;
  }
  const res = await fetch(`${supabaseUrl}/rest/v1/user_study_artifacts?select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (res.status === 404 || res.status === 406) {
    throw new Error('user_study_artifacts table not found — run the SQL migration first.');
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`REST probe failed (${res.status}): ${text.slice(0, 200)}`);
  }
  console.log('✓ user_study_artifacts is reachable via Supabase REST');
}

async function main() {
  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  console.log(`Project: ${projectRef}`);
  console.log(`SQL file: ${path.relative(ROOT, SQL_PATH)}`);

  if (accessToken) {
    console.log('Applying migration via Supabase Management API…');
    await applyViaManagementApi(sql);
    console.log('✓ Migration applied');
  } else {
    console.log('\nNo SUPABASE_ACCESS_TOKEN set.');
    console.log('Create one at: https://supabase.com/dashboard/account/tokens');
    console.log(`Then run: SUPABASE_ACCESS_TOKEN=sbp_... npm run db:cloud-sync`);
    console.log('\nOr paste the SQL file manually:');
    console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`);
    process.exitCode = 1;
    return;
  }

  await verifyTable();

  console.log('\nVercel env still required for production API routes:');
  console.log('  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY');
  console.log('  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  console.log('Get service_role from: Supabase → Project Settings → API');
}

main().catch((err) => {
  console.error('Cloud sync setup failed:', err.message || err);
  process.exitCode = 1;
});
