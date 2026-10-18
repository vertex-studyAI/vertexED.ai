import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { MYP5_CONTENT_CATALOGUE } from '../src/content/myp5Catalogue.ts';

const physicsBody = await readFile(new URL('../public/myp5-content/physics.json', import.meta.url), 'utf8');
const physics = JSON.parse(physicsBody);

test('MYP loading rejects unknown and inherited property names without fetching', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error('Unexpected request'); };
  const { loadMypSubjectContent } = await import('../src/content/myp5ContentClient.ts?case=unknown');
  for (const slug of ['../private', 'toString', '__proto__', 'constructor']) {
    await assert.rejects(loadMypSubjectContent(slug), /Unknown MYP subject/);
  }
});

test('review holds remain distinguishable from a connection failure', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => new Response('', { status: 403 });
  const { loadMypSubjectContent } = await import('../src/content/myp5ContentClient.ts?case=review-held');
  await assert.rejects(loadMypSubjectContent('physics'), (error) => error.code === 'CONTENT_REVIEW_REQUIRED' && /awaiting subject review/.test(error.message));
});

test('MYP catalogue identifies the exact public bytes for every subject and preserves totals', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const { loadMypSubjectContent, MYP5_CONTENT_TOTALS, MYP5_SUBJECT_TOTALS } = await import('../src/content/myp5ContentClient.ts?case=complete');
  let lessons = 0, questions = 0;
  for (const summary of MYP5_CONTENT_CATALOGUE) {
    const body = await readFile(new URL(`../public/myp5-content/${summary.slug}.json`, import.meta.url), 'utf8');
    assert.equal(createHash('sha256').update(body).digest('hex'), summary.contentSha256, summary.slug);
    globalThis.fetch = async (url, options) => {
      assert.equal(url, `/myp5-content/${summary.slug}.json`);
      assert.equal(options.cache, 'no-cache');
      return new Response(body);
    };
    const payload = await loadMypSubjectContent(summary.slug);
    assert.deepEqual(payload, JSON.parse(body));
    assert.deepEqual(MYP5_SUBJECT_TOTALS[summary.slug], { lessons: summary.lessonCount, questions: summary.questionCount });
    lessons += payload.lessons.length;
    questions += payload.lessons.reduce((total, lesson) => total + lesson.practice.length, 0);
  }
  assert.deepEqual(MYP5_CONTENT_TOTALS, { lessons, questions });
});

test('truncated MYP lessons and stale answers are rejected even when counts match', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  const { loadMypSubjectContent } = await import('../src/content/myp5ContentClient.ts?case=integrity');
  for (const mutate of [
    (payload) => { delete payload.lessons[0].objectives; },
    (payload) => { payload.lessons[0].practice[0].solution = ['An obsolete answer with the same question identity.']; },
    (payload) => { payload.lessons[0].practice[0].successCriteria = null; },
    (payload) => { payload.prerequisites = {}; },
    (payload) => { payload.subjectSlug = 'mathematics'; },
  ]) {
    const payload = structuredClone(physics);
    mutate(payload);
    globalThis.fetch = async () => Response.json(payload);
    await assert.rejects(loadMypSubjectContent('physics'), /incomplete or out of date/);
  }
  globalThis.fetch = async () => new Response('<html>Fallback page</html>');
  await assert.rejects(loadMypSubjectContent('physics'), /incomplete or out of date/);
  globalThis.fetch = async () => new Response(physicsBody);
  assert.deepEqual(await loadMypSubjectContent('physics'), physics, 'rejected downloads must remain retryable');
});

test('failed MYP requests can retry while concurrent successful requests share one download', async (t) => {
  const original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  let attempts = 0;
  globalThis.fetch = async () => ++attempts === 1 ? new Response('', { status: 503 }) : new Response(physicsBody);
  const { loadMypSubjectContent } = await import('../src/content/myp5ContentClient.ts?case=retry');
  await assert.rejects(loadMypSubjectContent('physics'), /could not be loaded/);
  const first = loadMypSubjectContent('physics');
  const second = loadMypSubjectContent('physics');
  assert.equal(first, second);
  assert.deepEqual(await first, physics);
  assert.deepEqual(await loadMypSubjectContent('physics'), physics);
  assert.equal(attempts, 2);
});
