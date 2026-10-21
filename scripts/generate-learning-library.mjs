import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { learningLessonSchema, renderLearningLesson } from '../contracts/learningLibrary.js';
import { contentHash } from './content-publication.mjs';
import { readSyllabusSources, validateLessonMappings } from './syllabus-sources.mjs';

const root = resolve(import.meta.dirname, '..');
const MINIMUM_PRACTICE_PROMPTS = 25;

/**
 * Add low-stakes retrieval prompts from the lesson's existing authored cards.
 *
 * The source cards remain the editorial source of truth: these prompts only
 * offer additional ways to retrieve and explain that material. They have no
 * automated mark, syllabus mapping or claim of measured mastery.
 */
export function addRetrievalPractice(lesson) {
  const required = Math.max(0, MINIMUM_PRACTICE_PROMPTS - lesson.questions.length);
  if (!required) return lesson;

  const retrievalQuestions = Array.from({ length: required }, (_, index) => {
    const card = lesson.flashcards[index % lesson.flashcards.length];
    const wording = index % 3 === 0
      ? 'Answer from memory'
      : index % 3 === 1
        ? 'State the condition or distinction precisely'
        : 'Explain the idea in your own words';
    const number = String(index + 1).padStart(2, '0');
    return {
      id: `retrieval-${number}`,
      type: 'short',
      difficulty: index % 3 === 0 ? 'foundation' : index % 3 === 1 ? 'standard' : 'extension',
      prompt: `Retrieval ${index + 1} — ${lesson.topic}: ${wording}: ${card.front}`,
      answer: card.back,
      solution: [
        `Identify the target idea: ${card.front}`,
        `Compare your response with the held study explanation: ${card.back}`,
      ],
      markingPoints: [`Accurately address: ${card.front}`],
      marks: 1,
      calculator: 'not-applicable',
    };
  });

  return {
    ...lesson,
    questions: [...lesson.questions, ...retrievalQuestions],
    teachingSequence: [...(lesson.teachingSequence ?? []), {
      title: 'Retrieval practice',
      guidance: 'Close the notes and answer these extra prompts from memory. Self-review with the held explanation, name one gap, then retry later. This is study practice, not an automatic mark or mastery measurement.',
      noteHeadings: [lesson.notes[0].heading],
      workedExampleNumbers: [1],
      questionIds: retrievalQuestions.map(question => question.id),
    }],
  };
}

export async function readLearningLibrary() {
  const folder = resolve(root, 'src/content/learning-library');
  const lessons = [];
  for (const file of (await readdir(folder)).filter(name => name.endsWith('.json')).sort()) {
    const result = learningLessonSchema.safeParse(JSON.parse(await readFile(resolve(folder, file), 'utf8')));
    if (!result.success) throw new Error(`${file}: ${result.error.message}`);
    if (file !== `${result.data.id}.json`) throw new Error(`Lesson filename/id mismatch: ${file}`);
    const expanded = addRetrievalPractice(result.data);
    const expandedResult = learningLessonSchema.safeParse(expanded);
    if (!expandedResult.success) throw new Error(`${file}: retrieval practice: ${expandedResult.error.message}`);
    lessons.push(expandedResult.data);
  }
  if (!lessons.length) throw new Error('No authored lessons found.');
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
  const manifest = { schemaVersion: 1, scope: 'Shared original foundations; not a complete curriculum or verified syllabus mapping.', entries };
  await emit('manifest.json', `${JSON.stringify(manifest)}\n`);
  return manifest;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { entries } = await generateLearningLibrary({ check: process.argv.includes('--check') });
  console.log(JSON.stringify({ lessons: entries.length, subjects: new Set(entries.map(entry => entry.subject)).size,
    noteWords: entries.reduce((sum, entry) => sum + entry.noteWords, 0), questions: entries.reduce((sum, entry) => sum + entry.questionCount, 0), flashcards: entries.reduce((sum, entry) => sum + entry.flashcardCount, 0) }));
}
