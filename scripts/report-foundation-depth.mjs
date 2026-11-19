import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readLearningLibrary } from './generate-learning-library.mjs';
import { contentHash } from './content-publication.mjs';

const root = resolve(import.meta.dirname, '..');
const words = notes => notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length;

export async function buildFoundationDepthReport() {
  const lessons = await readLearningLibrary({ includeSubjectExpansion: false });
  const entries = await Promise.all(lessons.map(async lesson => {
    const source = await readFile(resolve(root, 'src/content/learning-library', `${lesson.id}.json`), 'utf8');
    const pack = await readFile(resolve(root, 'src/content/foundation-depth', `${lesson.id}.json`), 'utf8');
    const original = JSON.parse(source), extension = JSON.parse(pack);
    const json = await readFile(resolve(root, 'public/learning-library', `${lesson.id}.json`), 'utf8');
    if (json !== `${JSON.stringify(lesson)}\n`) throw new Error(`Stale library asset: ${lesson.id}`);
    return {
      lessonId: lesson.id, subject: lesson.subject, previousRevision: original.revision, revision: lesson.revision,
      sourceHash: contentHash(source), depthPackHash: contentHash(pack), deliveredHash: contentHash(json),
      originalQuestions: original.questions.length, addedQuestions: extension.questions.length,
      retiredGeneratedRetrievalPrompts: Math.max(0, 25 - original.questions.length),
      questions: lesson.questions.length, addedNoteWords: words(extension.notes), noteWords: words(lesson.notes),
      newQuestionIds: extension.questions.map(question => question.id),
      editorialStatus: lesson.editorialStatus,
    };
  }));
  const total = field => entries.reduce((sum, entry) => sum + entry[field], 0);
  return {
    schemaVersion: 1, revision: '2026-10-21.3',
    scope: 'Explicit authored depth packs for existing shared foundations, not complete curricula or independent subject approval.',
    summary: {
      lessons: entries.length, subjects: new Set(entries.map(entry => entry.subject)).size,
      originalQuestions: total('originalQuestions'), addedQuestions: total('addedQuestions'),
      retiredGeneratedRetrievalPrompts: total('retiredGeneratedRetrievalPrompts'), questions: total('questions'),
      addedNoteWords: total('addedNoteWords'), noteWords: total('noteWords'),
      approvedLessons: 0,
    },
    reviewLimits: [
      'Numerical and structural tests are not independent editorial review.',
      'New open responses require self-review; no new automatic scoring key is introduced.',
      'New practice carries no inherited syllabus-mapping credit.',
      'Original lesson files and source mappings are preserved; generated retrieval aliases are no longer delivered.',
    ],
    entries,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await buildFoundationDepthReport();
  const destination = resolve(root, 'docs/evidence/foundation-depth-20261021.json');
  const body = `${JSON.stringify(report, null, 2)}\n`;
  if (process.argv.includes('--check')) {
    if (await readFile(destination, 'utf8') !== body) throw new Error('Stale foundation depth receipt.');
  } else await writeFile(destination, body);
  console.log(JSON.stringify(report.summary));
}
