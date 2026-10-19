import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildContentCoverage } from './generate-content-coverage.mjs';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'docs/evidence/content-ecosystem-20261019.json');
export const REQUESTED_PROGRAMMES = ['IB_MYP', 'IB_DP', 'AP', 'GCSE', 'IGCSE', 'A_LEVELS', 'SAT', 'UNIVERSITY', 'CBSE', 'ICSE'];

export async function buildEcosystemReport() {
  const inventory = await buildContentCoverage();
  return {
    version: 'vertexed-content-ecosystem-v1',
    boundary: 'Authored source inventory. Counts are not independent review, live availability or exhaustive syllabus coverage. Unknown denominators remain null.',
    programmes: REQUESTED_PROGRAMMES.map(programme => {
      const rows = inventory.rows.filter(row => row.programme === programme);
      return { programme, authoredRecords: rows.length, questions: rows.reduce((sum, row) => sum + (row.questionCount ?? 0), 0),
        publishedRecords: rows.filter(row => row.publicationStatus === 'published').length,
        requiredTopicCount: null, verifiedCoveragePercent: null, complete: false,
        missing: ['authoritative-versioned-topic-denominator', 'independent-answer-and-subject-review', 'complete-topic-resources'],
        resources: rows.map(row => ({ id: row.id, subject: row.subject, unit: row.unit, topic: row.topic,
          syllabusVersion: row.syllabusVersion, sourceFile: row.sourceFile, contentVersion: row.contentVersion,
          answerVersion: row.answerVersion, publicationStatus: row.publicationStatus, gaps: row.gaps })),
      };
    }),
    sharedOriginalResources: inventory.rows.filter(row => row.programme === 'SHARED_ORIGINAL').length,
    existingInventorySummary: inventory.summary,
    courseSummaries: inventory.courseSummaries,
    engineering: { privateStudySets: 'source-based-generation; requires supplied material',
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
