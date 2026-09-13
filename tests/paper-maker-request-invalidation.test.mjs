import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/PaperMaker.tsx', 'utf8');

test('paper maker invalidates generation on account, configuration, and unmount transitions', () => {
  assert.match(source, /const generationRequestIdRef = useRef\(0\);/);
  assert.match(source, /const currentGenerationAccountIdRef = useRef<string \| null>\(user\?\.id \?\? null\);/);
  assert.match(source, /const invalidateGenerationRequest = useCallback\(\(\) => \{[\s\S]*generationRequestIdRef\.current \+= 1;[\s\S]*setLoading\(false\);[\s\S]*\}, \[\]\);/);
  assert.match(source, /useLayoutEffect\(\(\) => \{[\s\S]*currentGenerationAccountIdRef\.current !== nextAccountId[\s\S]*currentGenerationAccountIdRef\.current = nextAccountId;[\s\S]*invalidateGenerationRequest\(\);[\s\S]*\}, \[user\?\.id, invalidateGenerationRequest\]\);/);
  assert.match(source, /useEffect\(\(\) => \(\) => \{[\s\S]*generationRequestIdRef\.current \+= 1;[\s\S]*\}, \[\]\);/);
  assert.match(source, /const generationConfigKey = useMemo\(\(\) => JSON\.stringify\(/);
  assert.match(source, /if \(previousGenerationConfigKeyRef\.current === generationConfigKey\) return;[\s\S]*previousGenerationConfigKeyRef\.current = generationConfigKey;[\s\S]*invalidateGenerationRequest\(\);/);
});

test('paper maker gates async generation, persistence, and loading by request identity', () => {
  assert.match(source, /const requestId = generationRequestIdRef\.current \+ 1;/);
  assert.match(source, /generationRequestIdRef\.current = requestId;/);
  assert.match(source, /const requestAccountId = currentGenerationAccountIdRef\.current;/);
  assert.match(source, /const isCurrentRequest = \(\) =>[\s\S]*generationRequestIdRef\.current === requestId[\s\S]*currentGenerationAccountIdRef\.current === requestAccountId/);
  assert.match(source, /await authFetch\("\/api\/paper-generator"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.json\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /if \(!isCurrentRequest\(\)\) return;\s*const saved = await saveStudyArtifact/);
  assert.match(source, /const saved = await saveStudyArtifact[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*if \(saved\.ok\)/);
  assert.match(source, /catch \(err\) \{\s*if \(!isCurrentRequest\(\)\) return;[\s\S]*\} finally \{\s*if \(isCurrentRequest\(\)\) setLoading\(false\);\s*\}/);
});
