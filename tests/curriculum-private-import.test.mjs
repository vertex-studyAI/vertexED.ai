import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, stat, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { loadCurriculumBatch, stageCurriculumBatch } from '../scripts/import-curriculum-packets.mjs';

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
const rows = () => [
  { id: 'UNIT-LESSON', type: 'lesson', topic: 'Test lesson', answer: null, explanation: 'Private source lesson is attached.' },
  { id: 'UNIT-EXAMPLE', type: 'worked_example', topic: 'Test lesson', prompt: 'Show one example.', answer: 'WORKED ANSWER', explanation: 'WORKED REASONING' },
  { id: 'UNIT-Q1', type: 'question', topic: 'Test lesson', prompt: 'What is the supported conclusion?', answer: 'PRIVATE QUESTION ANSWER', explanation: 'PRIVATE QUESTION REASONING' },
];

async function fixture(t, transform = () => {}) {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-curriculum-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const data = { schema_version: '1.0', record_count: 3, records: rows() };
  transform(data);
  const body = json(data);
  await writeFile(join(root, 'manifest.json'), body);
  const resource = 'Original private teaching resource.';
  await writeFile(join(root, 'lesson.txt'), resource);
  const batch = { schemaVersion: 1, batchId: 'fixture-batch', expectedRecords: 3,
    packets: [{ key: 'fixture', expectedRecords: 3,
      expectedTypeCounts: { lesson: 1, worked_example: 1, question: 1 },
      curriculum: { board: 'IB_DP', subject: 'Physics', level: 'HL', language: 'en' },
      manifest: { path: 'manifest.json', sha256: sha256(body) },
      resources: [{ id: 'lesson', path: 'lesson.txt', sha256: sha256(resource) }], contexts: [], promptRepairs: [] }] };
  const path = join(root, 'batch.json');
  const save = async () => writeFile(path, json(batch));
  await save();
  return { root, path, data, batch, save };
}

test('normalizes source shapes while preserving private solutions and publication holds', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  assert.deepEqual(bundle.summary, { packets: 1, records: 3, lessons: 1, workedExamples: 1, questions: 1,
    guidedRepeatQuestions: 0, repairedPrompts: 0, sourceResourcesVerified: 1, unsupportedRuntimeSubjectRecords: 0,
    teacherApproved: 0, runtimeExportRecords: 0, productionImported: 0 });
  assert.equal(bundle.reviewCatalog.records[2].solution.answer, 'PRIVATE QUESTION ANSWER');
  assert.equal(bundle.learnerPreview.records[1].workedSolution.answer, 'WORKED ANSWER');
  const learnerQuestion = bundle.learnerPreview.records[2];
  assert.equal(Object.hasOwn(learnerQuestion, 'solution'), false);
  assert.equal(Object.hasOwn(learnerQuestion, 'provenance'), false);
  assert.equal(JSON.stringify(bundle.learnerPreview).includes('PRIVATE QUESTION'), false);
  assert.ok(bundle.reviewCatalog.records.every((record) => record.review.teacherApproved === false && record.review.publicationStatus === 'held-from-index'));
});

test('supports array manifests and legacy item_id without changing their source IDs', async (t) => {
  const f = await fixture(t);
  const array = rows().map(({ id, ...row }) => ({ item_id: id, ...row }));
  const body = json(array);
  await writeFile(join(f.root, 'manifest.json'), body);
  f.batch.packets[0].manifest.sha256 = sha256(body);
  await f.save();
  assert.deepEqual((await loadCurriculumBatch(f.path)).reviewCatalog.records.map((r) => r.id), array.map((r) => r.item_id));
});

test('does not promote source approval claims into publication or teacher approval', async (t) => {
  const f = await fixture(t, (data) => {
    data.teacher_approved = true;
    data.production_import_performed = true;
    data.publication_status = 'published';
  });
  const bundle = await loadCurriculumBatch(f.path);
  assert.ok(bundle.reviewCatalog.records.every((r) => r.review.teacherApproved === false && r.review.productionImportPerformed === false));
  assert.equal(bundle.summary.runtimeExportRecords, 0);
});

test('unsupported current runtime subjects remain explicitly held without remapping the board', async (t) => {
  const f = await fixture(t);
  f.batch.packets[0].curriculum.subject = 'Computer Science';
  await f.save();
  const bundle = await loadCurriculumBatch(f.path);
  assert.equal(bundle.summary.unsupportedRuntimeSubjectRecords, 3);
  assert.ok(bundle.reviewCatalog.records.every((r) => r.curriculum.board === 'IB_DP' && r.review.requiredActions.includes('runtime-subject-mapping-review')));
});

