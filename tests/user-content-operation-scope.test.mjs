import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/userContent.ts', 'utf8');

function functionBody(name, nextName) {
  const start = source.indexOf(`export async function ${name}`);
  assert.ok(start >= 0, `${name} must exist`);
  const end = nextName ? source.indexOf(`export async function ${nextName}`, start + 1) : source.length;
  assert.ok(end > start, `${name} must have a bounded source section`);
  return source.slice(start, end);
}

test('study artifact operations share an explicit active-account scope guard', () => {
  assert.match(source, /const ACCOUNT_CHANGED_ERROR = 'Account changed while study work was being processed/);
  assert.match(
    source,
    /function isCurrentUserContentScope\(scope: string\): boolean \{\s*return getUserContentStorageScope\(\) === scope;\s*\}/,
  );
});

test('save refuses stale account scope before cloud writes, retries, or local fallback', () => {
  const body = functionBody('saveStudyArtifact', 'syncLocalStudyArtifacts');
  const tokenIndex = body.indexOf('await getAccessToken()');
  const firstScopeCheck = body.indexOf('if (!isCurrentUserContentScope(scope)) return accountChangedSaveResult();');
  const requestIndex = body.indexOf("authFetchWithAccessToken('/api/user-content'");

  assert.ok(tokenIndex >= 0 && firstScopeCheck > tokenIndex && requestIndex > firstScopeCheck);
  assert.match(body, /const request = \(\) => \{\s*if \(!isCurrentUserContentScope\(scope\)\) throw new Error\(ACCOUNT_CHANGED_ERROR\);/);
  assert.match(body, /catch \(err\) \{\s*if \(!isCurrentUserContentScope\(scope\)\) return accountChangedSaveResult\(\);\s*const local = await saveLocalArtifact/);
});

test('update and delete validate the initiating scope after token acquisition', () => {
  const update = functionBody('updateStudyArtifact', 'saveStudyArtifact');
  const del = functionBody('deleteStudyArtifact', 'listStudyArtifacts');

  for (const body of [update, del]) {
    const tokenIndex = body.indexOf('await getAccessToken()');
    const scopeIndex = body.indexOf('isCurrentUserContentScope(scope)', tokenIndex);
    const fetchIndex = body.indexOf("authFetchWithAccessToken('/api/user-content'", tokenIndex);
    assert.ok(tokenIndex >= 0 && scopeIndex > tokenIndex && fetchIndex > scopeIndex);
  }
});

test('listing never returns prior-account recovery items after a scope transition', () => {
  const body = functionBody('listStudyArtifactsDetailed');
  const recoveredIndex = body.indexOf('await readRecoveryArtifacts(scope)');
  const recoveredScopeCheck = body.indexOf('if (!isCurrentUserContentScope(scope)) return accountChangedListResult();', recoveredIndex);
  const tokenIndex = body.indexOf('await getAccessToken()', recoveredScopeCheck);
  const tokenScopeCheck = body.indexOf('if (!isCurrentUserContentScope(scope)) return accountChangedListResult();', tokenIndex);

  assert.ok(recoveredIndex >= 0 && recoveredScopeCheck > recoveredIndex);
  assert.ok(tokenIndex > recoveredScopeCheck && tokenScopeCheck > tokenIndex);
  assert.match(
    body,
    /catch \(err\) \{\s*if \(!isCurrentUserContentScope\(scope\)\) return accountChangedListResult\(\);/,
  );
});

test('recovery sync stops when account ownership changes instead of continuing the old queue', () => {
  const body = functionBody('syncLocalStudyArtifacts', 'deleteStudyArtifact');
  assert.match(body, /const pending = await readRecoveryArtifacts\(scope\);\s*if \(!isCurrentUserContentScope\(scope\)\)/);
  assert.match(body, /for \(const item of pending\) \{\s*if \(!isCurrentUserContentScope\(scope\)\) \{\s*lastError = ACCOUNT_CHANGED_ERROR;\s*break;/);
  assert.match(body, /await deleteDurableOutboxRecord\('artifact', scope, item\.id, attemptedRevision\);\s*if \(!isCurrentUserContentScope\(scope\)\)/);
});

test('local recovery fallback does not mirror stale account data after async durable storage', () => {
  const start = source.indexOf('async function saveLocalArtifact');
  const end = source.indexOf('function mergeArtifacts', start);
  const body = source.slice(start, end);
  const durableIndex = body.indexOf('await putDurableOutboxRecord');
  const postDurableScopeCheck = body.indexOf('if (!isCurrentUserContentScope(scope)) return null;', durableIndex);
  const mirrorIndex = body.indexOf('writeLocalArtifacts', postDurableScopeCheck);

  assert.match(body, /if \(!isCurrentUserContentScope\(scope\)\) return null;/);
  assert.ok(durableIndex >= 0 && postDurableScopeCheck > durableIndex && mirrorIndex > postDurableScopeCheck);
});
