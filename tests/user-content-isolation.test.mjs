import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('api/_handlers/user-content.js', 'utf8');

test('user-content authenticates before service-role access', () => {
  const authIndex = source.indexOf('await verifyAuthUser(req, res)');
  const adminIndex = source.indexOf('getSupabaseAdmin()');
  assert.ok(authIndex >= 0 && adminIndex >= 0);
  assert.ok(authIndex < adminIndex);
});

test('user-content reads and inserts use the verified user id', () => {
  assert.match(source, /from\('user_study_artifacts'\)[\s\S]*?\.select\([\s\S]*?\)[\s\S]*?\.eq\('user_id', user\.id\)[\s\S]*?\.order\(/);
  assert.match(source, /\.insert\(\{[\s\S]*?user_id:\s*user\.id,[\s\S]*?kind,/);
  assert.doesNotMatch(source, /user_id:\s*body(?:\.|\[)/);
});

test('user-content update and delete require both id and verified ownership', () => {
  assert.match(source, /\.update\(updates\)[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', user\.id\)[\s\S]*?\.select\(/);
  const deleteBranch = source.slice(source.lastIndexOf("if (req.method === 'DELETE')"));
  assert.match(deleteBranch, /\.delete\(\)[\s\S]*?\.eq\('id', id\)[\s\S]*?\.eq\('user_id', user\.id\)/);
});

test('planner replacement deletes only the current user planner rows', () => {
  const start = source.indexOf("kind === 'planner' && body?.replace === true");
  const end = source.indexOf('.insert({', start);
  assert.ok(start >= 0 && end > start);
  assert.match(source.slice(start, end), /\.delete\(\)[\s\S]*?\.eq\('user_id', user\.id\)[\s\S]*?\.eq\('kind', 'planner'\)/);
});
