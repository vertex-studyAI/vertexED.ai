import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/UserSettings.tsx', 'utf8');

test('account settings saved-work requests are latest-request and account scoped', () => {
  assert.match(source, /const artifactRequestIdRef = useRef\(0\)/);
  assert.match(source, /const requestId = \+\+artifactRequestIdRef\.current/);
  assert.match(source, /const requestScope = getUserContentStorageScope\(\)/);
  assert.match(
    source,
    /await listStudyArtifactsDetailed\([\s\S]*?if \(artifactRequestIdRef\.current !== requestId \|\| getUserContentStorageScope\(\) !== requestScope\) return;/,
  );
  assert.match(source, /\}, \[kindFilter, user\?\.id\]\)/);

  const requestId = source.indexOf('const requestId = ++artifactRequestIdRef.current;');
  const requestScope = source.indexOf('const requestScope = getUserContentStorageScope();', requestId);
  const requestStart = source.indexOf('await listStudyArtifactsDetailed(', requestScope);
  const staleCheck = source.indexOf('artifactRequestIdRef.current !== requestId || getUserContentStorageScope() !== requestScope', requestStart);
  const artifactWrite = source.indexOf('setArtifacts((current) => {', staleCheck);
  assert.ok(requestId >= 0 && requestId < requestScope, 'request identity must be captured before storage scope');
  assert.ok(requestScope < requestStart && requestStart < staleCheck, 'scope must be captured before discovery and checked afterward');
  assert.ok(staleCheck < artifactWrite, 'stale results must be rejected before saved-work state is mutated');
});

test('account settings saved-work loading state cannot strand after thrown failures', () => {
  assert.match(source, /try \{[\s\S]*?await listStudyArtifactsDetailed\(/);
  assert.match(
    source,
    /catch \{[\s\S]*?setArtifactError\("Unable to load saved work\. Try again\."\);/,
  );
  assert.match(
    source,
    /finally \{[\s\S]*?artifactRequestIdRef\.current === requestId[\s\S]*?getUserContentStorageScope\(\) === requestScope[\s\S]*?setLoadingArtifacts\(false\)[\s\S]*?setLoadingMoreArtifacts\(false\)/,
  );
});

test('account settings does not paint stale-account saved work during a scope transition', () => {
  assert.match(source, /const \[artifactScope, setArtifactScope\] = useState<string \| null>\(\(\) => getUserContentStorageScope\(\)\)/);
  assert.match(source, /const currentArtifactScope = getUserContentStorageScope\(\)/);
  assert.match(source, /const artifactScopeIsCurrent = artifactScope === currentArtifactScope/);
  assert.match(source, /setArtifactScope\(requestScope\)/);
  assert.match(source, /loadingArtifacts \|\| !artifactScopeIsCurrent \? \(/);
  assert.match(source, /cloudUnavailable && artifactScopeIsCurrent/);
});

test('account settings saved-work failures use bounded copy and accessible status semantics', () => {
  assert.match(source, /"Unable to load saved work\. Try again\."/);
  assert.doesNotMatch(source, /setArtifactError\([\s\S]{0,120}result\.error/);
  assert.match(source, /role="status" aria-live="polite" aria-label="Loading saved study work"/);
  assert.match(source, /role="alert"/);
});
