import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, readFile, access, rm, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hasExactContentApproval, hasPublicationEvidence } from '../contracts/contentPublication.js';
import { approvedStaticPaths, contentHash, contentPublicationMiddleware, enforcePublishedContent, isControlledContentPath, publicationResponse } from '../scripts/content-publication.mjs';
import { generateOfflineBundle } from '../scripts/generate-offline-bundle.mjs';
import { retrieveStudyGuideContext } from '../api/_lib/studyGuideRetrieval.js';

const reviewed = (path, body) => ({ path, editorialStatus: 'approved', publicationStatus: 'published',
  source: 'https://example.edu/syllabus', factualReviewer: 'Fixture reviewer, not actual approval',
  reviewedAt: '2026-01-01T00:00:00.000Z', license: 'original-authorised', permittedUse: 'public-study',
  contentVersion: 'fixture-v1', answerVersion: 'fixture-v1', contentHash: contentHash(body) });

test('publication requires exact bytes, separate review, dates, rights and versions', () => {
  const body = '{"lesson":"fixture"}\n';
  const entry = reviewed('/ap-content/example.json', body);
  assert.equal(hasExactContentApproval(entry, contentHash(body)), true);
  for (const [key, value] of [['editorialStatus', 'machine-validated'], ['publicationStatus', 'held-from-index'],
    ['source', null], ['factualReviewer', ' '], ['reviewedAt', 'invalid'], ['reviewedAt', '2999-01-01'],
    ['reviewDueAt', '2026-01-02'], ['reviewDueAt', 'invalid'], ['license', 'unknown'], ['permittedUse', 'not-yet-determined'],
    ['contentVersion', null], ['answerVersion', null]]) {
    assert.equal(hasExactContentApproval({ ...entry, [key]: value }, contentHash(body)), false, key);
  }
  assert.equal(hasExactContentApproval(entry, contentHash(`${body} `)), false, 'edited content invalidates approval');
  assert.equal(hasPublicationEvidence({ ...entry, reviewedAt: '2999-01-01' }), false);
});

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-content-publication-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ['contracts', 'public/ap-content', 'public/myp5-content', 'public/study-guides/myp/biology', 'public/assets']) {
    await mkdir(join(root, directory), { recursive: true });
  }
  const guide = '# Fixture cell lesson\nA cell has a membrane.\n';
  await writeFile(join(root, 'public/study-guides/myp/biology/overview.md'), guide);
  await writeFile(join(root, 'public/study-guides/myp/manifest.json'), JSON.stringify({ subjects: [{ name: 'Biology', slug: 'biology', pages: [{ title: 'Cells', path: '/study-guides/myp/biology/overview.md', relativePath: 'overview.md' }] }] }));
  await writeFile(join(root, 'public/study-guides/myp/provenance-ledger.json'), '{}');
  await writeFile(join(root, 'public/ap-content/fixture.json'), '{"draft":"AP secret lesson"}\n');
  await writeFile(join(root, 'public/myp5-content/biology.json'), '{"draft":"MYP secret lesson"}\n');
  await writeFile(join(root, 'public/myp5-content/manifest.json'), JSON.stringify({ version: 'test', lessonCount: 1, questionCount: 3, subjects: [{ slug: 'biology', lessonCount: 1, questionCount: 3 }] }));
  await writeFile(join(root, 'public/index.html'), '<!doctype html>');
  await writeFile(join(root, 'public/assets/app.js'), 'window.fixture = true;');
  await writeFile(join(root, 'contracts/content-publication-approvals.json'), JSON.stringify({ schemaVersion: 1, entries: [] }));
  return { root, guide };
}

test('direct URLs, encoded URLs and learner manifests hold unapproved content', async (t) => {
  const { root } = await fixture(t);
  for (const url of ['/ap-content/fixture.json', '/myp5-content/biology.json?download=1', '/study-guides/myp/biology/overview.md', '/%61p-content/fixture.json', '/ap-content%2ffixture.json']) {
    const response = await publicationResponse(url, { root });
    assert.equal(response.status, 403, url);
    assert.equal(response.body.code, 'CONTENT_REVIEW_REQUIRED');
    assert.doesNotMatch(JSON.stringify(response.body), /secret lesson/);
  }
  assert.equal(isControlledContentPath('/api/waitlist-status'), false);
  assert.deepEqual((await publicationResponse('/study-guides/myp/manifest.json', { root })).body.subjects, []);
  assert.equal((await publicationResponse('/myp5-content/manifest.json', { root })).body.lessonCount, 0);
  assert.deepEqual((await publicationResponse('/study-guides/myp/provenance-ledger.json', { root })).body.entries, []);
});

