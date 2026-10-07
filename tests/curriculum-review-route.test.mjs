import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('private curriculum API is GET-only, authenticated, admin-gated and no-store', async () => {
  const source = await readFile(new URL('../api/_handlers/curriculum-review.js', import.meta.url), 'utf8');
  assert.match(source, /req\.method !== 'GET' && req\.method !== 'HEAD'/);
  assert.ok(source.indexOf('noStore(res)') < source.indexOf('verifyAuthUser(req, res)'));
  assert.ok(source.indexOf('verifyAuthUser(req, res)') < source.indexOf('requireAdmin(user, res)'));
  assert.ok(source.indexOf('requireAdmin(user, res)') < source.indexOf('loadCurriculumReviewStore()'));
  assert.match(source, /Cache-Control', 'private, no-store/);
  assert.match(source, /canApprove: false/);
  assert.match(source, /canPublish: false/);
  assert.match(source, /canImportToProduction: false/);
});

test('the API and AdminRoute-protected screen are both registered', async () => {
  const [routes, app, page] = await Promise.all([
    readFile(new URL('../api/_lib/routes.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/admin/CurriculumReview.tsx', import.meta.url), 'utf8'),
  ]);
  assert.match(routes, /'curriculum-review'/);
  assert.match(app, /path="admin\/curriculum-review" element={<AdminRoute><CurriculumReview \/><\/AdminRoute>}/);
  assert.match(page, /This surface cannot approve, publish, export or import content\./);
  assert.match(page, /authFetch\('\/api\/curriculum-review\?action=list'\)/);
});
