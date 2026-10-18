import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import ts from 'typescript';
import { filterPublishedModule, contentPublicationModulesPlugin } from '../scripts/content-publication-modules.mjs';
import { ARCHIVE_FILE, LEGACY_MODULES, TEACHING_SECTIONS, TEACHING_FUNCTIONS, teachingFunctionDeclaration, readLegacyPublication, readLiteral } from '../scripts/legacy-content-publication.mjs';
import { verifyPublishedContent } from '../scripts/verify-published-content.mjs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

const evaluate = async (source) => import(`data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64')}`);
const fixtureApproval = (item) => ({ path: item.path, contentHash: item.hash, editorialStatus: 'approved', publicationStatus: 'published',
  source: 'https://example.edu/fixture-only', factualReviewer: 'Unit-test fixture, not an approval', reviewedAt: '2026-01-01',
  license: 'original-authorised', permittedUse: 'public-study', contentVersion: 'fixture-1', answerVersion: 'fixture-1' });

test('finite legacy inventory preserves 23 article sources, 21 archive samples and identified teaching surfaces', async () => {
  const inventory = await readLegacyPublication({ approvals: [] });
  assert.equal(inventory.modules.filter((item) => item.kind === 'editorial-article').length, 23);
  assert.deepEqual(Object.fromEntries(Object.entries(inventory.archiveSamples).map(([subject, tabs]) => [subject, Object.values(tabs).flat().length])), { LnL: 9, History: 6, Geography: 6 });
  assert.equal(inventory.modules.length, 29);
  assert.equal(inventory.sections.length, 10);
  assert.equal(inventory.heldRoutes.size, 29);
  assert.ok([...inventory.modules, ...inventory.sections].every((item) => !item.approved && /^sha256:[a-f0-9]{64}$/.test(item.hash)));
});

test('whole-module holds remove original imports, JSX, structured data and examples without editing authoring files', async () => {
  for (const item of LEGACY_MODULES) {
    const source = await readFile(item.file, 'utf8');
    const filtered = await filterPublishedModule(source, item.file, { approvals: [] });
    assert.ok(filtered.includes('ContentReviewNotice'), item.file);
    assert.ok(!filtered.includes('ARCHIVE_SAMPLES') && !filtered.includes('application/ld+json') && !filtered.includes('useState'), item.file);
    const imports = [...filtered.matchAll(/from '([^']+)'/g)].map((match) => match[1]);
    assert.ok(imports.every((name) => ['@/components/ContentReviewNotice', 'react-router'].includes(name)), item.file);
    assert.equal(await readFile(item.file, 'utf8'), source);
    await assert.rejects(() => contentPublicationModulesPlugin().transform(source, `${resolve(item.file)}?raw`), /cannot bypass/);
  }
});

test('only exact whole-source approval releases a legacy module; changes fail closed and discovery agrees', async () => {
  const inventory = await readLegacyPublication({ approvals: [] });
  const article = inventory.modules.find((item) => item.kind === 'editorial-article');
  const approvals = [fixtureApproval(article)];
  assert.equal(await filterPublishedModule(article.source, article.file, { approvals }), article.source);
  assert.match(await filterPublishedModule(`${article.source}\n// source changed`, article.file, { approvals }), /ContentReviewNotice/);
  const file = 'src/content/resourceLibrary.ts';
  const publicLibrary = await evaluate(await filterPublishedModule(await readFile(file, 'utf8'), file, { approvals }));
  assert.deepEqual(publicLibrary.RESOURCE_ARTICLES.map((item) => item.to), [article.route]);
  assert.equal(publicLibrary.RESOURCE_ARTICLE_DIRECTORY.filter((item) => item.available).length, 1);
  assert.deepEqual(publicLibrary.ARCHIVE_COLLECTIONS, []);
  const archive = inventory.modules.find((item) => item.file === ARCHIVE_FILE);
  assert.equal(await filterPublishedModule(archive.source, archive.file, { approvals: [fixtureApproval(archive)] }), archive.source);
});

