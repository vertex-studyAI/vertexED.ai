import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { verifyReplayTarget } from './prepare-database-replay.mjs';

// Refuse an implicit target or a remotely linked directory before any reset.
const target = verifyReplayTarget(process.env.VERTEXED_TEST_DB_WORKDIR);
const cli = resolve('node_modules/.bin/supabase');
function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited ${result.status ?? 'without a status'}`);
}
run(cli, ['db', 'reset', '--local', '--no-seed', '--workdir', target]);
// Lint the migrated application before installing pgTAP's test-only functions,
// which deliberately reference per-test temporary tables. Keep the error gate.
run(cli, ['db', 'lint', '--local', '--level', 'warning', '--fail-on', 'error', '--workdir', target]);

// Copy tests instead of relying on Docker mounting the source drive.
const { projectId } = JSON.parse(readFileSync(resolve(target, 'replay-manifest.json'), 'utf8'));
const database = `supabase_db_${projectId}`;
const runner = `vertexed-pgtap-${randomUUID()}`;
const image = 'public.ecr.aws/supabase/pg_prove:3.36@sha256:eda7c5e68719e9c8287e78c017118407b48df904a51c935f5ab6098b8c0bc6bc';
run('docker', ['exec', database, 'psql', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-c',
  'create extension if not exists pgtap with schema extensions']);
let created = false;
try {
  run('docker', ['create', '--name', runner, '--network', `container:${database}`,
    '-e', 'PGPASSWORD=postgres', '-e', 'PGOPTIONS=-c search_path=public,extensions', image,
    'pg_prove', '--host', '127.0.0.1', '--port', '5432', '--username', 'postgres', '--dbname', 'postgres', '--recurse', '--ext', '.sql', '/tests']);
  created = true;
  run('docker', ['cp', `${resolve(target, 'supabase/tests')}/.`, `${runner}:/tests`]);
  run('docker', ['start', '--attach', runner]);
} finally {
  if (created) run('docker', ['rm', runner]);
}
