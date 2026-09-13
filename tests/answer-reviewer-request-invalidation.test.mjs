import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/AnswerReviewer.tsx', 'utf8');

test('answer reviewer invalidates stale review requests on reset, account change, and unmount', () => {
  assert.match(source, /const reviewRequestIdRef = useRef\(0\);/);
  assert.match(source, /const currentReviewAccountIdRef = useRef<string \| null>\(user\?\.id \?\? null\);/);
  assert.match(source, /const invalidateReviewRequest = \(\) => \{[\s\S]*reviewRequestIdRef\.current \+= 1;[\s\S]*setLoading\(false\);[\s\S]*\};/);
  assert.match(source, /useEffect\(\(\) => \{[\s\S]*currentReviewAccountIdRef\.current !== nextAccountId[\s\S]*invalidateReviewRequest\(\);[\s\S]*\}, \[user\?\.id\]\);/);
  assert.match(source, /useEffect\(\(\) => \(\) => \{[\s\S]*reviewRequestIdRef\.current \+= 1;[\s\S]*\}, \[\]\);/);
  assert.match(source, /const resetAll = \(\) => \{\s*invalidateReviewRequest\(\);/);
});

test('answer reviewer gates post-await work and stale saves on the current request identity', () => {
  assert.match(source, /const requestId = reviewRequestIdRef\.current \+ 1;/);
  assert.match(source, /reviewRequestIdRef\.current = requestId;/);
  assert.match(source, /const requestAccountId = user\?\.id \?\? null;/);
  assert.match(source, /const isCurrentRequest = \(\) =>[\s\S]*reviewRequestIdRef\.current === requestId[\s\S]*currentReviewAccountIdRef\.current === requestAccountId/);
  assert.match(source, /await authFetch\("\/api\/review"[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*await res\.text\(\);[\s\S]*if \(!isCurrentRequest\(\)\) return;/);
  assert.match(source, /if \(!isCurrentRequest\(\)\) return;\s*try \{\s*if \(typeof out === "string" && out\.trim\(\)\) \{[\s\S]*await saveStudyArtifact/);
  assert.match(source, /const saved = await saveStudyArtifact[\s\S]*if \(!isCurrentRequest\(\)\) return;[\s\S]*if \(saved\.ok\)/);
  assert.match(source, /catch \(err\) \{\s*if \(!isCurrentRequest\(\)\) return;[\s\S]*\} finally \{\s*if \(isCurrentRequest\(\)\) setLoading\(false\);\s*\}/);
});
