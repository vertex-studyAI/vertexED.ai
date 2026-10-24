import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile, readdir } from 'node:fs/promises';
import { addFoundationDepth, readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { foundationDepthSchema } from '../contracts/learningLibrary.js';
import { lintSource } from '../scripts/lint-copy.mjs';
import { buildFoundationDepthReport } from '../scripts/report-foundation-depth.mjs';

const read = async path => JSON.parse(await readFile(path, 'utf8'));
const lessons = await readLearningLibrary({ includeSubjectExpansion: false });
const originals = await Promise.all(lessons.map(lesson => read(`src/content/learning-library/${lesson.id}.json`)));
const packs = await Promise.all(lessons.map(lesson => read(`src/content/foundation-depth/${lesson.id}.json`)));
const question = (lessonId, suffix) => lessons.find(lesson => lesson.id === lessonId).questions.find(q => q.id === `depth-${suffix}`);

test('depth receipt binds the original, authored extension and delivered identities', async () => {
  const report = await buildFoundationDepthReport();
  assert.deepEqual(report, await read('docs/evidence/foundation-depth-20261021.json'));
  assert.equal(report.summary.originalQuestions, 385);
  assert.equal(report.summary.addedQuestions, 126);
  assert.equal(report.summary.retiredGeneratedRetrievalPrompts, 667);
  assert.equal(report.summary.questions, 511);
  assert.equal(report.summary.addedNoteWords, 3615);
  assert.equal(report.summary.approvedLessons, 0);
});

test('42 independently authored depth packs preserve every original teaching field and source link', async () => {
  assert.equal((await readdir('src/content/foundation-depth')).filter(name => name.endsWith('.json')).length, 42);
  assert.equal(packs.flatMap(pack => pack.questions).length, 126);
  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i], original = originals[i], pack = packs[i];
    assert.deepEqual(lesson, addFoundationDepth(original, pack));
    for (const field of ['workedExamples', 'flashcards', 'diagrams', 'syllabusMappings', 'misconceptions', 'objectives', 'scope', 'prerequisites', 'revisionChecklist']) {
      assert.deepEqual(lesson[field], original[field], `${lesson.id}/${field}`);
    }
    for (const field of ['notes', 'questions', 'teachingSequence']) {
      assert.deepEqual(lesson[field].slice(0, original[field].length), original[field], `${lesson.id}/${field}`);
    }
    assert.deepEqual(lesson.notes.slice(original.notes.length), pack.notes);
    assert.deepEqual(lesson.questions.slice(original.questions.length), pack.questions);
    assert.ok(pack.notes.flatMap(note => note.paragraphs).join(' ').split(/\s+/).length >= 70, lesson.id);
    assert.equal(lintSource(JSON.stringify(pack), `${lesson.id}.json`).length, 0);
    for (const q of pack.questions) {
      assert.ok(!original.questions.some(existing => existing.prompt === q.prompt || existing.answer === q.answer), q.id);
      assert.ok(!original.flashcards.some(card => card.back === q.answer), q.id);
      assert.equal(q.numericAnswer, undefined, 'reasoned multi-part tasks stay self-reviewed');
      assert.equal(q.marks, q.markingPoints.length);
    }
  }
});

test('depth contracts fail closed on misidentification, duplicates and unversioned changes', () => {
  const original = originals[0], pack = packs[0];
  for (const mutate of [
    p => { p.lessonId = 'another-lesson'; },
    p => { p.revision = original.revision; },
    p => { p.questions[0].id = 'q1'; },
    p => { p.questions[1].id = p.questions[0].id; },
    p => { p.questions[0].prompt = original.questions[0].prompt; },
    p => { p.notes[0].heading = original.notes[0].heading; },
    p => { p.questions[0].marks = 12; },
    p => { p.editorialStatus = 'approved'; },
    p => { p.questions = []; },
    p => { p.notes[0].paragraphs = []; },
  ]) {
    const changed = structuredClone(pack); mutate(changed);
    assert.throws(() => addFoundationDepth(original, changed));
  }
  assert.equal(foundationDepthSchema.safeParse(pack).success, true);
  assert.equal(pack.revision, '2026-10-21.3');
});