test('held directories retain titles without links and educational sections retain safe usable states', async () => {
  const file = 'src/content/resourceLibrary.ts';
  const publicLibrary = await evaluate(await filterPublishedModule(await readFile(file, 'utf8'), file, { approvals: [] }));
  assert.deepEqual(publicLibrary.RESOURCE_ARTICLES, []);
  assert.deepEqual(publicLibrary.ARCHIVE_COLLECTIONS, []);
  assert.equal(publicLibrary.RESOURCE_ARTICLE_DIRECTORY.length, 23);
  assert.equal(publicLibrary.ARCHIVE_DIRECTORY.length, 3);
  assert.ok([...publicLibrary.RESOURCE_ARTICLE_DIRECTORY, ...publicLibrary.ARCHIVE_DIRECTORY].every((item) => !item.available && !('to' in item)));
  for (const item of TEACHING_SECTIONS) {
    const source = await readFile(item.file, 'utf8');
    const original = await readLiteral(source, item.file, item.name);
    const filtered = await filterPublishedModule(source, item.file, { approvals: [] });
    const actual = await readLiteral(filtered, item.file, item.name);
    assert.deepEqual(actual, item.heldValue ? item.heldValue(original) : Array.isArray(original) ? [] : {});
    assert.equal(await readFile(item.file, 'utf8'), source);
  }
});

test('tool preview holds remove teaching bodies while preserving navigation and bind exact function source', async () => {
  const item = TEACHING_FUNCTIONS[0];
  const source = await readFile(item.file, 'utf8');
  const filtered = await filterPublishedModule(source, item.file, { approvals: [] });
  assert.equal(teachingFunctionDeclaration(filtered, item).value, item.replacement);
  assert.ok(!filtered.includes('Water enters by osmosis'));
  assert.ok(filtered.includes('Open tool') && filtered.includes('Previous tool detail') && filtered.includes('AccessibleModal'));
  assert.equal(await readFile(item.file, 'utf8'), source);
  const inventory = await readLegacyPublication({ approvals: [] });
  const record = inventory.sections.find((entry) => entry.name === item.name);
  assert.equal(await filterPublishedModule(source, item.file, { approvals: [fixtureApproval(record)] }), source);
  const changed = await filterPublishedModule(source.replace('Water enters by osmosis', 'Changed biology answer'), item.file, { approvals: [fixtureApproval(record)] });
  assert.equal(teachingFunctionDeclaration(changed, item).value, item.replacement);
  assert.ok(!changed.includes('Changed biology answer'));
});

test('artifact verifier rejects held archive, article and landing bodies plus discovery URLs in actual emitted files', async () => {
  const folder = await mkdtemp(resolve(tmpdir(), 'legacy-publication-test-'));
  try {
    const inventory = await readLegacyPublication({ approvals: [] });
    const sample = inventory.archiveSamples.LnL.Overview[0].body;
    const gallery = inventory.modules.find((item) => item.kind === 'worked-examples');
    const examples = await readLiteral(gallery.source, gallery.file, 'examples');
    await writeFile(resolve(folder, 'chunk.js'), `console.log(${JSON.stringify(sample)},${JSON.stringify(examples[0].answer)});`);
    await writeFile(resolve(folder, 'sitemap.xml'), '<urlset><url><loc>https://www.vertexed.app/resources/ai-study-planner</loc></url></urlset>');
    const rejected = await verifyPublishedContent(folder, { approvals: [] });
    assert.equal(rejected.status, 'FAIL');
    assert.equal(rejected.violations.filter((item) => item.reason === 'held-legacy-teaching-body').length, 2);
    assert.ok(rejected.violations.some((item) => item.reason === 'held-legacy-sitemap-route'));
    // The router and stored workflow metadata retain route identities for an honest held destination.
    // A navigation field matching a held section is not an educational-body leak.
    await writeFile(resolve(folder, 'chunk.js'), 'console.log("Awaiting subject review", "/resources/active-recall-spaced-repetition");');
    await writeFile(resolve(folder, 'sitemap.xml'), '<urlset><url><loc>https://www.vertexed.app/resources</loc></url></urlset>');
    assert.equal((await verifyPublishedContent(folder, { approvals: [] })).status, 'PASS');
  } finally { await rm(folder, { recursive: true, force: true }); }
});
