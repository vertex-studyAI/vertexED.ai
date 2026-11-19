import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { notebookRequestKey, runNotebookStudySet, STUDY_SET_VERSION, validCurriculumPath } from '../contracts/notebookStudySet.js';
import { validateNotebookOutput, lessonMarkdown } from '../contracts/learningOutputs.js';
import { createNotebook, addTextSource, saveNotebookCurriculum, saveOutput, reviseNotebookOutput, getNotebook, listNotebooks, setNotebookStorageScope } from '../src/lib/notebook.ts';

const course = { curriculum: 'SAT', board: 'College Board', syllabusVersion: '2026', subject: 'Math', unit: 'Algebra', topic: 'Linear equations', subtopic: 'One variable' };
const request = { notebookTitle: 'Algebra', curriculum: course, sources: [{ id: 's', title: 'My notes', excerpt: 'Subtract the same value from both sides of an equation.' }] };
export const lesson = { title: 'Solving linear equations', difficulty: 'foundation', objectives: ['Preserve equality.'],
  sections: [{ heading: 'Equality', explanation: 'An equation states equality.', sourceIds: ['s'] }, { heading: 'Inverse operations', explanation: 'Apply the same operation on both sides.', sourceIds: ['s'] }],
  workedExamples: [{ prompt: 'Solve x + 2 = 5.', steps: ['Subtract 2 from both sides.', 'Simplify the right side.'], answer: 'x = 3', sourceIds: ['s'] }],
  misconceptions: [{ misconception: 'Subtract from only one side.', correction: 'Subtract from both sides to preserve equality.', sourceIds: ['s'] }],
  summary: ['Keep the two sides equal.'], limitations: 'This is one example, not a syllabus map.' };
const response = async input => ({ mode: input.mode, title: input.mode, content: 'Draft from supplied notes', generatedAt: new Date().toISOString(),
  generation: { version: STUDY_SET_VERSION, requestKey: await notebookRequestKey(input), model: 'fixture', factualStatus: 'unreviewed', curriculum: input.curriculum } });

beforeEach(() => {
  const data = new Map(); globalThis.window = {};
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
  setNotebookStorageScope('study-set-owner');
});

test('curriculum paths require a specific version and remain unverified metadata', () => {
  assert.ok(validCurriculumPath(course));
  for (const patch of [{ syllabusVersion: '' }, { board: '' }, { curriculum: 'ANYTHING' }, { verified: true }, { topic: 'x'.repeat(161) }]) {
    assert.equal(validCurriculumPath({ ...course, ...patch }), false);
  }
});

test('request hashes change for source, syllabus, topic and format changes', async () => {
  const base = { ...request, mode: 'lesson' }; const key = await notebookRequestKey(base);
  assert.equal(key, await notebookRequestKey(structuredClone(base)));
  for (const patch of [{ mode: 'quiz' }, { curriculum: { ...course, syllabusVersion: '2027' } }, { curriculum: { ...course, topic: 'Quadratics' } },
    { sources: [{ ...request.sources[0], excerpt: 'Different source.' }] }, { customPrompt: 'Focus on applications' }]) {
    assert.notEqual(await notebookRequestKey({ ...base, ...patch }), key);
  }
  assert.notEqual(await notebookRequestKey({ ...base, sources: [{ content: 'one' }] }), await notebookRequestKey({ ...base, sources: [{ content: 'two' }] }));
});

test('study sets checkpoint successes and resume without charging for completed steps', async () => {
  const saved = []; const calls = []; let fail = true;
  const options = { request, findSaved: key => saved.find(item => item.generation.requestKey === key),
    generate: async input => { calls.push(input.mode); if (input.mode === 'quiz' && fail) throw new Error('Provider unavailable'); return response(input); },
    save: result => saved.push(result), onStep() {}, isCurrent: () => true };
  await assert.rejects(() => runNotebookStudySet(options), /Provider unavailable/);
  assert.deepEqual(saved.map(item => item.mode), ['lesson', 'flashcards']);
  fail = false;
  assert.equal((await runNotebookStudySet(options)).status, 'complete');
  assert.deepEqual(calls, ['lesson', 'flashcards', 'quiz', 'quiz', 'study-guide']);
  assert.equal((await runNotebookStudySet(options)).status, 'complete');
  assert.equal(calls.length, 5);
});

