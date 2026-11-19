import assert from 'node:assert/strict';
import test from 'node:test';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { readSyllabusSources } from '../scripts/syllabus-sources.mjs';

const lessons = await readLearningLibrary();
const lesson = id => lessons.find(item => item.id === id);
const question = (id, key) => lesson(id).questions.find(item => item.id === key);
const numeric = (id, key, value) => assert.ok(Math.abs(question(id, key).numericAnswer.value - value) < 1e-12, `${id}/${key}`);

test('expanded chemistry keys conserve atom counts and distinguish isotope means from particle counts', () => {
  // Explicit atom inventories are separate from the authored answer strings.
  const oxideKey = question('mass-conservation', 'q3').answer;
  assert.equal(oxideKey, '4Fe+3O₂ → 2Fe₂O₃.');
  const [iron, oxygen, oxide] = [...oxideKey.matchAll(/(?:^|[+→]\s*)(\d+)/g)].map(match => Number(match[1]));
  assert.equal(iron, oxide * 2);
  assert.equal(oxygen * 2, oxide * 3);
  const atoms = { Al: 2, S: 3, O: 12 };
  const masses = { Al: 27, S: 32, O: 16 };
  const formulaMass = Object.entries(atoms).reduce((total, [element, count]) => total + count * masses[element], 0);
  assert.equal(lesson('mass-conservation').workedExamples[1].answer, `${formulaMass}.`);
  const isotopeSample = [...Array(70).fill(10), ...Array(30).fill(11)];
  numeric('atomic-models', 'q4', isotopeSample.reduce((sum, value) => sum + value, 0) / isotopeSample.length);
  assert.equal(lesson('atomic-models').workedExamples[0].answer, '13 protons, 14 neutrons and 10 electrons.');
  assert.equal(13 + 14, 27);
  assert.equal(13 - 10, 3);
  const sulfur = { protons: 16, neutrons: question('atomic-models', 'q2').numericAnswer.value };
  assert.equal(sulfur.protons + sulfur.neutrons, 34);
});

test('probability answers agree with ordered object enumeration rather than reused tree arithmetic', () => {
  function enumerate(red, blue) {
    const counters = [...Array(red).fill('R'), ...Array(blue).fill('B')];
    const outcomes = [];
    for (let i = 0; i < counters.length; i++) for (let j = 0; j < counters.length; j++) {
      if (i !== j) outcomes.push([counters[i], counters[j]]);
    }
    return outcomes;
  }
  const outcomes = enumerate(3, 2);
  assert.equal(outcomes.length, 20);
  numeric('probability-trees', 'q2', outcomes.filter(([a, b]) => a === 'R' && b === 'R').length / outcomes.length);
  numeric('probability-trees', 'q4', outcomes.filter(([a, b]) => a !== b).length / outcomes.length);
  const example = enumerate(4, 2);
  assert.equal(example.filter(([a, b]) => a !== b).length / example.length, 8 / 15);
  assert.equal(lesson('probability-trees').workedExamples[1].answer, '8/15.');
  const students = Array.from({ length: 50 }, (_, index) => ({ art: index < 20, music: index < 8 }));
  const artStudents = students.filter(student => student.art);
  numeric('probability-trees', 'q6', artStudents.filter(student => student.music).length / artStudents.length);
  assert.notEqual(artStudents.filter(student => student.music).length / students.length, question('probability-trees', 'q6').numericAnswer.value);
});

test('specified search traces terminate on boundary cases and match an independent membership oracle', () => {
  // Executable interpretation of the stated editorial algorithm, not a new product search API.
  function binary(items, target) {
    let low = 0;
    let high = items.length - 1;
    const trace = [];
    while (low <= high) {
      assert.ok(trace.length <= items.length, 'candidate interval must make progress');
      const mid = Math.floor((low + high) / 2);
      trace.push(mid);
      if (items[mid] === target) return { index: mid, trace };
      if (items[mid] < target) low = mid + 1;
      else high = mid - 1;
    }
    return { index: -1, trace };
  }
  let cases = 0;
  for (let length = 0; length <= 32; length++) {
    const items = Array.from({ length }, (_, index) => Math.floor(index / 2) * 3 - 7);
    for (let target = -10; target <= 45; target++) {
      const result = binary(items, target);
      assert.equal(result.index !== -1, items.includes(target));
      if (result.index !== -1) assert.equal(items[result.index], target);
      else assert.equal(items.indexOf(target), -1);
      cases++;
    }
  }
  assert.equal(cases, 1848);
  const data = [1, 4, 7, 10, 13, 16, 19];
  assert.deepEqual(binary(data, 16), { index: 5, trace: [3, 5] });
  assert.equal(question('searching-algorithms', 'q3').answer, 'Visited 3 then 5; returned index 5.');
  const missing = binary(data, 12);
  assert.deepEqual(missing, { index: -1, trace: [3, 5, 4] });
  numeric('searching-algorithms', 'q4', missing.trace.length);
  assert.deepEqual(binary([], 5), { index: -1, trace: [] });
  assert.deepEqual(binary([3, 7], 7), { index: 1, trace: [0, 1] });
});

test('new partial mappings preserve inspected version, tier and evidence boundaries', async () => {
  const sources = await readSyllabusSources();
  const source = id => sources.find(item => item.id === id);
  assert.match(source('aqa-8525-algorithms-2025').version, /First teaching September 2025/);
  assert.match(source('aqa-8525-algorithms-2025').limitations, /not automatic mapping to earlier cohorts/);
  const probability = lesson('probability-trees').syllabusMappings;
  assert.match(probability.find(mapping => mapping.point === 'P9').tier, /Higher only/);
  assert.match(probability.find(mapping => mapping.point === 'P8').tier, /Additional Foundation/);
  const newLessons = lessons.filter(item => ['atomic-models', 'mass-conservation', 'probability-trees', 'respiration-metabolism', 'searching-algorithms', 'words-in-context'].includes(item.id));
  assert.deepEqual(newLessons.map(item => item.id), ['atomic-models', 'mass-conservation', 'probability-trees', 'respiration-metabolism', 'searching-algorithms', 'words-in-context']);
  assert.equal(newLessons.flatMap(item => item.syllabusMappings).length, 20);
  for (const item of newLessons) {
    // Previously mapped questions retain exact links; application and depth packs remain unmapped.
    const mappedQuestions = new Set(item.syllabusMappings.flatMap(mapping => mapping.questionIds));
    for (const practice of item.questions) assert.equal(mappedQuestions.has(practice.id), !['application-check', 'error-analysis'].includes(practice.id) && !practice.id.startsWith('depth-'), `${item.id}/${practice.id}`);
    assert.equal(item.editorialStatus, 'unreviewed');
    for (const mapping of item.syllabusMappings) {
      assert.equal(mapping.status, 'source-checked-partial');
      assert.ok(mapping.remaining.length > 0);
    }
  }
  assert.match(lesson('words-in-context').scope, /fictional/);
  assert.match(lesson('respiration-metabolism').scope, /not health advice/);
});
