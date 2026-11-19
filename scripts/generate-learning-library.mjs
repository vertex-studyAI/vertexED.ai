import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { foundationDepthSchema, learningLessonSchema, renderLearningLesson } from '../contracts/learningLibrary.js';
import { contentHash } from './content-publication.mjs';
import { readSyllabusSources, validateLessonMappings } from './syllabus-sources.mjs';
import { syllabusLessons, syllabusLessonSource } from '../src/content/syllabus-lessons/index.mjs';
import { subjectUnits, subjectUnitSource } from '../src/content/subject-units/index.mjs';

const root = resolve(import.meta.dirname, '..');
export function addFoundationDepth(source, extension) {
  const lesson = learningLessonSchema.parse(source);
  const pack = foundationDepthSchema.parse(extension);
  if (pack.lessonId !== lesson.id) throw new Error('Depth pack/lesson identity mismatch.');
  if (pack.revision === lesson.revision) throw new Error('Depth pack must carry a new revision.');
  const ids = pack.questions.map(question => question.id);
  if (!ids.every(id => id.startsWith('depth-'))) throw new Error('Depth questions require a depth- identity.');
  return learningLessonSchema.parse({
    ...lesson,
    revision: pack.revision,
    notes: [...lesson.notes, ...pack.notes],
    questions: [...lesson.questions, ...pack.questions],
    teachingSequence: [...(lesson.teachingSequence ?? []), {
      title: 'Apply and test the limits',
      guidance: 'Revisit the last worked example, then read the new section and tackle these different situations. Identify the assumptions before answering. Compare your reasoning with each marking point; these open responses require self-review, not automatic marks.',
      noteHeadings: pack.notes.map(note => note.heading),
      workedExampleNumbers: [lesson.workedExamples.length],
      questionIds: ids,
    }],
    ...(lesson.revisionGuide ? { revisionGuide: {
      ...lesson.revisionGuide,
      practiceQuestionIds: [...lesson.revisionGuide.practiceQuestionIds, ...ids],
    } } : {}),
  });
}

export async function readSubjectExpansion() {
  const folder = resolve(root, 'src/content/subject-expansion');
  const lessons = [];
  for (const file of (await readdir(folder)).filter(name => name.endsWith('.json')).sort()) {
    const lesson = learningLessonSchema.parse(JSON.parse(await readFile(resolve(folder, file), 'utf8')));
    if (file !== `${lesson.id}.json` || !lesson.id.startsWith('subject-')) throw new Error(`Subject module filename/id mismatch: ${file}`);
    lessons.push(lesson);
  }
  return lessons;
}

export function learningLessonSource(lesson) {
  return lesson.id.startsWith('unit-') ? subjectUnitSource(lesson.id)
    : lesson.id.startsWith('syllabus-') ? syllabusLessonSource(lesson.id)
    : `src/content/${lesson.id.startsWith('subject-') ? 'subject-expansion' : 'learning-library'}/${lesson.id}.json`;
}

export async function readLearningLibrary({ includeSubjectExpansion = true, includeSyllabusLessons = includeSubjectExpansion, includeSubjectUnits = includeSyllabusLessons } = {}) {
  const folder = resolve(root, 'src/content/learning-library');
  const depthFolder = resolve(root, 'src/content/foundation-depth');
  const files = (await readdir(folder)).filter(name => name.endsWith('.json')).sort();
  const depthFiles = (await readdir(depthFolder)).filter(name => name.endsWith('.json')).sort();
  if (JSON.stringify(files) !== JSON.stringify(depthFiles)) throw new Error('Every lesson needs exactly one depth pack; orphan packs are not allowed.');
  const lessons = [];
  for (const file of files) {
    const result = learningLessonSchema.safeParse(JSON.parse(await readFile(resolve(folder, file), 'utf8')));
    if (!result.success) throw new Error(`${file}: ${result.error.message}`);
    if (file !== `${result.data.id}.json`) throw new Error(`Lesson filename/id mismatch: ${file}`);
    try {
      lessons.push(addFoundationDepth(result.data, JSON.parse(await readFile(resolve(depthFolder, file), 'utf8'))));
    } catch (error) {
      throw new Error(`${file}: depth pack: ${error.message}`);
    }
  }
  if (!lessons.length) throw new Error('No authored lessons found.');
  if (includeSubjectExpansion) lessons.push(...await readSubjectExpansion());
  if (includeSyllabusLessons) lessons.push(...syllabusLessons.map(lesson => learningLessonSchema.parse(lesson)));
  if (includeSubjectUnits) lessons.push(...subjectUnits.map(lesson => learningLessonSchema.parse(lesson)));
  if (new Set(lessons.map(lesson => lesson.id)).size !== lessons.length) throw new Error('Duplicate lesson ids.');
  const prompts = lessons.flatMap(lesson => lesson.questions.map(q => q.prompt.trim().toLowerCase()));
  if (new Set(prompts).size !== prompts.length) throw new Error('Duplicate question across lessons.');
  validateLessonMappings(lessons, await readSyllabusSources());
  return lessons;
}

export async function generateLearningLibrary({ check = false } = {}) {
  const lessons = await readLearningLibrary();
  const sources = await readSyllabusSources();
  const destination = resolve(root, 'public/learning-library');
  if (!check) await mkdir(destination, { recursive: true });
  async function emit(name, body) {
    const path = resolve(destination, name);
    if (check) { if (await readFile(path, 'utf8') !== body) throw new Error(`Stale library asset: ${name}`); }
    else await writeFile(path, body);
  }
  const entries = [];
  for (const lesson of lessons) {
    const body = `${JSON.stringify(lesson)}\n`;
    const markdown = renderLearningLesson(lesson, sources);
    await emit(`${lesson.id}.json`, body); await emit(`${lesson.id}.md`, markdown);
    entries.push({ id: lesson.id, subject: lesson.subject, unit: lesson.unit, topic: lesson.topic, revision: lesson.revision,
      json: `/learning-library/${lesson.id}.json`, markdown: `/learning-library/${lesson.id}.md`,
      contentHash: contentHash(body), markdownHash: contentHash(markdown),
      answerVersion: contentHash(JSON.stringify(lesson.questions.map(q => ({ id: q.id, answer: q.answer, solution: q.solution, markingPoints: q.markingPoints, numericAnswer: q.numericAnswer })))),
      questionCount: lesson.questions.length, flashcardCount: lesson.flashcards.length,
      noteWords: lesson.notes.flatMap(section => section.paragraphs).join(' ').split(/\s+/).length,
      editorialStatus: lesson.editorialStatus });
  }
  const manifest = { schemaVersion: 1, scope: 'Original foundations and syllabus-unit authoring; not complete curricula or independently verified coverage.', entries };
  await emit('manifest.json', `${JSON.stringify(manifest)}\n`);
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { entries } = await generateLearningLibrary({ check: process.argv.includes('--check') });
  console.log(JSON.stringify({ lessons: entries.length, subjects: new Set(entries.map(entry => entry.subject)).size,
    noteWords: entries.reduce((sum, entry) => sum + entry.noteWords, 0), questions: entries.reduce((sum, entry) => sum + entry.questionCount, 0), flashcards: entries.reduce((sum, entry) => sum + entry.flashcardCount, 0) }));
}
