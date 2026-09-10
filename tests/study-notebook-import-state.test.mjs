import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync('src/pages/StudyNotebook.tsx', 'utf8');

test('Study Notebook distinguishes saved-work loading, failure, and empty states', () => {
  assert.match(source, /const \[importableLoading, setImportableLoading\] = useState\(false\)/);
  assert.match(source, /const \[importableError, setImportableError\] = useState<string \| null>\(null\)/);
  assert.match(source, /setImportableLoading\(true\);[\s\S]*?await listStudyArtifactsDetailed\(\)/);
  assert.match(source, /if \(!result\.ok && result\.items\.length === 0\)/);
  assert.match(source, /finally \{[\s\S]*?setImportableLoading\(false\)/);
  assert.match(source, /aria-busy=\{importableLoading\}/);
  assert.match(source, /role="status" aria-live="polite"[\s\S]*?Loading saved work…/);
  assert.match(source, /role="alert"[\s\S]*?Try again/);

  const loadingBranch = source.indexOf('{importableLoading ? (');
  const errorBranch = source.indexOf(') : importableError ? (');
  const emptyBranch = source.indexOf(') : importable.length === 0 ? (');
  assert.ok(loadingBranch >= 0 && loadingBranch < errorBranch, 'loading state must render before errors');
  assert.ok(errorBranch < emptyBranch, 'empty copy must only render after loading and error states are resolved');
});

test('Study Notebook does not surface raw saved-work backend errors', () => {
  assert.match(source, /Saved work could not be loaded\. Check your connection and try again\./);
  assert.doesNotMatch(source, /setImportableError\(result\.error/);
});

test('Study Notebook prevents overlapping saved-work discovery requests', () => {
  assert.match(source, /const importableRequestInFlightRef = useRef\(false\)/);
  assert.match(source, /const importableRequestScopeRef = useRef<string \| null>\(null\)/);
  assert.match(
    source,
    /if \(importableRequestInFlightRef\.current && importableRequestScopeRef\.current === requestScope\) return;[\s\S]*?importableRequestInFlightRef\.current = true;[\s\S]*?importableRequestScopeRef\.current = requestScope;[\s\S]*?await listStudyArtifactsDetailed\(\)/,
  );
  assert.match(
    source,
    /finally \{[\s\S]*?if \(importableRequestScopeRef\.current === requestScope\)[\s\S]*?importableRequestInFlightRef\.current = false;[\s\S]*?importableRequestScopeRef\.current = null;[\s\S]*?setImportableLoading\(false\)/,
  );
  assert.match(
    source,
    /aria-label="Import saved work as a source"[\s\S]*?disabled=\{!notebookHydrated \|\| importableLoading\}/,
  );

  const guardCheck = source.indexOf('if (importableRequestInFlightRef.current && importableRequestScopeRef.current === requestScope) return;');
  const guardAcquire = source.indexOf('importableRequestInFlightRef.current = true;', guardCheck);
  const scopeAcquire = source.indexOf('importableRequestScopeRef.current = requestScope;', guardAcquire);
  const loadingStart = source.indexOf('setImportableLoading(true);', scopeAcquire);
  assert.ok(guardCheck >= 0 && guardCheck < guardAcquire, 'same-scope re-entry must be rejected before acquiring the guard');
  assert.ok(guardAcquire < scopeAcquire && scopeAcquire < loadingStart, 'request ownership must be captured before React loading state can lag behind');
});

test('Study Notebook drops saved-work results after an account scope change', () => {
  assert.match(
    source,
    /useEffect\(\(\) => \{[\s\S]*?setShowImport\(false\);[\s\S]*?setImportable\(\[\]\);[\s\S]*?setImportableLoading\(false\);[\s\S]*?setImportableError\(null\);[\s\S]*?\}, \[user\?\.id\]\)/,
  );
  assert.match(source, /const requestScope = getUserContentStorageScope\(\)/);
  assert.match(
    source,
    /const result = await listStudyArtifactsDetailed\(\);[\s\S]*?if \(getUserContentStorageScope\(\) !== requestScope\) return;/,
  );
  assert.match(
    source,
    /catch \{[\s\S]*?if \(getUserContentStorageScope\(\) !== requestScope\) return;[\s\S]*?setImportable\(\[\]\)/,
  );
});
