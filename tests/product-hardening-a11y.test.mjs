import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('cloud save degradation stays user-facing, accessible, and fail-safe', async () => {
  const source = await readSource('src/components/CloudSaveBanner.tsx');

  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(source, /supabase\/migrations/);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.match(source, /\.catch\(\(\) => \{/);
  assert.match(source, /Cloud sync status couldn't be verified\./);
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

test('route loader explains slow networks without noisy accessibility output', async () => {
  const source = await readSource('src/components/PageLoader.tsx');

  assert.match(source, /const SLOW_LOAD_DELAY_MS = 8_000/);
  assert.match(source, /window\.setTimeout\(\(\) => setIsTakingLonger\(true\), SLOW_LOAD_DELAY_MS\)/);
  assert.match(source, /return \(\) => window\.clearTimeout\(timeoutId\)/);
  assert.match(source, /This is taking longer than usual\. Check your connection; this page will keep trying to open\./);
  assert.match(source, /role="status"/);
  assert.match(source, /aria-live="polite"/);
  assert.match(source, /aria-atomic="true"/);
  assert.equal((source.match(/aria-hidden="true"/g) ?? []).length, 2);
  assert.match(source, /motion-reduce:animate-none/);
  assert.equal((source.match(/motion-reduce:\[animation:none\]/g) ?? []).length, 2);
});
