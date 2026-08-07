import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const accountSource = fs.readFileSync('api/_handlers/account.js', 'utf8');
const routesSource = fs.readFileSync('api/_lib/routes.js', 'utf8');

test('account deletion is authenticated, rate-limited, and routed only through DELETE', () => {
  assert.match(accountSource, /verifyAuthUser\(req, res\)/);
  assert.match(accountSource, /rateLimitUserEndpoint\(user\.id, 'account-delete', res\)/);
  assert.match(routesSource, /account:\s*\{[\s\S]*?methods: \['DELETE'\]/);
});

test('account deletion removes auth identity before any manual learner-data cleanup', () => {
  assert.match(accountSource, /supabase\.auth\.admin\.deleteUser\(user\.id\)/);
  assert.doesNotMatch(accountSource, /from\(['"]user_study_artifacts['"]\)\.delete/);
  assert.doesNotMatch(accountSource, /from\(['"]profiles['"]\)\.delete/);
  assert.doesNotMatch(accountSource, /\.delete\(\)\.eq\(['"]user_id['"], user\.id\)/);
});

test('failed identity deletion does not report account deletion success', () => {
  assert.match(accountSource, /if \(error\) \{[\s\S]*?return res\.status\(500\)/);
  assert.match(accountSource, /return res\.status\(200\)\.json\(\{ ok: true \}\)/);
});
