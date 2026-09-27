import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { prepareDatabaseReplay, verifyReplayTarget } from '../scripts/prepare-database-replay.mjs';

function fixture(fn) {
  const root = mkdtempSync(join(tmpdir(), 'vertexed-replay-'));
  const source = join(root, 'source');
  mkdirSync(join(source, 'supabase', 'migrations'), { recursive: true });
  mkdirSync(join(source, 'supabase', 'tests'), { recursive: true });
  writeFileSync(join(source, 'supabase/tests/example.sql'), 'select plan(1);\n');
  writeFileSync(join(source, 'supabase', 'config.toml'), 'project_id = "VertexED"\n[db]\nport = 54322\n');
  writeFileSync(join(source, 'supabase', 'migrations', '20260709_a.sql'), '-- exact bytes\n');
  writeFileSync(join(source, 'supabase', 'migrations', '20260709_b.sql'), '-- second\n');
  try { fn({ root, source, destination: join(root, 'replay'), projectId: 'vertexed-test-unit', portBase: 55320 }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test('local replay normalises duplicate legacy dates without altering SQL or source', () => fixture(options => {
  const result = prepareDatabaseReplay(options);
  assert.equal(result.migrations.length, 2);
  assert.equal(readFileSync(join(options.destination, 'supabase/migrations/20260709000000_a.sql'), 'utf8'), '-- exact bytes\n');
  assert.equal(readFileSync(join(options.source, 'supabase/migrations/20260709_a.sql'), 'utf8'), '-- exact bytes\n');
  assert.match(readFileSync(join(options.destination, 'supabase/config.toml'), 'utf8'), /port = 55322/);
  assert.equal(verifyReplayTarget(options.destination), options.destination);
  assert.throws(() => prepareDatabaseReplay(options), /already exists/);
}));

test('replay rejects missing and modified SQL acceptance tests', () => fixture(options => {
  prepareDatabaseReplay(options);
  writeFileSync(join(options.destination, 'supabase/tests/example.sql'), 'select plan(0);\n');
  assert.throws(() => verifyReplayTarget(options.destination), /SQL test changed/);
  rmSync(join(options.destination, 'supabase/tests/example.sql'));
  assert.throws(() => verifyReplayTarget(options.destination), /test inventory/);
}));

test('replay refuses version collisions and unsafe project identities', () => fixture(options => {
  assert.throws(() => prepareDatabaseReplay({ ...options, projectId: 'production' }), /unique vertexed-test/);
  writeFileSync(join(options.source, 'supabase/migrations/20260709000000_collision.sql'), '-- collision');
  assert.throws(() => prepareDatabaseReplay(options), /collision/);
}));

test('reset guard rejects changed migrations, missing target and remote linking', () => fixture(options => {
  assert.throws(() => verifyReplayTarget(), /prepared disposable/);
  prepareDatabaseReplay(options);
  const migration = join(options.destination, 'supabase/migrations/20260709000000_a.sql');
  writeFileSync(migration, '-- changed');
  assert.throws(() => verifyReplayTarget(options.destination), /migration changed/);
  writeFileSync(migration, '-- exact bytes\n');
  mkdirSync(join(options.destination, 'supabase/.temp'));
  writeFileSync(join(options.destination, 'supabase/.temp/project-ref'), 'remote');
  assert.throws(() => verifyReplayTarget(options.destination), /linked to a remote/);
}));