test('account/source changes or pause during generation cannot save an in-flight result', async () => {
  let current = true; let saves = 0; let calls = 0;
  const result = await runNotebookStudySet({ request, findSaved: () => null, generate: async input => { calls++; current = false; return response(input); },
    save: () => saves++, onStep() {}, isCurrent: () => current });
  assert.equal(result.status, 'paused'); assert.equal(saves, 0); assert.equal(calls, 1);
});

test('mismatched response or failed persistence stops subsequent paid calls', async () => {
  for (const badIdentity of [true, false]) {
    let calls = 0;
    await assert.rejects(() => runNotebookStudySet({ request, findSaved: () => null,
      generate: async input => { calls++; const result = await response(input); if (badIdentity) result.generation.requestKey = 'wrong'; return result; },
      save: () => { throw new Error('Storage full'); }, onStep() {}, isCurrent: () => true }));
    assert.equal(calls, 1);
  }
});

test('new notes require explanations, worked reasoning, misconceptions and source IDs', () => {
  assert.equal(validateNotebookOutput('lesson', lesson).success, true);
  assert.match(lessonMarkdown(lesson), /Worked example 1/);
  assert.match(lessonMarkdown(lesson), /\[Source: s\]/);
  for (const patch of [{ sections: [] }, { workedExamples: [] }, { misconceptions: [] }, { difficulty: 'verified' },
    { sections: [lesson.sections[0], lesson.sections[0]] }, { workedExamples: [{ ...lesson.workedExamples[0], sourceIds: [] }] }]) {
    assert.equal(validateNotebookOutput('lesson', { ...lesson, ...patch }).success, false);
  }
});

test('duplicate prompts and inconsistent MCQ keys are rejected', () => {
  const card = { front: 'What is equality?', back: 'A relationship.', sourceIds: ['s'] };
  assert.equal(validateNotebookOutput('flashcards', { flashcards: [card, { ...card, front: ' WHAT is equality? ' }] }).success, false);
  const question = { question: 'Solve x+2=5', type: 'mcq', options: ['3', '7'], answer: '3', explanation: 'Subtract two.', marks: 1, sourceIds: ['s'] };
  assert.equal(validateNotebookOutput('quiz', { questions: [question, question] }).success, false);
  assert.equal(validateNotebookOutput('quiz', { questions: [{ ...question, answer: '8' }] }).success, false);
});

test('curriculum and generated versions survive persistence and account switches', async () => {
  const notebook = createNotebook('Algebra', 'Math'); addTextSource(notebook.id, 'Notes', 'Equations');
  saveNotebookCurriculum(notebook.id, course);
  const output = await response({ ...request, mode: 'lesson' });
  saveOutput(notebook.id, { ...output, kind: 'lesson' });
  saveOutput(notebook.id, { ...output, kind: 'lesson', content: 'Second revision' });
  assert.equal(getNotebook(notebook.id).outputs.length, 2);
  assert.deepEqual(getNotebook(notebook.id).curriculum, course);
  setNotebookStorageScope('another-account'); assert.equal(listNotebooks().length, 0);
  setNotebookStorageScope('study-set-owner'); assert.equal(getNotebook(notebook.id).outputs[1].content, output.content);
  assert.throws(() => saveNotebookCurriculum(notebook.id, { ...course, syllabusVersion: '' }));
  assert.deepEqual(getNotebook(notebook.id).curriculum, course);
});

test('editing notes preserves original content and request identity on the original only', async () => {
  const notebook = createNotebook('Edit lesson');
  const original = await response({ ...request, mode: 'lesson' });
  const first = saveOutput(notebook.id, { ...original, kind: 'lesson' }).outputs[0];
  const edited = reviseNotebookOutput(notebook.id, first.id, 'My checked correction');
  assert.equal(edited.outputs[0].editedFrom, first.id);
  assert.equal(edited.outputs[0].generation, undefined);
  assert.equal(edited.outputs[1].content, original.content);
  assert.equal(edited.outputs[1].generation.requestKey, original.generation.requestKey);
  assert.throws(() => reviseNotebookOutput(notebook.id, first.id, ''));
  assert.equal(getNotebook(notebook.id).outputs.length, 2);
});
