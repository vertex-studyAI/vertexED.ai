import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import accountExportHandler from '../api/_handlers/account-export.js';
import { buildAccountExport, listAllOwnedRows } from '../api/_lib/accountExport.js';
import { createMocks } from './helpers/mock-http.mjs';

test('account export includes owned study data but excludes auth secrets and invite tokens', () => {
  const result = buildAccountExport({
    user: {
      id: 'user-1', email: 'learner@example.com', created_at: '2026-01-01',
      user_metadata: { username: 'learner' }, app_metadata: { admin: true },
      identities: [{ provider: 'email', identity_data: { token: 'secret' } }],
    },
    profile: { id: 'user-1', full_name: 'Learner' },
    waitlist: { id: 'wait-1', status: 'approved' },
    studyArtifacts: [{ id: 'artifact-1' }],
    learnerState: [{ state_key: 'algebra' }],
    exportedAt: '2026-09-06T00:00:00.000Z',
  });
  assert.equal(result.complete, true);
  assert.equal(result.counts.studyArtifacts, 1);
  assert.deepEqual(result.account.providers, ['email']);
  assert.equal('appMetadata' in result.account, false);
  assert.equal(JSON.stringify(result).includes('"token":"secret"'), false);
  assert.equal(JSON.stringify(result).includes('"admin":true'), false);
  assert.equal(JSON.stringify(result).includes('invite_token'), false);
});

test('account export pagination exhausts every page and fails instead of truncating', async () => {
  const dataset = Array.from({ length: 5 }, (_, id) => ({ id }));
  const query = () => ({ range: async (from, to) => ({ data: dataset.slice(from, to + 1), error: null }) });
  assert.deepEqual(await listAllOwnedRows(query, { pageSize: 2, maxRows: 6 }), dataset);
  await assert.rejects(
    () => listAllOwnedRows(query, { pageSize: 2, maxRows: 4 }),
    (error) => error?.code === 'EXPORT_ROW_LIMIT',
  );
});

test('account export endpoint requires authentication and is GET-only', async () => {
  const unauthenticated = createMocks({ method: 'GET' });
  await accountExportHandler(unauthenticated.req, unauthenticated.res);
  assert.equal(unauthenticated.getStatus(), 401);

  const wrongMethod = createMocks({ method: 'POST' });
  await accountExportHandler(wrongMethod.req, wrongMethod.res);
  assert.equal(wrongMethod.getStatus(), 405);
});

test('client export collects an explicit account-scoped key set', () => {
  const source = fs.readFileSync('src/lib/accountExport.ts', 'utf8');
  assert.match(source, /userContentStorageKeys\(scope\)/);
  assert.match(source, /TRANSIENT_FIELDS/);
  assert.doesNotMatch(source, /for \(let .*localStorage\.length/);
});
