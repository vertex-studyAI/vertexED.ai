import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLearningLibrary, learningLessonSource } from './generate-learning-library.mjs';
import { readSyllabusSources } from './syllabus-sources.mjs';
import { contentHash } from './content-publication.mjs';

export async function buildSyllabusCrosswalk(lessons) {
  lessons ??= await readLearningLibrary();
  const sources = await readSyllabusSources();
  const mappings = lessons.flatMap(lesson => (lesson.syllabusMappings ?? []).map(mapping => {
    const source = sources.find(source => source.id === mapping.sourceId);
    if (!source?.points.includes(mapping.point)) throw new Error(`Unregistered point: ${mapping.sourceId}/${mapping.point}`);
    return { ...mapping, programme: source.programme, board: source.board, subject: source.subject,
      specification: source.specification, syllabusVersion: source.version, sourceUrl: source.url, locator: source.locator,
      ...(source.inspectionMode ? { inspectionMode: source.inspectionMode, mappingKind: source.mappingKind } : {}),
      lessonId: lesson.id, lessonRevision: lesson.revision, contentHash: contentHash(`${JSON.stringify(lesson)}\n`),
      sourceRecordHash: contentHash(JSON.stringify(source)),
      sourceFile: learningLessonSource(lesson), deliveryRoute: `/resources/foundations/${lesson.id}`,
      independentReview: 'pending', coverageCredit: false };
  }));
  return { schemaVersion: 1, checkedOn: '2026-10-19',
    boundary: 'Official source points inspected and linked to specific original teaching and practice. These partial, author-proposed links are not independent review, publication approval or a complete syllabus denominator. Live web snapshots do not imply immutable editions.',
    summary: { sourceSpecifications: sources.length, mappedLessons: new Set(mappings.map(m=>m.lessonId)).size,
      mappingLinks: mappings.length, distinctSourcePoints: new Set(mappings.map(m=>`${m.sourceId}:${m.point}`)).size,
      programmesWithPartialMappings: [...new Set(mappings.map(m=>m.programme))].sort(), independentlyVerifiedMappings: 0, completedCourses: 0 },
    sources, mappings,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildSyllabusCrosswalk();
  const file = resolve(import.meta.dirname, '../docs/evidence/syllabus-crosswalk-20261019.json');
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(file, 'utf8') !== body) throw new Error('Syllabus crosswalk report is stale.');
  } else await writeFile(file, body);
  console.log(JSON.stringify(report.summary));
}