for (const [name, mutation, expected] of [
  ['unsupported schema', (data) => { data.schema_version = '2.0'; }, /unsupported manifest schema/],
  ['declared-count corruption', (data) => { data.record_count = 99; }, /record_count mismatch/],
  ['duplicate identity', (data) => { data.records[2].id = data.records[0].id; }, /Duplicate record id/],
  ['conflicting identity aliases', (data) => { data.records[1].item_id = 'DIFFERENT'; }, /conflicting id aliases/],
  ['unknown type', (data) => { data.records[2].type = 'pretend_official_exam'; }, /Unknown record type/],
  ['missing question prompt', (data) => { delete data.records[2].prompt; }, /prompt: nonempty text/],
  ['unresolved worksheet reference', (data) => { data.records[2].prompt = 'See learner pack item Q001.'; }, /unresolved prompt reference/],
  ['missing answer', (data) => { data.records[2].answer = ''; }, /answer: nonempty text/],
]) {
  test(`rejects ${name}`, async (t) => {
    const f = await fixture(t, mutation);
    await assert.rejects(loadCurriculumBatch(f.path), expected);
  });
}

test('rejects source checksum mismatch and source escape through a symlink', async (t) => {
  const f = await fixture(t);
  await writeFile(join(f.root, 'lesson.txt'), 'Changed after the packet was prepared');
  await assert.rejects(loadCurriculumBatch(f.path), /source checksum mismatch/);
  const outside = await mkdtemp(join(tmpdir(), 'vertexed-source-outside-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeFile(join(outside, 'external.txt'), 'External resource');
  await rm(join(f.root, 'lesson.txt'));
  await symlink(join(outside, 'external.txt'), join(f.root, 'lesson.txt'));
  f.batch.packets[0].resources[0].sha256 = sha256('External resource');
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /source path leaves/);
});

test('rejects duplicate IDs across packets rather than silently dropping or overwriting rows', async (t) => {
  const f = await fixture(t);
  f.batch.packets.push({ ...structuredClone(f.batch.packets[0]), key: 'second' });
  f.batch.expectedRecords = 6;
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /Duplicate record id/);
});

async function repairedFixture(t) {
  const f = await fixture(t, (data) => { data.records[2].prompt = 'See learner pack item Q001.'; });
  const extraction = { schemaVersion: 1, sourceDocumentResourceId: 'lesson',
    sourceDocumentSha256: f.batch.packets[0].resources[0].sha256,
    paragraphs: ['Original reading passage.', 'Ask about the original reading passage.'] };
  const body = json(extraction);
  await writeFile(join(f.root, 'paragraphs.json'), body);
  const packet = f.batch.packets[0];
  packet.resources.push({ id: 'paragraphs', path: 'paragraphs.json', sha256: sha256(body) });
  packet.contexts = [{ id: 'reading', title: 'Reading', text: extraction.paragraphs[0], resourceId: 'lesson',
    paragraphSourceResourceId: 'paragraphs', sourceParagraphsZeroIndexed: [0] }];
  packet.promptRepairs = [{ recordId: 'UNIT-Q1', from: 'See learner pack item Q001.', to: extraction.paragraphs[1],
    resourceId: 'lesson', paragraphSourceResourceId: 'paragraphs', sourceParagraphZeroIndexed: 1, contextIds: ['reading'] }];
  await f.save();
  return f;
}

test('resolves a placeholder only with a source-bound exact prompt and all required reading context', async (t) => {
  const f = await repairedFixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  assert.equal(bundle.summary.repairedPrompts, 1);
  assert.equal(bundle.learnerPreview.records[2].prompt, 'Ask about the original reading passage.');
  assert.deepEqual(bundle.learnerPreview.records[2].contextIds, ['fixture:reading']);
  assert.equal(bundle.learnerPreview.contexts[0].text, 'Original reading passage.');
});

test('rejects altered repair text, unresolved context and altered source reading', async (t) => {
  const f = await repairedFixture(t);
  const packet = f.batch.packets[0];
  packet.promptRepairs[0].to = 'Invented replacement';
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /repaired prompt differs/);
  packet.promptRepairs[0].to = 'Ask about the original reading passage.';
  packet.promptRepairs[0].contextIds = ['missing'];
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /unresolved prompt context/);
  packet.promptRepairs[0].contextIds = ['reading'];
  packet.contexts[0].text = 'Altered passage';
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /context differs/);
});

test('private imports are atomic, restricted on disk, idempotent, and immutable after creation', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  const output = join(f.root, 'private-imports');
  const first = await stageCurriculumBatch(bundle, output);
  assert.equal(first.idempotentReuse, false);
  const catalogPath = join(first.directory, 'review-catalog.json');
  assert.equal(await readFile(join(first.directory, 'lesson.txt'), 'utf8'), 'Original private teaching resource.');
  assert.equal(await readFile(join(first.directory, 'manifest.json'), 'utf8'), await readFile(join(f.root, 'manifest.json'), 'utf8'));
  const reloaded = await loadCurriculumBatch(join(first.directory, 'source-batch.json'));
  assert.equal(reloaded.bundleSha256, bundle.bundleSha256, 'a private import includes every source needed for a fresh reload');
  const initial = await stat(catalogPath);
  assert.equal(initial.mode & 0o777, 0o600);
  assert.equal((await stat(first.directory)).mode & 0o777, 0o700);
  const second = await stageCurriculumBatch(bundle, output);
  assert.equal(second.idempotentReuse, true);
  assert.equal((await stat(catalogPath)).mtimeMs, initial.mtimeMs);
  assert.deepEqual(await readdir(output), [bundle.bundleSha256]);
  await writeFile(catalogPath, 'Deliberately altered for immutable-store test');
  await assert.rejects(stageCurriculumBatch(bundle, output), /refusing overwrite/);
  assert.equal(await readFile(catalogPath, 'utf8'), 'Deliberately altered for immutable-store test');
});

