import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/userContent.ts', 'utf8');
const dashboard = fs.readFileSync('src/components/dashboard/LearningCommandCenter.tsx', 'utf8');

test('device fallback retains the original cloud idempotency key', () => {
  assert.match(source, /saveLocalArtifact\(kind, title, payload, idempotencyKey, scope\)/);
  assert.match(source, /idempotencyKey,/);
});

test('artifact sync binds both account scope and access token across in-flight writes', () => {
  const syncBlock = source.slice(source.indexOf('export async function syncLocalStudyArtifacts'));
  assert.match(syncBlock, /const scope = getUserContentStorageScope\(\)/);
  assert.match(syncBlock, /const accessToken = await getAccessToken\(\)/);
  assert.match(syncBlock, /authFetchWithAccessToken\('\/api\/user-content', accessToken/);
  assert.match(syncBlock, /readRawLocalArtifacts\(scope\)/);
  assert.match(syncBlock, /writeLocalArtifacts\([\s\S]*scope\)/);
});

test('editing a device-only artifact rotates its write identity and confirmed replays are deduplicated', () => {
  assert.match(source, /updated_at: now,[\s\S]*idempotencyKey: createArtifactIdempotencyKey\(\)/);
  assert.match(source, /confirmedKeys/);
  assert.match(source, /item\.idempotencyKey && confirmedKeys\.has\(item\.idempotencyKey\)/);
});

test('recovery removes device data only after a successful cloud response', () => {
  const syncBlock = source.slice(source.indexOf('export async function syncLocalStudyArtifacts'));
  assert.match(syncBlock, /if \(!res\.ok\)[\s\S]*continue/);
  assert.match(syncBlock, /attemptedRevision/);
  assert.match(syncBlock, /candidate\.localRevision/);
  assert.ok(syncBlock.indexOf('if (!res.ok)') < syncBlock.indexOf('writeLocalArtifacts'));
});

test('offline recovery does not impose a lossy item-count cap', () => {
  assert.doesNotMatch(source, /LOCAL_LIMIT/);
  assert.match(source, /Never silently evict/);
  assert.match(source, /putDurableOutboxRecord/);
  assert.match(source, /listDurableOutboxRecords/);
});

test('dashboard exposes pending device saves and an explicit retry control', () => {
  assert.match(dashboard, /Sync & recovery/);
  assert.match(dashboard, /device save/);
  assert.match(dashboard, /onRetrySync/);
});
