import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('root app errors provide an accessible recovery path', async () => {
  const [boundary, entrypoint] = await Promise.all([
    readSource('src/components/AppErrorBoundary.tsx'),
    readSource('src/main.tsx'),
  ]);

  assert.match(entrypoint, /<AppErrorBoundary>\s*<App \/>\s*<\/AppErrorBoundary>/);
  assert.match(boundary, /static getDerivedStateFromError\(\)/);
  assert.match(boundary, /componentDidCatch\(error: Error, info: ErrorInfo\)/);
  assert.match(boundary, /reportClientError\(error, \{/);
  assert.match(boundary, /source: 'react-error-boundary'/);
  assert.match(boundary, /role="alert"/);
  assert.match(boundary, /aria-labelledby="app-error-title"/);
  assert.match(boundary, /aria-describedby="app-error-description"/);
  assert.match(boundary, /this\.headingRef\.current\?\.focus\(\)/);
  assert.match(boundary, /tabIndex=\{-1\}/);
  assert.match(boundary, /window\.location\.reload\(\)/);
  assert.match(boundary, />\s*Reload page\s*</);
  assert.match(boundary, /href="\/"[\s\S]*>\s*Return home\s*</);
  assert.doesNotMatch(boundary, /\{error\.message\}/);
});
