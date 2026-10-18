import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';
import { filterAdaptivePublicationModule, filterPublishedModule, moduleContentPath } from '../scripts/content-publication-modules.mjs';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { contentHash } from '../scripts/content-publication.mjs';

const evaluate = async (source) => import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64')}`);

test('public modules omit unapproved bodies while their authoring source remains available', async () => {
  for (const [file, name] of [['src/content/formulaReference.ts', 'FORMULA_REFERENCE'], ['src/content/examPractice.ts', 'EXAM_DRILLS']]) {
    const source = await readFile(file, 'utf8');
    const original = await evaluate(source);
    assert.ok(original[name].length > 0);
    const filtered = await filterPublishedModule(source, file, { approvals: [], allowedStatic: new Set() });
    assert.deepEqual((await evaluate(filtered))[name], []);
    assert.ok(!filtered.includes(original[name][0].prompt ?? original[name][0].practice.prompt));
    assert.equal(await readFile(file, 'utf8'), source);
  }
});

test('one exact module approval permits only that item and does not permit changed answers', async () => {
  const file = 'src/content/formulaReference.ts';
  const source = await readFile(file, 'utf8');
  const { FORMULA_REFERENCE: original } = await evaluate(source);
  const item = original[0];
  const approval = { path: moduleContentPath(file, item.id), editorialStatus: 'approved', publicationStatus: 'published',
    source: 'https://example.edu/fixture', factualReviewer: 'Test fixture only', reviewedAt: '2026-01-01',
    license: 'original-authorised', permittedUse: 'public-study', contentVersion: 'fixture-v1', answerVersion: 'fixture-v1',
    contentHash: contentHash(JSON.stringify(item)),
  };
  const result = await filterPublishedModule(source, file, { approvals: [approval], allowedStatic: new Set() });
  assert.deepEqual((await evaluate(result)).FORMULA_REFERENCE, [item]);
  const changed = source.replace('answer: 5,', 'answer: 6,');
  assert.notEqual(changed, source);
  assert.deepEqual((await evaluate(await filterPublishedModule(changed, file, { approvals: [approval], allowedStatic: new Set() }))).FORMULA_REFERENCE, []);
});

test('held AP/MYP catalogues expose directory identities and honest zero available-content counts', async () => {
  const apSource = await readFile('src/content/apCatalogue.ts', 'utf8');
  const ap = await evaluate(await filterPublishedModule(apSource, 'src/content/apCatalogue.ts', { approvals: [], allowedStatic: new Set() }));
  assert.equal(ap.AP_COURSES.length, 42);
  assert.equal(ap.AP_TOTALS.questions, 0);
  assert.equal(ap.AP_TOTALS.modules, 0);
  assert.ok(ap.AP_COURSES.every((course) => course.summary.includes('awaiting subject review') && course.modules.length === 0));
  const mypSource = await readFile('src/content/myp5Catalogue.ts', 'utf8');
  const myp = await evaluate(await filterPublishedModule(mypSource, 'src/content/myp5Catalogue.ts', { approvals: [], allowedStatic: new Set() }));
  assert.equal(myp.MYP5_CONTENT_CATALOGUE.length, 17);
  assert.deepEqual(myp.MYP5_CONTENT_TOTALS, { lessons: 0, questions: 0 });
  assert.equal(myp.MYP5_CONTENT_CATALOGUE.reduce((sum, item) => sum + item.questionCount, 0), 0);
});

test('active adaptive publication boundary matches the history-safe filtered module', async () => {
  const source = await readFile('src/content/adaptiveQuestionBank.mjs', 'utf8');
  assert.equal(await filterPublishedModule(source, 'src/content/adaptiveQuestionBank.mjs', { approvals: [], allowedStatic: new Set() }), await filterAdaptivePublicationModule(source, 'src/content/adaptiveQuestionBank.mjs'));
});

test('prepared adaptive publication filter retains descriptive history metadata without held bodies', async () => {
  const file = 'src/content/adaptiveQuestionBank.mjs';
  const source = await readFile(file, 'utf8');
  const filtered = await filterAdaptivePublicationModule(source, file);
  const result = await evaluate(filtered.replace(/import[^;]+complexNumbersPractice\.mjs';/, 'const COMPLEX_NUMBERS_PRACTICE = [];'));
  assert.deepEqual(result.ADAPTIVE_QUESTION_BANK, []);
  assert.equal(result.ADAPTIVE_QUESTION_METADATA.length, ADAPTIVE_QUESTION_BANK.length);
  assert.deepEqual(result.ADAPTIVE_QUESTION_METADATA.map((item) => item.id), ADAPTIVE_QUESTION_BANK.map((item) => item.id));
  for (const item of result.ADAPTIVE_QUESTION_METADATA) assert.deepEqual(Object.keys(item).sort(), ['concepts', 'curriculum', 'difficulty', 'id', 'subject', 'topic', 'type']);
  for (const question of ADAPTIVE_QUESTION_BANK) assert.ok(!filtered.includes(JSON.stringify(question.prompt)), question.id);
  assert.equal(await readFile(file, 'utf8'), source);
});

test('adaptive and standalone complex practice share exact revisions and do not publish definitions implicitly', async () => {
  const file = 'src/content/adaptiveQuestionBank.mjs';
  const item = ADAPTIVE_QUESTION_BANK[0];
  const approval = { path: moduleContentPath(file, item.id), editorialStatus: 'approved', publicationStatus: 'published',
    source: 'https://example.edu/fixture', factualReviewer: 'Test fixture only', reviewedAt: '2026-01-01',
    license: 'original-authorised', permittedUse: 'public-study', contentVersion: 'fixture-v1', answerVersion: 'fixture-v1',
    contentHash: contentHash(JSON.stringify(item)),
  };
  const source = await readFile(file, 'utf8');
  const filtered = await filterAdaptivePublicationModule(source, file, { approvals: [approval] });
  const result = await evaluate(filtered.replace(/import[^;]+complexNumbersPractice\.mjs';/, 'const COMPLEX_NUMBERS_PRACTICE = [];'));
  assert.deepEqual(result.ADAPTIVE_QUESTION_BANK, [{ ...item, contentRevision: approval.contentHash }]);
  const complexFile = 'src/content/complexNumbersPractice.mjs';
  const complexSource = await readFile(complexFile, 'utf8');
  const complex = await evaluate(await filterAdaptivePublicationModule(complexSource, complexFile, { approvals: [approval] }));
  assert.deepEqual(complex.COMPLEX_NUMBERS_PRACTICE, result.ADAPTIVE_QUESTION_BANK);
  assert.deepEqual(complex.COMPLEX_DEFINITIONS, {});
  const changed = complexSource.replace("'Find the modulus of $z=3+4i$.', 5,", "'Find the modulus of $z=3+4i$.', 6,");
  assert.notEqual(changed, complexSource);
  assert.deepEqual((await evaluate(await filterAdaptivePublicationModule(changed, complexFile, { approvals: [approval] }))).COMPLEX_NUMBERS_PRACTICE, []);
});
