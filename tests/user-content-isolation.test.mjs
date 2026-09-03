import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('api/_handlers/user-content.js', 'utf8');

test('user-content rejects unauthenticated access before service-role database work', () => {
  const authIndex = source.indexOf('await verifyAuthUser(req, res)');
  const adminIndex = source.indexOf('getSupabaseAdmin()');

  assert.ok(authIndex >= 0, 'verifyAuthUser must be called');
  assert.ok(adminIndex >= 0, 'service-role client must be initialized');
  assert.ok(authIndex < adminIndex, 'authentication must happen before service-role access');
});

test('user-content reads are scoped to the verified auth user', () => {
  assert.match(
    source,
    /from\('user_study_artifacts'\)[\s\S]*?\.select\([\s\S]*?\)[\s\S]*?\.eq\('user_id', user\.id\)[\s\S]*?\.order\(/,
  );
});

test('user-content creates derive ownership and idempotency from verified request state', () => {
  assert.match(source, /createStudyArtifact\(supabase, \{[\s\S]*?userId:\s*user\.id,[\s\S]*?idempotencyKey,/);
  assert.doesNotMatch(source, /user_id:\s*body(?:\.|\[)/);
});

test('user-content updates require both artifact id and verified user ownership', () => {
  assert.match(
    source,
    /\.update\(updates\)[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', user\.id\)[\s\S]*?\.select\(/,
  );
});

test('user-content deletes require both artifact id and verified user ownership', () => {
  const deleteBranch = source.slice(source.lastIndexOf("if (req.method === 'DELETE')"));
  assert.match(
    deleteBranch,
    /from\('user_study_artifacts'\)[\s\S]*?\.delete\(\)[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', user\.id\)/,
  );
});

test('planner and notebook replacement delegate to the non-destructive owner-scoped helper', () => {
  const postStart = source.indexOf("if (req.method === 'POST')");
  const putStart = source.indexOf("if (req.method === 'PUT'", postStart);
  const postBranch = source.slice(postStart, putStart);

  assert.ok(postStart >= 0 && putStart > postStart, 'POST branch must be present');
  assert.match(
    postBranch,
    /\(kind === 'planner' \|\| kind === 'notebook'\) && body\?\.replace === true[\s\S]*?replaceSingletonArtifact\(supabase, \{[\s\S]*?userId:\s*user\.id,[\s\S]*?kind,/,
  );
  assert.doesNotMatch(postBranch, /\.delete\(\)/, 'planner replacement must not delete the prior snapshot before the replacement write succeeds');
});
