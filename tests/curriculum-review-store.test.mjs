import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadCurriculumReviewStore, readReviewResource } from '../api/_lib/curriculumReviewStore.js';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;

async function fixture(t) {
  const parent = await mkdtemp(join(tmpdir(), 'vertexed-review-store-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const resource = '# Full fixture lesson\n\nOriginal private source text.\n';
  const sourceBatch = {
    schemaVersion: 1,
    expectedRecords: 1,
    packets: [{
      key: 'fixture',
      expectedRecords: 1,
      curriculum: { board: 'IB_DP', subject: 'Physics', level: 'HL', language: 'en' },
      resources: [{ id: 'lesson', path: 'sources/fixture/lesson.md', sha256: sha256(resource) }],
    }],
  };
  const sourceBatchBytes = json(sourceBatch);
  const review = {
    editorialStatus: 'unreviewed',
    publicationStatus: 'held-from-index',
    teacherApproved: false,
    productionImportPerformed: false,
    requiredActions: ['qualified-teacher-review'],
  };
  const catalog = {
    schemaVersion: 1,
    sourceBatchSha256: sha256(sourceBatchBytes),
    records: [{
      id: 'FIXTURE-LESSON',
      kind: 'lesson',
      packetKey: 'fixture',
      title: 'Fixture lesson',
      topic: 'Fixture topic',
      solution: { explanation: 'Retained full lesson is attached.' },
      review,
      provenance: { manifestSha256: 'b'.repeat(64) },
    }],
  };
  const learnerPreview = {
    schemaVersion: 1,
    batchId: 'fixture-batch',
    status: 'PRIVATE_REVIEW_PREVIEW_NOT_PUBLISHED',
    contexts: [],
    records: [{
      id: 'FIXTURE-LESSON',
      packetKey: 'fixture',
      kind: 'lesson',
      sourceType: 'lesson',
      title: 'Fixture lesson',
      topic: 'Fixture topic',
      curriculum: { board: 'IB_DP', subject: 'Physics', level: 'HL', language: 'en' },
      prompt: null,
      contextIds: [],
      dependencyIds: [],
      contextUsageNote: null,
      contentScope: 'metadata-only; full source document available to private reviewers',
    }],
  };
  const summary = {
    packets: 1,
    records: 1,
    lessons: 1,
    workedExamples: 0,
    questions: 0,
    guidedRepeatQuestions: 0,
    repairedPrompts: 0,
    sourceResourcesVerified: 1,
    unsupportedRuntimeSubjectRecords: 0,
    teacherApproved: 0,
    runtimeExportRecords: 0,
    productionImported: 0,
  };
  const digest = sha256(json({ reviewCatalog: catalog, learnerPreview, summary }));
  const root = join(parent, digest);
  await mkdir(join(root, 'sources', 'fixture'), { recursive: true });
  await writeFile(join(root, 'sources', 'fixture', 'lesson.md'), resource);
  await writeFile(join(root, 'source-batch.json'), sourceBatchBytes);
  await writeFile(join(root, 'review-catalog.json'), json(catalog));
  await writeFile(join(root, 'learner-preview.json'), json(learnerPreview));
  await writeFile(join(root, 'import-receipt.json'), json({
    schemaVersion: 1,
    state: 'IMPORTED_TO_PRIVATE_REVIEW_STORE',
    bundleSha256: digest,
    ...summary,
  }));
  return { root, resource, sourceBatch, catalog, learnerPreview, summary };
}

test('loads a digest-addressed held store and hash-verifies its full lesson resource', async (t) => {
  const f = await fixture(t);
  const store = await loadCurriculumReviewStore({ VERTEXED_CURRICULUM_REVIEW_STORE: f.root });
  assert.equal(store.packets.length, 1);
  assert.equal(store.packets[0].preferredResourceId, 'lesson');
  assert.equal(store.packets[0].lesson.review.teacherApproved, false);
  const loaded = await readReviewResource(store, 'fixture', 'lesson');
  assert.equal(loaded.bytes.toString('utf8'), f.resource);
  assert.equal(loaded.kind, 'text');
});

test('fails closed when batch metadata or a retained resource changes', async (t) => {
  const f = await fixture(t);
  f.sourceBatch.expectedRecords = 2;
  await writeFile(join(f.root, 'source-batch.json'), json(f.sourceBatch));
  await assert.rejects(
    loadCurriculumReviewStore({ VERTEXED_CURRICULUM_REVIEW_STORE: f.root }),
    /hash check/,
  );

  const clean = await fixture(t);
  const store = await loadCurriculumReviewStore({ VERTEXED_CURRICULUM_REVIEW_STORE: clean.root });
  await writeFile(join(clean.root, 'sources', 'fixture', 'lesson.md'), 'Changed after validation.');
  await assert.rejects(readReviewResource(store, 'fixture', 'lesson'), /source hash/);
});

test('refuses approval, production-import and publication state escalation', async (t) => {
  const f = await fixture(t);
  f.catalog.records[0].review.teacherApproved = true;
  f.catalog.records[0].review.publicationStatus = 'published';
  await writeFile(join(f.root, 'review-catalog.json'), json(f.catalog));
  await assert.rejects(
    loadCurriculumReviewStore({ VERTEXED_CURRICULUM_REVIEW_STORE: f.root }),
    /bundle hash check/,
  );
});

test('requires an absolute private-store configuration', async () => {
  await assert.rejects(loadCurriculumReviewStore({}), /not configured/);
  await assert.rejects(
    loadCurriculumReviewStore({ VERTEXED_CURRICULUM_REVIEW_STORE: 'relative/store' }),
    /not configured/,
  );
});