test('refuses public, application and symlinked-public destinations before creating files', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  for (const location of ['public', 'src', 'dist', '.git']) {
    await assert.rejects(stageCurriculumBatch(bundle, join(f.root, location, 'imports')), /Refusing an application/);
  }
  await mkdir(join(f.root, 'public'));
  await symlink(join(f.root, 'public'), join(f.root, 'apparently-private'));
  await assert.rejects(stageCurriculumBatch(bundle, join(f.root, 'apparently-private', 'imports')), /Refusing an application/);
  assert.deepEqual(await readdir(join(f.root, 'public')), []);
});

test('rejects a mutated validated bundle and a malicious import-directory digest', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  bundle.learnerPreview.records[2].answer = 'Injected private answer';
  await assert.rejects(stageCurriculumBatch(bundle, join(f.root, 'private-imports')), /Bundle changed after validation/);
  bundle.bundleSha256 = '../outside';
  await assert.rejects(stageCurriculumBatch(bundle, join(f.root, 'private-imports')), /Invalid bundle SHA/);
});

test('detects resource mutation after validation before writing a private store', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  bundle.sourceFiles.set('lesson.txt', Buffer.from('Mutated source after validation'));
  await assert.rejects(stageCurriculumBatch(bundle, join(f.root, 'private-imports')), /Source bytes changed/);
});

test('receipt counts and approval fields cannot change after bundle validation', async (t) => {
  const f = await fixture(t);
  const bundle = await loadCurriculumBatch(f.path);
  bundle.summary.records = 999;
  bundle.summary.teacherApproved = 999;
  await assert.rejects(stageCurriculumBatch(bundle, join(f.root, 'private-imports')), /Bundle changed after validation/);
});

test('general context bindings do not require rewriting the original prompt', async (t) => {
  const f = await repairedFixture(t);
  f.batch.packets[0].recordContextBindings = [{ recordId: 'UNIT-EXAMPLE', contextIds: ['reading'], dependencyIds: [] }];
  await f.save();
  const bundle = await loadCurriculumBatch(f.path);
  assert.deepEqual(bundle.learnerPreview.records[1].contextIds, ['fixture:reading']);
  assert.equal(bundle.learnerPreview.records[1].prompt, 'Show one example.');
});

test('missing and cyclic exercise dependencies are rejected; a real premise dependency is retained', async (t) => {
  const f = await fixture(t);
  const packet = f.batch.packets[0];
  packet.recordContextBindings = [{ recordId: 'UNIT-Q1', contextIds: [], dependencyIds: ['ABSENT'] }];
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /Unresolved exercise dependency/);
  packet.recordContextBindings[0].dependencyIds = ['UNIT-Q1'];
  await f.save();
  await assert.rejects(loadCurriculumBatch(f.path), /Cyclic exercise dependency/);
  packet.recordContextBindings[0].dependencyIds = ['UNIT-EXAMPLE'];
  await f.save();
  const bundle = await loadCurriculumBatch(f.path);
  assert.deepEqual(bundle.learnerPreview.records[2].dependencyIds, ['UNIT-EXAMPLE']);
});

test('questions duplicating visible worked examples are labeled guided repetition', async (t) => {
  const f = await fixture(t, (data) => {
    data.records[2].prompt = data.records[1].prompt;
    data.records[2].answer = data.records[1].answer;
  });
  const bundle = await loadCurriculumBatch(f.path);
  assert.equal(bundle.summary.guidedRepeatQuestions, 1);
  assert.equal(bundle.learnerPreview.records[2].practiceMode, 'guided-repetition');
  assert.deepEqual(bundle.reviewCatalog.records[2].review.answerSharedWithWorkedExampleIds, ['UNIT-EXAMPLE']);
});

test('line-based algorithm context preserves the original line separators', async (t) => {
  const f = await repairedFixture(t);
  const packet = f.batch.packets[0];
  packet.contexts[0].sourceParagraphsZeroIndexed = [0, 1];
  packet.contexts[0].joinWith = '\n';
  packet.contexts[0].text = 'Original reading passage.\nAsk about the original reading passage.';
  await f.save();
  assert.equal((await loadCurriculumBatch(f.path)).learnerPreview.contexts[0].text, packet.contexts[0].text);
});
