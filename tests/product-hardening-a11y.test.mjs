import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('cloud save degradation stays user-facing and accessible', async () => {
  const source = await readSource('src/components/CloudSaveBanner.tsx');

  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /supabase\/migrations/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /Cloud sync will resume when the service is available again\./);
});

test('adaptive recommendations expose generated updates and list semantics', async () => {
  const source = await readSource('src/components/AdaptiveLearningPanel.tsx');

  assert.match(source, /const titleId = useId\(\)/);
  assert.match(source, /aria-labelledby=\{titleId\}/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /<ul className="space-y-2">/);
  assert.match(source, /<li key=\{rec\.id\}>/);
  assert.match(source, /<span className="sr-only">\{rec\.priority\} priority\. <\/span>/);
  assert.match(source, /aria-hidden="true"/);
});
