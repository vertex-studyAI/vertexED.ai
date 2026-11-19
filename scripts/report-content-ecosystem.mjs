import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContentCoverage } from './generate-content-coverage.mjs';
import { buildCurriculumScope } from './report-curriculum-scope.mjs';
import { buildSubjectPathways } from './report-subject-pathways.mjs';
import { buildSyllabusUnitCoverage } from './report-syllabus-unit-coverage.mjs';
import { buildSubjectUnitCoverage } from './report-subject-unit-coverage.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/evidence/content-ecosystem-20261019.json');
export const REQUESTED_PROGRAMMES = ['IB_MYP', 'IB_DP', 'AP', 'GCSE', 'IGCSE', 'A_LEVELS', 'SAT', 'UNIVERSITY', 'CBSE', 'ICSE'];

export async function buildEcosystemReport() {
  const inventory = await buildContentCoverage();
  const scope = await buildCurriculumScope();
  const pathways = await buildSubjectPathways();
  const units = await buildSyllabusUnitCoverage();
  const subjectUnits = await buildSubjectUnitCoverage();
  return {
    version: 'vertexed-content-ecosystem-v1',
    boundary: 'Authored source inventory. Counts are not independent review, live availability or exhaustive syllabus coverage. Unknown denominators remain null.',
    programmes: REQUESTED_PROGRAMMES.map(programme => {
      const rows = inventory.rows.filter(row => row.programme === programme);
      const topicTargets = subjectUnits.targets.filter(target => target.programme === programme);
      const topicLessons = new Set(topicTargets.flatMap(target => target.lessonIds));
      const topicPractice = new Set(topicTargets.flatMap(target => target.routes.flatMap(route => route.lessons.flatMap(lesson =>
        lesson.questionIds.map(id => `${lesson.lessonId}:${id}`)))));
      return { programme, authoredRecords: rows.length, questions: rows.reduce((sum, row) => sum + (row.questionCount ?? 0), 0),
        sourceCheckedPartialTopicAuthoring: { courseTargets: topicTargets.length, lessons: topicLessons.size,
          programmeScopedQuestions: topicPractice.size, report: 'docs/evidence/subject-unit-coverage-20261022.json',
          boundary: 'These are real shared-library topic lessons with programme-specific question routes, separate from course records; not a whole-course denominator.' },
        publishedRecords: rows.filter(row => row.publicationStatus === 'published').length,
        requiredTopicCount: null, verifiedCoveragePercent: null, complete: false,
        missing: ['authoritative-versioned-topic-denominator', 'independent-answer-and-subject-review', 'complete-topic-resources'],
        resources: rows.map(row => ({ id: row.id, subject: row.subject, unit: row.unit, topic: row.topic,
          syllabusVersion: row.syllabusVersion, sourceFile: row.sourceFile, contentVersion: row.contentVersion,
          answerVersion: row.answerVersion, publicationStatus: row.publicationStatus, gaps: row.gaps })),
      };
    }),
    sharedOriginalResources: inventory.rows.filter(row => row.programme === 'SHARED_ORIGINAL').length,
    authoredLearningLibrary: inventory.summary.sharedLearningLibrary,
    curriculumScope: { report: 'docs/evidence/curriculum-scope-20261019.json', ...scope.summary },
    subjectPathways: { report: 'docs/evidence/subject-pathways-20261021.json', ...pathways.summary },
    syllabusUnitAuthoring: { report: 'docs/evidence/syllabus-unit-coverage-20261021.json', ...units.summary },
    nonMathsTopicAuthoring: { report: 'docs/evidence/subject-unit-coverage-20261022.json', ...subjectUnits.summary },
    partialSyllabusCrosswalk: scope.partialSyllabusCrosswalk,
    existingInventorySummary: inventory.summary,
    courseSummaries: inventory.courseSummaries,
    engineering: { privateStudySets: 'source-based-generation; requires supplied material',
      apMypReaders: { studyPackVersion: '2026-10-21.1',
        resources: ['notes', 'additional-worked-examples', 'flashcards', 'labelled-concept-diagrams', 'integrated-question-banks'],
        apWorking: 'temporary in-memory answers with course-text export',
        mypWorking: 'existing scoped device drafts; globally unique question identities',
        validation: 'exact payload hashes; shared resource schema; internal editorial and selected numerical checks',
        publication: 'all new packs remain subject to exact-hash editorial approval' },
      foundationReader: { route: '/resources/foundations', publication: 'exact-hash-approved-assets-only',
        studyModes: ['notes', 'labelled-diagrams-where-authored', 'guided-study-where-authored', 'flashcards', 'practice', 'revision-guide-where-authored', 'revision-checklist'],
        progress: 'account-and-content-hash-scoped-device-only; explicit save; conflict and corruption protection',
        grading: 'MCQ key and numeric-value comparison only; no full-mark or mastery attribution',
        exports: ['learner-answers-json', 'separately-approved-lesson-markdown'] },
      hierarchy: ['curriculum', 'board', 'syllabusVersion', 'subject', 'unit', 'topic', 'subtopic'],
      modes: ['lesson', 'flashcards', 'quiz', 'study-guide'],
      persistence: 'existing owner-scoped notebook snapshot; device checkpoint and account sync',
      worker: 'browser sequence; not an unattended server worker',
      generatedAnswers: 'provisional; excluded from measured mastery' },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildEcosystemReport();
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(output, 'utf8') !== body) throw new Error('Content ecosystem report is stale. Run scripts/report-content-ecosystem.mjs.');
  } else await writeFile(output, body);
  console.log(JSON.stringify(report.programmes.map(programme => ({ ...programme, resources: undefined })), null, 2));
}
