#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { buildQualityReport } from '../api/_lib/qualityReport.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gates = JSON.parse(await readFile(resolve(root, 'evals/pilot/gates-v1.json'), 'utf8'));
const daysArg = process.argv.find((value) => value.startsWith('--days='));
const days = daysArg ? Number(daysArg.slice('--days='.length)) : 14;

if (!Number.isInteger(days) || days < 1 || days > 90) {
  console.error('Use --days=N where N is between 1 and 90.');
  process.exit(2);
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.');
  process.exit(2);
}

const from = new Date(Date.now() - days * 86_400_000).toISOString();
const limit = 10_000;
const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data, error } = await supabase
  .from('observability_events')
  .select('event_type,capability,outcome,feedback,received_at')
  .gte('received_at', from)
  .order('received_at', { ascending: true })
  .limit(limit);

if (error) {
  console.error(`Unable to read observability events (${error.code || 'database_error'}).`);
  process.exit(1);
}

const report = buildQualityReport(data, gates, { truncated: (data?.length ?? 0) === limit });
console.log(JSON.stringify({ windowDays: days, from, ...report }, null, 2));
if (report.status === 'FAIL') process.exitCode = 1;
