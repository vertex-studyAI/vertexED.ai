import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { learningLessonSchema } from '../contracts/learningLibrary.js';
import { syllabusLessons, syllabusLessonSource } from '../src/content/syllabus-lessons/index.mjs';
import { unitCoverage, unitSources, courseBacklog } from '../src/content/syllabus-lessons/coverage.mjs';
import { contentHash } from './content-publication.mjs';

const root = resolve(import.meta.dirname, '..');
const distinct = list => new Set(list).size === list.length;
export function validateUnitCoverage(units = unitCoverage, lessons = syllabusLessons, sources = unitSources) {
  if (!distinct(units.map(unit => unit.id)) || !distinct(lessons.map(lesson => lesson.id)) || !distinct(sources.map(source => source.id))) throw new Error('Duplicate unit, lesson or source identity.');
  const covered = new Set();
  for (const unit of units) {
    if (!sources.some(source => source.id === unit.sourceId)) throw new Error(`Missing source: ${unit.id}`);
    if (!unit.expectedPoints.length || !distinct(unit.expectedPoints) || !distinct(unit.points.map(p => p.code)) || JSON.stringify(unit.points.map(p => p.code)) !== JSON.stringify(unit.expectedPoints)) throw new Error(`Missing, extra or duplicated requirement: ${unit.id}`);
    for (const point of unit.points) {
      if (!point.criteria.length || !point.teaching.length) throw new Error(`Empty requirement: ${point.code}`);
      for (const evidence of point.teaching) {
        const lesson = lessons.find(lesson => lesson.id === evidence.lessonId);
        if (!lesson) throw new Error(`Missing teaching: ${evidence.lessonId}`);
        learningLessonSchema.parse(lesson);
        if (!evidence.noteNumbers.length || !distinct(evidence.noteNumbers) || !evidence.noteNumbers.every(i => Number.isInteger(i) && i > 0 && i <= lesson.notes.length)) throw new Error(`Missing notes: ${point.code}`);
        if (!evidence.questionIds.length || !distinct(evidence.questionIds) || !evidence.questionIds.every(id => lesson.questions.some(q => q.id === id))) throw new Error(`Missing practice: ${point.code}`);
        for (const id of evidence.questionIds) {
          const prompt = lesson.questions.find(q => q.id === id).prompt;
          const label = prompt.match(/^\[([^\]]+)\]/)?.[1] ?? '';
          if (unit.tier === 'Core' && !label.includes('IGCSE Core/Extended')) throw new Error(`Core tier contamination: ${point.code}/${id}`);
          if (unit.tier === 'Foundation' && !label.includes('GCSE Foundation/Higher')) throw new Error(`Foundation tier contamination: ${point.code}/${id}`);
          if (unit.tier === 'Extended' && !label.includes('IGCSE')) throw new Error(`Extended tier mismatch: ${point.code}/${id}`);
          if (unit.tier === 'Higher' && !label.includes('GCSE')) throw new Error(`Higher tier mismatch: ${point.code}/${id}`);
          if (unit.tier === 'A-Level' && label !== 'A-Level') throw new Error(`A-Level tier mismatch: ${point.code}/${id}`);
        }
        covered.add(lesson.id);
      }
    }
  }
  if (covered.size !== lessons.length) throw new Error('Orphan syllabus lesson without unit evidence.');
  return true;
}

export async function buildSyllabusUnitCoverage() {
  validateUnitCoverage();
  const receipts = await Promise.all(syllabusLessons.map(async original => {
    const lesson = learningLessonSchema.parse(original);
    const sourceFile = syllabusLessonSource(lesson.id);
    const asset = `/learning-library/${lesson.id}.json`;
    const body = await readFile(resolve(root, `public${asset}`), 'utf8');
    if (body !== `${JSON.stringify(lesson)}\n`) throw new Error(`Stale unit delivery: ${lesson.id}`);
    return { lessonId: lesson.id, sourceFile, sourceHash: contentHash(await readFile(resolve(root, sourceFile), 'utf8')),
      contentHash: contentHash(body), asset, route: `/resources/foundations/${lesson.id}`,
      noteWords: lesson.notes.flatMap(n => n.paragraphs).join(' ').split(/\s+/).length,
      workedExamples: lesson.workedExamples.length, questions: lesson.questions.length, flashcards: lesson.flashcards.length,
      editorialStatus: 'unreviewed', publicationStatus: 'held' };
  }));
  const total = field => receipts.reduce((sum, row) => sum + row[field], 0);
  return { schemaVersion: 1, snapshotDate: '2026-10-21',
    boundary: 'New original teaching against finite Number/Proof unit point lists. All links are author-proposed and need independent subject review. Point coverage is not verified mastery, full assessment coverage, a complete course, or publication approval. A named point may contain multiple subskills; the criteria and teaching must be reviewed together, not reduced to a link count.',
    summary: { sources: unitSources.length, tieredUnits: unitCoverage.length, unitPointRows: unitCoverage.reduce((sum, u) => sum + u.points.length, 0),
      distinctSourcePoints: new Set(unitCoverage.flatMap(u => u.points.map(p => `${u.sourceId}/${p.code}`))).size,
      lessons: receipts.length, noteWords: total('noteWords'), workedExamples: total('workedExamples'), questions: total('questions'), flashcards: total('flashcards'),
      independentlyReviewedUnits: 0, completedCourses: 0, publishedLessons: 0 },
    sources: unitSources,
    units: unitCoverage.map(unit => ({ ...unit, status: 'author-proposed-unit-teaching-review-pending', verifiedCoveragePercent: null,
      points: unit.points.map(point => ({ ...point, teaching: point.teaching.map(evidence => {
        const lesson = syllabusLessons.find(l => l.id === evidence.lessonId);
        return { ...evidence, noteHeadings: evidence.noteNumbers.map(i => lesson.notes[i-1].heading), contentHash: receipts.find(r => r.lessonId === lesson.id).contentHash };
      }) })) })),
    lessonReceipts: receipts, courseBacklog,
    widerBacklog: 'All other subjects in the 30 GCSE/IGCSE/A-Level planning targets and the remaining programme catalogue still need authoritative topic-by-topic authoring. Existing shared/AP/MYP drafts are retained but do not close those gaps.',
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildSyllabusUnitCoverage();
  const file = resolve(root, 'docs/evidence/syllabus-unit-coverage-20261021.json');
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(file, 'utf8') !== body) throw new Error('Syllabus unit coverage report is stale.');
  } else await writeFile(file, body);
  console.log(JSON.stringify(report.summary));
}