test('static build and offline manifest exclude drafts without touching their source bytes', async (t) => {
  const { root, guide } = await fixture(t);
  const output = join(root, 'build');
  await cp(join(root, 'public'), output, { recursive: true });
  const report = await enforcePublishedContent(output, { root });
  assert.equal(report.heldAssetsRemoved, 3);
  await assert.rejects(access(join(output, 'ap-content/fixture.json')));
  await assert.rejects(access(join(output, 'myp5-content/biology.json')));
  await assert.rejects(access(join(output, 'study-guides/myp/biology/overview.md')));
  assert.equal(await readFile(join(root, 'public/study-guides/myp/biology/overview.md'), 'utf8'), guide);
  await generateOfflineBundle(output);
  const worker = await readFile(join(output, 'sw.js'), 'utf8');
  assert.doesNotMatch(worker.split('\n')[0], /fixture\.json|biology\.json|overview\.md/);
  await assert.rejects(enforcePublishedContent(join(root, 'public'), { root }), /Refusing to prune source/);
});

test('preview publication responses preserve built JSON bytes and offline integrity', async (t) => {
  const { root } = await fixture(t);
  const output = join(root, 'build');
  await cp(join(root, 'public'), output, { recursive: true });
  await enforcePublishedContent(output, { root });
  await generateOfflineBundle(output);
  const worker = await readFile(join(output, 'sw.js'), 'utf8');
  const manifest = JSON.parse(worker.split('\n')[0].slice('const MANIFEST = '.length, -1));
  const middleware = contentPublicationMiddleware({ root });
  for (const url of ['/myp5-content/manifest.json', '/study-guides/myp/manifest.json', '/study-guides/myp/provenance-ledger.json']) {
    const headers = new Map();
    const response = await new Promise((resolve, reject) => {
      const target = {
        setHeader: (name, value) => headers.set(name, value),
        end: (body) => resolve({ status: target.statusCode, bytes: Buffer.from(body) }),
      };
      middleware({ url }, target, () => reject(new Error(`Publication middleware bypassed ${url}`)));
    });
    const built = await readFile(join(output, url));
    assert.equal(response.status, 200);
    assert.equal(headers.get('Content-Type'), 'application/json; charset=utf-8');
    assert.equal(headers.get('Cache-Control'), 'no-store');
    assert.deepEqual(response.bytes, built, `${url}: preview bytes must equal the integrity-hashed build bytes`);
    assert.equal(response.bytes.at(-1), 10, 'the canonical JSON trailing newline is preserved');
    const entry = manifest.entries.find((candidate) => candidate.url === url);
    if (url === '/myp5-content/manifest.json') {
      assert.ok(entry, 'the public MYP catalogue is included in the real generated worker');
      const digest = `sha256-${createHash('sha256').update(response.bytes).digest('base64')}`;
      assert.equal(digest, entry.integrity, 'the middleware response must pass the installed worker integrity check');
    }
  }
});

test('only the exact approved payload is delivered; revocation and changes take effect immediately', async (t) => {
  const { root, guide } = await fixture(t);
  const path = '/study-guides/myp/biology/overview.md';
  const approval = reviewed(path, guide);
  const approvals = [approval];
  assert.deepEqual([...await approvedStaticPaths({ root, approvals })], [path]);
  assert.equal(await publicationResponse(path, { root, approvals }), null);
  await writeFile(join(root, 'public', path), `${guide}Changed answer.\n`);
  assert.equal((await publicationResponse(path, { root, approvals })).status, 403);
  await writeFile(join(root, 'public', path), guide);
  assert.equal((await publicationResponse(path, { root, approvals: [{ ...approval, publicationStatus: 'held-from-index' }] })).status, 403);
});

test('tutor retrieval rejects unpublished, edited and revoked guides in the same warm process', async (t) => {
  const { root, guide } = await fixture(t);
  const previous = process.cwd();
  process.chdir(root);
  t.after(() => process.chdir(previous));
  const path = '/study-guides/myp/biology/overview.md';
  const approval = reviewed(path, guide);
  const writeApprovals = (entries) => writeFile(join(root, 'contracts/content-publication-approvals.json'), JSON.stringify({ schemaVersion: 1, entries }));
  assert.deepEqual(await retrieveStudyGuideContext('cell membrane'), []);
  await writeApprovals([approval]);
  assert.equal((await retrieveStudyGuideContext('cell membrane')).length, 1);
  await writeFile(join(root, 'public', path), `${guide}Unreviewed addition.\n`);
  assert.deepEqual(await retrieveStudyGuideContext('cell membrane'), []);
  await writeFile(join(root, 'public', path), guide);
  await writeApprovals([{ ...approval, publicationStatus: 'held-from-index' }]);
  assert.deepEqual(await retrieveStudyGuideContext('cell membrane'), []);
});
