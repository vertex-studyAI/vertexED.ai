import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const validator = fileURLToPath(new URL('../scripts/validate-migration-filenames.mjs', import.meta.url));

async function withMigrationFixture(files, assertion) {
  const root = await mkdtemp(path.join(tmpdir(), 'vertexed-migrations-'));
  const migrationsDir = path.join(root, 'supabase', 'migrations');
  await mkdir(migrationsDir, { recursive: true });

  try {
    await Promise.all(
      files.map((name) => writeFile(path.join(migrationsDir, name), '-- fixture\n', 'utf8')),
    );
    await assertion(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

function runValidator(cwd) {
  return execFileSync(process.execPath, [validator], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

test('Supabase migration filenames have valid calendar versions and unique modern timestamps', () => {
  const output = runValidator(fileURLToPath(new URL('..', import.meta.url)));

  assert.match(
    output,
    /^Validated \d+ Supabase migration filenames \(\d+ unique timestamped versions\)\.\n$/,
  );
});

test('legacy 8-digit migrations may legitimately share a date', async () => {
  await withMigrationFixture(
    ['20260903_first.sql', '20260903_second.sql'],
    async (root) => {
      assert.equal(runValidator(root), 'Validated 2 Supabase migration filenames (0 unique timestamped versions).\n');
    },
  );
});

test('invalid calendar dates are rejected', async () => {
  await withMigrationFixture(['20260230_impossible.sql'], async (root) => {
    assert.throws(
      () => runValidator(root),
      (error) => {
        assert.match(String(error.stderr), /20260230_impossible\.sql: migration version '20260230' is not a valid UTC calendar date\/timestamp/);
        return true;
      },
    );
  });
});

test('duplicate 14-digit Supabase timestamps are rejected', async () => {
  await withMigrationFixture(
    ['20260903164601_first.sql', '20260903164601_second.sql'],
    async (root) => {
      assert.throws(
        () => runValidator(root),
        (error) => {
          assert.match(String(error.stderr), /duplicate 14-digit Supabase migration version '20260903164601'/);
          return true;
        },
      );
    },
  );
});
