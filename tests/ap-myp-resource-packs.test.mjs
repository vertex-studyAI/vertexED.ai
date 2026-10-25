import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { isStudyPack, isAdditionalMypPractice } from '../contracts/studyPack.js';
import { isApCourse } from '../contracts/apContent.js';
import { verifyPublishedContent } from '../scripts/verify-published-content.mjs';

const read = async (path) => JSON.parse(await readFile(path, 'utf8'));
const courses = await Promise.all((await readdir('src/content/ap')).filter(name => name.endsWith('.json')).map(name => read(`src/content/ap/${name}`)));
const manifest = await read('public/myp5-content/manifest.json');
const subjects = await Promise.all(manifest.subjects.map(subject => read(`public/myp5-content/${subject.slug}.json`)));
const baseline = await read('docs/evidence/ap-myp-original-content-hashes-20261021.json');
const sorted = (value) => Array.isArray(value) ? value.map(sorted) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted(value[key])])) : value;
const hash = (value) => createHash('sha256').update(JSON.stringify(sorted(value))).digest('hex');
const units = [...courses.flatMap(course => course.modules), ...subjects.flatMap(subject => subject.lessons)];

test('all 479 AP/MYP modules have notes, distinct worked examples, four cards, linked diagrams and two additional questions', () => {
  assert.equal(courses.length, 42); assert.equal(subjects.length, 17); assert.equal(units.length, 479);
  let addedQuestions = 0;
  for (const unit of units) {
    const pack = unit.studyPack;
    assert.ok(isStudyPack(pack), unit.id);
    assert.ok(pack.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length >= 70, unit.id);
    assert.equal(pack.workedExamples.length, 1, unit.id);
    assert.notEqual(pack.workedExamples[0].prompt, unit.workedExample.prompt, unit.id);
    assert.equal(new Set(pack.flashcards.map(card => card.front)).size, 4, unit.id);
    const questions = unit.questions ?? unit.practice;
    const added = questions.filter(question => question.id.startsWith('extension-'));
    assert.equal(added.length, 2, unit.id); addedQuestions += added.length;
    assert.equal(new Set(questions.map(question => question.prompt)).size, questions.length, unit.id);
    for (const question of added) {
      assert.ok(question.hints.length >= 2, question.id);
      assert.equal(question.marks, 3, question.id);
      assert.equal((question.checkpoints ?? question.successCriteria).length, 3, question.id);
      if (question.successCriteria) assert.ok(question.successCriteria.every(point => point.length <= 200), question.id);
    }
  }
  assert.equal(addedQuestions, 958);
  assert.equal(courses.flatMap(course => course.modules).reduce((sum, unit) => sum + unit.questions.length, 0), 1115);
  assert.equal(manifest.questionCount, 1026);
});

test('every original course field, lesson and answer is preserved under its captured hash', () => {
  for (const course of courses) {
    const original = structuredClone(course);
    for (const unit of original.modules) {
      delete unit.studyPack;
      unit.questions = unit.questions.filter(question => !question.id.startsWith('extension-'));
    }
    assert.equal(hash(original), baseline.ap[course.slug], course.slug);
  }
  for (const subject of subjects) {
    const original = structuredClone(subject);
    for (const lesson of original.lessons) {
      delete lesson.studyPack;
      lesson.practice = lesson.practice.filter(question => !question.id.startsWith('extension-'));
    }
    assert.equal(hash(original), baseline.myp[subject.subjectSlug], subject.subjectSlug);
  }
});

test('MYP supplements match the delivered lessons and globally unique question identities', async () => {
  const ids = new Set();
  for (const subject of subjects) {
    const supplement = await read(`src/content/myp5-resources/${subject.subjectSlug}.json`);
    assert.deepEqual(Object.keys(supplement.lessons).sort(), subject.lessons.map(lesson => lesson.id).sort());
    for (const lesson of subject.lessons) {
      const addition = supplement.lessons[lesson.id];
      assert.ok(isAdditionalMypPractice(addition.additionalPractice), lesson.id);
      assert.deepEqual(addition.studyPack, lesson.studyPack, lesson.id);
      assert.deepEqual(lesson.practice.slice(-2), addition.additionalPractice, lesson.id);
      for (const question of lesson.practice) {
        assert.ok(!ids.has(question.id), question.id); ids.add(question.id);
      }
    }
  }
});

test('resource validation rejects missing teaching bodies, broken graph links and unsafe references', () => {
  const sample = courses.find(course => course.slug === 'calculus-ab');
  for (const mutate of [
    pack => { pack.notes[0].paragraphs = []; },
    pack => { pack.workedExamples[0].conclusion = ''; },
    pack => { pack.flashcards[1].id = pack.flashcards[0].id; },
    pack => { pack.flashcards.pop(); },
    pack => { pack.diagrams[0].edges[0].to = 'missing'; },
    pack => { pack.diagrams[0].nodes.push({ id: 'unconnected', label: 'Orphan', detail: 'This node has no relationship.' }); },
    pack => { pack.references = [{ title: 'Unsafe', url: 'javascript:alert(1)', note: 'Invalid link.' }]; },
  ]) {
    const course = structuredClone(sample); mutate(course.modules[0].studyPack);
    assert.equal(isStudyPack(course.modules[0].studyPack), false);
    assert.equal(isApCourse(course), false);
  }
});

test('emitted bundle inspection catches leaked AP and MYP extension prose', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'vertex-ap-myp-leak-'));
  try {
    const apText = courses[0].modules[0].studyPack.notes[0].paragraphs[0];
    const mypText = subjects[0].lessons[0].studyPack.notes[0].paragraphs[0];
    await writeFile(join(directory, 'leak.js'), `const ap=${JSON.stringify(apText)}; const myp=${JSON.stringify(mypText)};`);
    const result = await verifyPublishedContent(directory, { approvals: [] });
    assert.equal(result.status, 'FAIL');
    assert.equal(result.violations.filter(item => item.reason === 'held-ap-myp-teaching-body').length, 2);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('selected new numerical examples preserve independent unit and denominator calculations', () => {
  const lesson = (subject, topic) => subjects.find(item => item.subjectSlug === subject).lessons.find(item => item.topic === topic);
  const answer = (subject, topic, index = 0) => lesson(subject, topic).practice.slice(-2)[index].solution.join(' ');
  assert.match(answer('design', 'Specifications'), new RegExp(`${300 - 2 * 12} mm`));
  assert.match(answer('design', 'Ideation'), new RegExp(`A scores 2 × 5 + 2 = ${2 * 5 + 2}`.replace('+', '\\+')));
  assert.match(answer('physical-health-education', 'Physiology'), new RegExp(`${22 * (60 / 20)} beats per minute`));
  assert.match(answer('physical-health-education', 'Nutrition'), new RegExp(`${12 * 25 / 100} g`));
  assert.match(answer('physical-health-education', 'Strategy'), new RegExp(`${8 / 10 * 100}%`));
  assert.match(answer('physical-health-education', 'Strategy'), new RegExp(`${12 / 20 * 100}%`));
  assert.match(answer('music', 'Experimentation'), /total is 2 beats/);
  assert.match(answer('music', 'Experimentation', 1), /elapsed duration remains the same/);
  assert.match(answer('spanish', 'Exam strategies'), new RegExp(`${25 - 4 - 6} minutes remain`));
  const physiology = lesson('physical-health-education', 'Physiology').studyPack.workedExamples[0];
  assert.match(physiology.conclusion, new RegExp(`${70 * 60 / 1000} L/min`));
});
