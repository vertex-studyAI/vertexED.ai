import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('optional page prefetch cannot become an unhandled rejection', async () => {
  const source = await readSource('src/app/App.tsx');

  assert.match(source, /void Promise\.allSettled\(\[/);
  assert.match(source, /import\("@\/pages\/Login"\)/);
  assert.match(source, /import\("@\/pages\/StudyPlanner"\)/);
  assert.match(source, /waitingForLoad = true/);
  assert.match(source, /window\.removeEventListener\('load', start\)/);
  assert.doesNotMatch(source, /^\s*import\("@\/pages\/(?:Login|Signup|About|Main|StudyPlanner)"\);$/m);
});

test('deferred telemetry rejects safely and clears delayed state updates', async () => {
  const source = await readSource('src/app/App.tsx');

  assert.match(source, /let timer: number \| undefined/);
  assert.match(source, /timer = window\.setTimeout\(\(\) => setTelemetryReady\(true\), 4000\)/);
  assert.match(source, /if \(timer !== undefined\) window\.clearTimeout\(timer\)/);
  assert.match(source, /import\('@vercel\/speed-insights\/react'\)/);
  assert.match(source, /import\('@vercel\/analytics\/react'\)/);
  assert.match(source, /\}\)\.catch\(\(\) => \{/);
  assert.match(source, /Optional telemetry must fail open/);
});
