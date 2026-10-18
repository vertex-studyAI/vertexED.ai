import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const calculus = JSON.parse(await readFile(new URL('../src/content/ap/calculus-ab.json', import.meta.url), 'utf8'));

test('AP loading refuses unknown routes before issuing a request', async () => {
  const { loadApCourse } = await import('../src/content/apContentClient.ts?case=unknown');
  await assert.rejects(loadApCourse('../private'), /not in the library/);
});

test('failed AP download can retry and successful public content is reused', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let attempts = 0;
  globalThis.fetch = async (url) => {
    assert.equal(url, '/ap-content/calculus-ab.json');
    attempts++;
    return attempts === 1 ? new Response('', { status: 503 }) : new Response(`${JSON.stringify(calculus)}\n`);
  };
  const { loadApCourse } = await import('../src/content/apContentClient.ts?case=retry');
  await assert.rejects(loadApCourse('calculus-ab'), /could not be loaded/);
  assert.deepEqual(await loadApCourse('calculus-ab'), calculus);
  assert.deepEqual(await loadApCourse('calculus-ab'), calculus);
  assert.equal(attempts, 2);
});

test('truncated or wrong-course responses never render as a successful AP lesson', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const { loadApCourse } = await import('../src/content/apContentClient.ts?case=integrity');
  const stale = structuredClone(calculus);
  stale.modules[0].questions[0].answer = 'An outdated answer with the same identity.';
  for (const invalid of [stale, { ...calculus, slug: 'calculus-bc' }, { ...calculus, modules: calculus.modules.slice(1) }, { ...calculus, title: 'AP Wrong course' }]) {
    globalThis.fetch = async () => Response.json(invalid);
    await assert.rejects(loadApCourse('calculus-ab'), /incomplete or out of date/);
  }
});
