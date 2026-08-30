import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const script = path.resolve(
  'portfolio/financemeta/authorization-hardening/apply-authorization-hardening.mjs',
);

function fixture() {
  const root = mkdtempSync(path.join(tmpdir(), 'financemeta-auth-'));
  mkdirSync(path.join(root, 'supabase/migrations'), { recursive: true });
  mkdirSync(path.join(root, 'src/contexts'), { recursive: true });
  writeFileSync(
    path.join(root, 'supabase/migrations/001_initial_schema.sql'),
    'CREATE TYPE user_role AS ENUM (\'member\', \'admin\');\nCREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);\n',
  );
  writeFileSync(path.join(root, 'supabase/migrations/002_google_oauth.sql'), '-- oauth\n');
  writeFileSync(
    path.join(root, 'supabase/migrations/003_bookmarks_notifications.sql'),
    'CREATE POLICY "System insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);\n',
  );
  writeFileSync(
    path.join(root, 'src/contexts/AuthContext.tsx'),
    'const updateProfile = useCallback(async () => {});\n',
  );
  return root;
}

function run(target) {
  return spawnSync(process.execPath, [script, target], { encoding: 'utf8' });
}

test('FinanceMeta hardening generator writes only after canonical source preflight passes', () => {
  const root = fixture();
  try {
    const result = run(root);
    assert.equal(result.status, 0, result.stderr);
    const migration = readFileSync(
      path.join(root, 'supabase/migrations/004_authorization_hardening.sql'),
      'utf8',
    );
    assert.match(migration, /REVOKE INSERT, UPDATE ON TABLE public\.profiles/);
    assert.match(migration, /REVOKE INSERT ON TABLE public\.notifications/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('FinanceMeta hardening generator fails closed when notification policy shape drifts', () => {
  const root = fixture();
  try {
    writeFileSync(
      path.join(root, 'supabase/migrations/003_bookmarks_notifications.sql'),
      '-- notification policy was changed upstream\n',
    );
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /canonical source shape drifted/);
    assert.match(result.stderr, /003 direct notification insert policy/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('FinanceMeta hardening generator identifies missing canonical inputs', () => {
  const root = fixture();
  try {
    rmSync(path.join(root, 'supabase/migrations/002_google_oauth.sql'));
    const result = run(root);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /missing required canonical files/);
    assert.match(result.stderr, /002_google_oauth\.sql/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