test('depth quantitative keys match independent arithmetic, units and boundary calculations', () => {
  // Explicit calculations, not values derived from the authored solutions. This
  // checks numeric claims, not independent approval of every prose explanation.
  const cases = [
    ['accounting-equation', 'credit-sale', [600 - 400]],
    ['arithmetic-sequences', 'strict-crossing', [Array.from({ length: 20 }, (_, i) => 47 - 3 * i).findIndex(x => x < 0) + 1, 47 - 3 * 16, 47 - 3 * 15]],
    ['arithmetic-sequences', 'equal-sums', [30 / 2, 9 * 30 / 2]],
    ['atomic-models', 'isotope-fraction', [Math.round((20.6 - 20) / (22 - 20) * 100)]],
    ['atomic-models', 'nuclear-change', [6 + 1, 6 + 8]],
    ['business-costs', 'step-cost', [600 / 6, 900 / 6]],
    ['business-costs', 'target-profit', [Math.ceil((163 + 450) / 5), 123 * 5 - 450, 122 * 5 - 450]],
    ['business-costs', 'margin-safety', [300 - 240, (300 - 240) / 300 * 100]],
    ['cell-transport', 'surface-volume', [6 * 1 ** 2 / 1 ** 3, 6 * 2 ** 2 / 2 ** 3]],
    ['chemical-amounts', 'solution-moles', [0.20 * 75 / 1000]],
    ['chemical-amounts', 'dilution', [0.80 * 25 / 100, 0.80 * 25 / 1000]],
    ['chemical-amounts', 'neutralisation', [Number((0.03 - 0.04 / 2).toFixed(3))]],
    ['data-representation', 'signed-pattern', [Number.parseInt('11111101', 2), Number.parseInt('11111101', 2) - 256]],
    ['data-representation', 'overflow', [250 + 12, (250 + 12) % 256]],
    ['data-representation', 'utf8-length', [40 + 10 * 3]],
    ['demand-and-supply', 'price-ceiling', [(80 - 20) / 3, 20 + 20, 80 - 2 * 15, 20 + 15, 80 - 2 * 15 - (20 + 15)]],
    ['demand-and-supply', 'unit-tax', [(60 - 10) / 2, (60 - 10) / 2 + 10]],
    ['ecosystem-energy', 'turnover', [200 / 20, 60 / 30]],
    ['ecosystem-energy', 'consumer-budget', [1000 - 300, 1000 - 300 - 500]],
    ['ecosystem-energy', 'area-conversion', [6000 * 2 * 10000, 6000 * 2 * 10000 - 90000000]],
    ['electric-circuits', 'internal-resistance', [12 / (1 + 5), 12 / 6 * 5, (12 / 6) ** 2 * 5]],
    ['electric-circuits', 'meter-loading', [12 * 5000 / (10000 + 5000), 12 / 2]],
    ['electric-circuits', 'parallel-power', [9 / 3, 9 / 6, 9 ** 2 * (1 / 3 + 1 / 6)]],
    ['evidence-and-inference', 'survey-denominator', [40 / 50 * 100, 40 / 200 * 100]],
    ['exponential-change', 'two-year-factor', [Math.sqrt(242 / 200), 200 * Math.sqrt(242 / 200)]],
    ['exponential-change', 'decay-threshold', [Array.from({ length: 10 }, (_, n) => n).find(n => 100 * 0.5 ** n < 4), 100 / 2 ** 5, 100 / 2 ** 4]],
    ['exponential-change', 'two-factors', [Math.round((1.1 ** 2 - 1) * 100)]],
    ['geographical-fieldwork', 'unequal-duration', [90 / 15, 80 / 10]],
    ['geographical-fieldwork', 'outlier-distribution', [[2, 3, 3, 4, 28].reduce((s, x) => s + x) / 5, [2, 3, 3, 4, 28][2]]],
    ['geometric-sequences', 'infinite-tail', [[8, 4, 2, 1, 0.5].reduce((s, x) => s + x), 8 / (1 - 0.5), 8 / (1 - 0.5) - 15.5]],
    ['geometric-sequences', 'constant-case', [7 * 9]],
    ['mass-conservation', 'tare-cancellation', [Number((53.70 - 50.20).toFixed(2))]],
    ['mass-conservation', 'mass-budget', [12 - 7.5 - 1.2]],
    ['mass-conservation', 'bounded-uncertainty', [10 - 3, 0.1 + 0.1]],
    ['motion-and-forces', 'return-journey', [3 * 4 - 2 * 6, 3 * 4 + 2 * 6, (3 * 4 + 2 * 6) / (4 + 6)]],
    ['motion-and-forces', 'velocity-crossing', [4 / 2, 4 * 4 - 4 ** 2, 2 * (0.5 * 2 * 4)]],
    ['photosynthesis-limits', 'gross-net', [6 + 3, 6 * 8]],
    ['photosynthesis-limits', 'bubble-volume', [20 * 0.05, 15 * 0.1]],
    ['probability-trees', 'exclusive-independent', [0.4 + 0.3, 0.4 * 0.3]],
    ['quadratic-models', 'bounded-area', [3 * (20 / 2 - 3)]],
    ['quadratic-models', 'integer-optimum', [Math.max(...Array.from({ length: 10 }, (_, n) => -2 * n ** 2 + 14 * n - 8))]],
    ['respiration-metabolism', 'minute-volume', [12 * 0.5, 20 * 0.75, (20 * 0.75) / (12 * 0.5)]],
    ['respiration-metabolism', 'variable-recovery', [0.5 * 4 * 0.6]],
    ['rhetorical-synthesis', 'different-intervals', [120 / 2, 150 / 3]],
    ['sampling-and-uncertainty', 'sample-target', [Math.ceil((15 / 2) ** 2)]],
    ['sampling-and-uncertainty', 'known-sigma-interval', [50 - 1.96 * 10 / Math.sqrt(100), 50 + 1.96 * 10 / Math.sqrt(100)]],
    ['scientific-investigation', 'calibration-slope', [18 / (12 / 10)]],
    ['scientific-investigation', 'sensitivity-analysis', [[5, 6, 7, 18].reduce((s, x) => s + x) / 4, (5 + 6 + 7) / 3]],
    ['wave-superposition', 'signed-displacements', [3 - 5]],
    ['wave-superposition', 'closed-column', [340 / (4 * 0.85), 3 * 340 / (4 * 0.85)]],
    ['wave-superposition', 'node-antinode', [2 * 0.4, 0.4 / 2]],
  ];
  for (const [id, suffix, values] of cases) {
    const answer = question(id, suffix).answer.replaceAll(',', '').replaceAll('−', '-');
    const numbers = (answer.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
    for (const value of values) assert.ok(numbers.some(n => Math.abs(n - value) < 1e-10), `${id}/${suffix}: ${value} missing from ${answer}`);
  }
  assert.equal(cases.length, 51);
});

test('probability keys agree with outcome enumeration and conditional denominators', () => {
  const genotypes = ['AA', 'Aa', 'aA', 'aa'];
  const dominant = genotypes.filter(pair => pair.includes('A'));
  assert.equal(dominant.filter(pair => pair.includes('a')).length / dominant.length, 2 / 3);
  assert.equal(question('inheritance-probability', 'conditional-genotype').answer, '2/3.');
  const families = Array.from({ length: 8 }, (_, n) => n.toString(2).padStart(3, '0'));
  assert.equal(families.filter(s => [...s].filter(c => c === '1').length === 1).length / families.length, 3 / 8);
  assert.equal(question('inheritance-probability', 'exactly-one').answer, '3/8.');
  const balls = ['R', 'B1', 'B2'];
  const withReplacement = balls.flatMap(a => balls.map(b => [a, b]));
  const withoutReplacement = withReplacement.filter(([a, b]) => a !== b);
  const bothBlue = outcomes => outcomes.filter(pair => pair.every(b => b.startsWith('B'))).length / outcomes.length;
  assert.equal(bothBlue(withReplacement), 4 / 9);
  assert.equal(bothBlue(withoutReplacement), 1 / 3);
  assert.match(question('probability-trees', 'replacement-comparison').answer, /4\/9.*1\/3/);
  const defectiveFlagged = 100 * 0.9, soundFlagged = 900 * 0.1;
  assert.equal(defectiveFlagged / (defectiveFlagged + soundFlagged), 1 / 2);
  assert.match(question('probability-trees', 'classification-base-rate').answer, /^1\/2/);
});

test('sequence and polynomial answers satisfy original equations across multiple inputs', () => {
  const sum = n => 2 * n ** 2 + 3 * n;
  for (let n = 1; n <= 100; n++) assert.equal(sum(n) - sum(n - 1), 4 * n + 1);
  assert.match(question('arithmetic-sequences', 'cumulative-rule').answer, /4n\+1/);
  assert.equal(-3 * (-2) ** (2 - 1), 6);
  assert.equal(-3 * (-2) ** (5 - 1), -48);
  assert.match(question('geometric-sequences', 'ratio-negative').answer, /r=-2 and a=-3/);
  for (let x = -10; x <= 10; x += 0.25) assert.equal(Math.abs(3 * (x + 2) * (x - 5) - (3 * x ** 2 - 9 * x - 30)), 0);
  assert.match(question('quadratic-structure', 'construct-roots').answer, /3x²-9x-30/);
  const roots = [3, 0.5];
  for (const x of roots) assert.equal(2 * x ** 2 - 7 * x + 3, 0);
  assert.equal(roots.reduce((s, x) => s + x ** 2, 0), 37 / 4);
  assert.match(question('quadratic-structure', 'root-relations').answer, /37\/4/);
  const solutions = [];
  for (let x = -10; x <= 10; x++) for (let y = -10; y <= 10; y++) if (x + y === 5 && x ** 2 + y ** 2 === 13) solutions.push([x, y]);
  assert.deepEqual(solutions, [[2, 3], [3, 2]]);
  assert.equal(question('simultaneous-systems', 'line-circle').answer, '(2,3) and (3,2).');
  for (let n = 0; n <= 10; n++) assert.notEqual(7 * n + 4 * (10 - n), 53);
  assert.match(question('simultaneous-systems', 'integer-feasibility').answer, /^No\./);
});

test('parameter exclusions and derivative counterexamples keep their mathematical conditions', () => {
  for (const k of [-3, 0, 0.5, 3, 7]) {
    const y = 2 / (k - 1), x = 4 - y;
    assert.ok(Math.abs(x + y - 4) < 1e-12);
    assert.ok(Math.abs(x + k * y - 6) < 1e-12);
  }
  assert.match(question('simultaneous-systems', 'parameter-system').answer, /k=1 there is no solution/);
  assert.equal((5 + 1) / (5 - 2), 2);
  assert.match(question('linear-equations', 'rational-restriction').answer, /x≠2/);
  for (const k of [-10, -6, -2, 0, 2, 6, 10]) assert.equal(k * k - 36 > 0, k < -6 || k > 6);
  assert.equal(question('quadratic-structure', 'parameter-discriminant').answer, 'k<-6 or k>6.');
  // A numerical sample supports the explicit analytic squeeze bound, not a
  // numerical proof of the limit: |h sin(1/h)| <= |h| -> 0.
  for (const h of [-0.1, -0.001, 0.001, 0.1]) assert.ok(Math.abs(h * Math.sin(1 / h)) <= Math.abs(h));
  assert.equal(question('derivative-definition', 'oscillation-bound').answer, 'f′(0)=0.');
  const derivative = x => 2 * x * Math.sin(1 / x) - Math.cos(1 / x);
  for (let n = 1; n < 20; n++) {
    assert.ok(Math.abs(derivative(1 / (2 * Math.PI * n)) + 1) < 1e-10);
    assert.ok(Math.abs(derivative(1 / ((2 * n + 1) * Math.PI)) - 1) < 1e-10);
  }
  assert.match(question('derivative-definition', 'derivative-continuity').answer, /=-1.*=1/);
});

test('half-open search traces, empty cases and index identities agree with executable algorithms', () => {
  const lowerBound = (a, target) => {
    let low = 0, high = a.length;
    const trace = [];
    while (low < high) {
      const mid = Math.floor((low + high) / 2); trace.push(mid);
      if (a[mid] < target) low = mid + 1; else high = mid;
    }
    return { index: low, trace };
  };
  assert.deepEqual(lowerBound([1, 3, 3, 7, 9], 5), { index: 3, trace: [2, 4, 3] });
  assert.match(question('searching-algorithms', 'lower-bound').answer, /2,4,3.*index 3/);
  assert.equal(lowerBound([2, 4, 6], 9).index, 3);
  assert.equal(lowerBound([], 9).index, 0);
  assert.match(question('searching-algorithms', 'missing-large').answer, /^Return 3/);
  const indexed = [30, 10, 20].map((value, index) => ({ value, index })).sort((a, b) => a.value - b.value);
  assert.equal(indexed[lowerBound(indexed.map(p => p.value), 20).index].index, 2);
  assert.match(question('searching-algorithms', 'preserve-index').answer, /originally at index 2/);
  assert.equal([2, 0, 7].reduce((s, x) => s + x) / 3, 3);
  assert.match(question('algorithms-and-invariants', 'prefix-average').answer, /final mean is 3/);
  for (let step = 0; step < 100; step++) assert.notEqual(3 - 2 * step, 0);
  assert.match(question('algorithms-and-invariants', 'termination-domain').answer, /even nonnegative/);
});
