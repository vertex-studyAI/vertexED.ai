import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const validator = new URL('../scripts/validate-migration-filenames.mjs', import.meta.url);

test('Supabase migration filenames have valid unique versions', () => {
  const output = execFileSync(process.execPath, [validator.pathname], {
    cwd: new URL('..', import.meta.url),
    encoding: 'utf8',
  });

  assert.match(output, /^Validated \d+ Supabase migration filenames \(\d+ unique versions\)\.\n$/);
});
