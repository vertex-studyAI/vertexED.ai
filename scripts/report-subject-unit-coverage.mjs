import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { learningLessonSchema } from '../contracts/learningLibrary.js';
import { subjectUnits, subjectUnitSource } from '../src/content/subject-units/index.mjs';
import { subjectUnitSources, subjectUnitTargets, routesForTarget } from '../src/content/subject-units/coverage.mjs';
import { contentHash, publicationResponse } from './content-publication.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/evidence/subject-unit-coverage-20261022.json');
export function validateSubjectUnitCoverage(targets = subjectUnitTargets, lessons = subjectUnits, sources = subjectUnitSources) {
  const ids = lessons.map(l => l.id);
  if (new Set(ids).size !== ids.length) throw new Error('Duplicate subject-unit lesson.');
  lessons.forEach(lesson => learningLessonSchema.parse(lesson));
  const courseIds = targets.map(t => `${t.programme}:${t.qualificationCode}`);
  if (new Set(courseIds).size !== courseIds.length) throw new Error('Duplicate subject-unit target.');
  for (const t of targets) {
    if (!sources[t.sourceId] || !t.pointScope || t.remaining.length < 2) throw new Error('Missing source, scope or backlog.');
    if (t.complete !== false || t.independentlyReviewed !== false || t.verifiedCoveragePercent !== null) throw new Error('Unapproved coverage claim.');
    if (!t.lessonIds.length || new Set(t.lessonIds).size !== t.lessonIds.length) throw new Error('Missing or duplicate lesson references.');
    for (const route of routesForTarget(t, lessons)) for (const evidence of route.lessons) {
      if (!evidence.questionIds.length) throw new Error('Empty programme/tier practice route.');
    }
  }
  for (const id of ids) if (!targets.some(t => t.lessonIds.includes(id))) throw new Error(`Orphan subject unit: ${id}`);
  for (const id of Object.keys(sources)) if (!targets.some(t => t.sourceId === id)) throw new Error(`Orphan source: ${id}`);
  return true;
}

export async function buildSubjectUnitCoverage() {
  validateSubjectUnitCoverage();
  const manifest = JSON.parse(await readFile(resolve(root, 'public/learning-library/manifest.json'), 'utf8'));
  const receipts = [];
  for (const lesson of subjectUnits) {
    const entry = manifest.entries.find(e => e.id === lesson.id);
    if (!entry) throw new Error(`Missing generated unit: ${lesson.id}`);
    const sourceFile = subjectUnitSource(lesson.id);
    const asset = await readFile(resolve(root, `public${entry.json}`), 'utf8');
    const markdown = await readFile(resolve(root, `public${entry.markdown}`), 'utf8');
    if (asset !== `${JSON.stringify(learningLessonSchema.parse(lesson))}\n` || contentHash(asset) !== entry.contentHash || contentHash(markdown) !== entry.markdownHash) throw new Error(`Stale subject unit: ${lesson.id}`);
    const jsonStatus = (await publicationResponse(entry.json)).status;
    const markdownStatus = (await publicationResponse(entry.markdown)).status;
    receipts.push({ lessonId: lesson.id, subject: lesson.subject, sourceFile,
      sourceHash: contentHash(await readFile(resolve(root, sourceFile), 'utf8')), asset: entry.json, markdown: entry.markdown,
      contentHash: entry.contentHash, markdownHash: entry.markdownHash, answerVersion: entry.answerVersion,
      noteWords: entry.noteWords, questions: lesson.questions.length, workedExamples: lesson.workedExamples.length,
      flashcards: lesson.flashcards.length, publication: { jsonStatus, markdownStatus }, editorialStatus: lesson.editorialStatus });
  }
  const dependencies = await Promise.all(['src/content/subject-units/authoring.mjs','src/content/subject-units/index.mjs',
    'src/content/subject-units/coverage.mjs','contracts/learningLibrary.js'].map(async path => ({ path, hash: contentHash(await readFile(resolve(root,path),'utf8')) })));
  const total = key => receipts.reduce((sum,r) => sum+r[key],0);
  return { schemaVersion: 1, checkedOn: '2026-10-22',
    boundary: 'Actual authored topic lessons and questions for 26 non-maths priority course targets. Selected official sections were inspected; this is not full specification inspection, independent subject review or whole-course completion. Remaining lists are a strand backlog, not an exhaustive point denominator.',
    summary: { lessons: receipts.length, courseTargets: subjectUnitTargets.length,
      subjects: new Set(subjectUnitTargets.map(t => t.subject)).size, noteWords: total('noteWords'), questions: total('questions'),
      workedExamples: total('workedExamples'), flashcards: total('flashcards'),
      tieredCourseTargets: subjectUnitTargets.filter(t => routesForTarget(t,subjectUnits).length === 2).length,
      completedCourses: 0, independentlyReviewedLessons: 0, publishedLessons: receipts.filter(r => r.publication.jsonStatus === 200).length },
    dependencies, sources: subjectUnitSources, lessonReceipts: receipts,
    targets: subjectUnitTargets.map(t => ({ ...t, routes: routesForTarget(t,subjectUnits) })),
  };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildSubjectUnitCoverage();
  const body = `${JSON.stringify(report,null,2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(output,'utf8') !== body) throw new Error('Subject-unit report is stale.');
  } else await writeFile(output,body);
  console.log(JSON.stringify(report.summary));
}
