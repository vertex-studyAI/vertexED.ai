import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { learningLessonSchema } from '../contracts/learningLibrary.js';
import { syllabusLessons } from '../src/content/syllabus-lessons/index.mjs';
import { unitCoverage, unitSources } from '../src/content/syllabus-lessons/coverage.mjs';
import { validateUnitCoverage, buildSyllabusUnitCoverage } from '../scripts/report-syllabus-unit-coverage.mjs';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { contentHash, publicationResponse } from '../scripts/content-publication.mjs';

const lesson = id => syllabusLessons.find(l => l.id === `syllabus-${id}`);
const answer = (id, q) => lesson(id).questions.find(item => item.id === q).answer;
const rounded = n => Number(n.toFixed(10));

test('12 new authored lessons have complete reader modes, tier-labelled questions and no placeholder content', async () => {
  assert.equal(syllabusLessons.length, 12);
  assert.equal((await readLearningLibrary()).length, 91);
  assert.equal((await readLearningLibrary({ includeSubjectUnits: false })).length, 72);
  assert.equal((await readLearningLibrary({ includeSubjectExpansion: false })).length, 43, 'foundation-depth scope includes the held Boolean logic lesson');
  assert.equal((await readLearningLibrary({ includeSyllabusLessons: false })).length, 60);
  for (const item of syllabusLessons) {
    learningLessonSchema.parse(item);
    assert.equal(item.editorialStatus, 'unreviewed');
    assert.ok(item.notes.flatMap(n => n.paragraphs).join(' ').split(/\s+/).length >= 300);
    assert.ok(item.questions.length >= 7);
    assert.ok(item.workedExamples.length >= 2);
    assert.equal(item.flashcards.length, 5);
    assert.deepEqual(new Set(item.teachingSequence.flatMap(stage => stage.questionIds)), new Set(item.questions.map(q => q.id)));
    assert.deepEqual(item.revisionGuide.practiceQuestionIds, item.questions.map(q => q.id));
    assert.doesNotMatch(JSON.stringify(item), /\bTODO\b|\bTBD\b|coming soon|lorem ipsum/i);
    for (const q of item.questions) {
      assert.match(q.prompt, /^\[(?:GCSE|IGCSE|A-Level)/);
      assert.ok(q.solution.length >= 2);
      assert.equal(q.marks, q.markingPoints.length);
      assert.equal(q.numericAnswer, undefined, 'multi-part reasoning is self-reviewed, not auto-awarded full marks');
    }
  }
});

test('finite unit denominators and tier routes have exact evidence, without full-course credit', async () => {
  assert.equal(validateUnitCoverage(), true);
  const report = await buildSyllabusUnitCoverage();
  assert.deepEqual(report, JSON.parse(await readFile('docs/evidence/syllabus-unit-coverage-20261021.json', 'utf8')));
  assert.deepEqual(report.summary, { sources: 3, tieredUnits: 5, unitPointRows: 67, distinctSourcePoints: 51,
    lessons: 12, noteWords: 5623, workedExamples: 25, questions: 103, flashcards: 60,
    independentlyReviewedUnits: 0, completedCourses: 0, publishedLessons: 0 });
  assert.deepEqual(report.units.map(u => [u.tier, u.points.length]), [['Foundation',16],['Higher',16],['Core',16],['Extended',18],['A-Level',1]]);
  assert.ok(report.courseBacklog.every(course => course.remaining.length >= 5));
  for (const unit of report.units) assert.equal(unit.verifiedCoveragePercent, null);
  for (const receipt of report.lessonReceipts) {
    assert.equal(contentHash(await readFile(receipt.sourceFile, 'utf8')), receipt.sourceHash);
    assert.equal(contentHash(await readFile(`public${receipt.asset}`, 'utf8')), receipt.contentHash);
    assert.equal((await publicationResponse(receipt.asset)).status, 403);
    const md = `public${receipt.asset.replace(/\.json$/, '.md')}`;
    const text = await readFile(md, 'utf8');
    assert.match(text, /Review draft — not independently approved/);
    assert.match(text, /Guided teaching sequence/);
    assert.match(text, /Revision guide/);
  }
});

test('coverage validation rejects missing points, dangling evidence, duplicate identities and tier contamination', () => {
  for (const mutate of [
    u => u[0].points.pop(),
    u => u[0].points.push(u[0].points[0]),
    u => { u[0].points[0].teaching[0].lessonId = 'syllabus-missing'; },
    u => { u[0].points[0].teaching[0].noteNumbers = [99]; },
    u => { u[0].points[0].teaching[0].questionIds = ['missing']; },
    u => { u[0].points[0].criteria = []; },
    u => { u[0].sourceId = 'uninspected-source'; },
    u => { u[0].id = u[1].id; },
    u => { u[2].points[9].teaching[0].questionIds = ['speed-bounds']; },
    u => { u[0].points[4].teaching[0].questionIds = ['restricted-count']; },
  ]) {
    const units = structuredClone(unitCoverage);
    mutate(units);
    assert.throws(() => validateUnitCoverage(units));
  }
  const extra = structuredClone(syllabusLessons[0]); extra.id = 'syllabus-orphan';
  assert.throws(() => validateUnitCoverage(unitCoverage, [...syllabusLessons, extra]), /Orphan/);
});

test('Core and Foundation exclusions stay explicit, and proof includes its specified arguments', () => {
  const core = unitCoverage.find(u => u.tier === 'Core');
  assert.ok(!core.expectedPoints.includes('C1.17'));
  for (const excluded of ['recurring-pure','recurring-mixed','fraction-recurring','fractional','fractional-laws','three-counts','conjugate','reverse','repeated','speed-bounds']) {
    assert.ok(!core.points.some(p => p.teaching.some(e => e.questionIds.includes(excluded))), excluded);
  }
  for (const id of ['multiply','divide','sum']) assert.match(lesson('standard-form').questions.find(q => q.id === id).prompt, /Core: Paper 3/);
  const proof = lesson('a-level-proof');
  assert.ok(['root-two','infinite-primes','exhaustion','counterexample','unfamiliar','contradiction-transfer'].every(id => proof.questions.some(q => q.id === id)));
  assert.match(proof.notes[2].paragraphs.join(' '), /gcd\(a,b\)=1/);
  assert.match(proof.notes[3].paragraphs.join(' '), /need not itself be prime/);
  assert.equal(unitSources[1].inspection, 'extracted-text-and-rendered-selected-pages');
  assert.match(unitSources[1].limitation, /not all 71 pages/);
});

test('selected numerical keys are recomputed independently of authored solution text', () => {
  const cases = [
    ['number-types-factors','restricted-count', `${[1,2,3,4].flatMap(a => [1,2,3,4].flatMap(b => [1,2,3,4].filter(c => a!==b && a!==c && b!==c && c%2===0).map(c => 100*a+10*b+c))).length}.`],
    ['signed-arithmetic','decimal', `${rounded(14.02-8.765)} and ${rounded(1.25*0.48)}.`],
    ['signed-arithmetic','division', `${864/24}; 36×0.24=8.64.`],
    ['signed-arithmetic','priority', `${20-12/3*2} and ${(-5)**2-5**2}.`],
    ['powers-indices','integer-laws', `${2**7 * 2**-3 / 2**2} and ${(5**2)**3/5**6}.`],
    ['powers-indices','negative', `${10**-3}, 1/${(-3)**2}, ${-(3**2)}.`],
    ['powers-indices','fractional', `${rounded(64**(2/3))} and 1/${16**0.5}.`],
    ['fractions-decimals-percentages','operators', `${96*7/8} and ${64*1.25}.`],
    ['ratio-percent-finance','recipe', `${450/6*10} g flour and ${180/6*10} mL milk.`],
    ['ratio-percent-finance','deposit-discount', `£${240*.85}, £${240*.85*.25} and £${240*.85*.75}.`],
    ['ratio-percent-finance','earnings', `£${320+.06*1500}; ${(320+.06*1500)/320*100}% of the base.`],
    ['ratio-percent-finance','reverse', `£${9200/115} before tax; £${92-9200/115} tax.`],
    ['units-rates','area-volume', `${7500/100**2} m² and ${320000/100**3} m³.`],
    ['units-rates','pay-exchange', `£${14*(7+30/60)}; €${(14*7.5*1.16).toFixed(2)}.`],
    ['units-rates','flow-fuel', `${90/12} minutes; ${7.2*350/100} L.`],
    ['units-rates','density-pressure', `${156/60} g/cm³ and ${480/.12} N/m².`],
    ['units-rates','speed', `${9/(48/60)} km/h and ${5*3600/1000} km/h.`],
    ['units-rates','unequal-times', `${(24+24)/(24/12+24/24)} km/h.`],
    ['units-rates','recover-mass', `${.8*250} g=${.8*250/1000} kg.`],
    ['time-money-calculator','time-units', `${rounded(2.4*24)} h; ${.35*60} min; ${540/60} min; ${2*365} days.`],
    ['time-money-calculator','exchange', `£${192/1.28} before the fee; £${192/1.28-4} afterwards.`],
    ['sets-venn','two-counts', `${19-7}, ${16-7} and ${35-(19+16-7)}.`],
  ];
  for (const [l,q,expected] of cases) assert.equal(answer(l,q).replaceAll('−','-'),expected,`${l}/${q}`);
  const interest = answer('ratio-percent-finance','interest');
  assert.ok(interest.includes(`£${(1200*1.03**3).toFixed(2)}`));
  assert.ok(interest.includes(`£${(1200*1.03**3-1200).toFixed(2)}`));
  const growth = rounded(1600*1.025**4);
  assert.ok(answer('surds-growth','growth').includes(`${growth}`));
  assert.ok(answer('surds-growth','growth').includes(`${Math.round(growth)}`));
  const values = Array.from({length:5},(_,i) => 1000*.8**i);
  assert.equal(values.findIndex(v => v<500),4);
  assert.ok(answer('surds-growth','decay-threshold').includes(`£${values[4].toFixed(2)}`));
  assert.equal(lesson('surds-growth').workedExamples[1].answer, `£${(2000*.85**3).toFixed(2)}.`);
});

test('recurring, surd, Venn, bound and clock answers survive independent mathematical checks', () => {
  // Exact rational identities, followed by checks that the authored keys carry
  // those results. These are checks of selected keys, not independent review.
  assert.equal(54*11,6*99); assert.match(answer('fractions-decimals-percentages','recurring-pure'), /^6\/11/);
  assert.equal(309*330,103*990); assert.match(answer('fractions-decimals-percentages','recurring-mixed'), /^103\/330/);
  assert.equal(414*55,23*990); assert.equal(lesson('fractions-decimals-percentages').workedExamples[1].answer,'23/55.');
  assert.ok(Math.abs((Math.sqrt(75)-Math.sqrt(12)+Math.sqrt(27))-6*Math.sqrt(3))<1e-12);
  assert.equal(answer('surds-growth','simplify-surds'),'6√3.');
  assert.ok(Math.abs(2/(3-Math.sqrt(7))-(3+Math.sqrt(7)))<1e-12);
  assert.equal(answer('surds-growth','conjugate'),'3+√7.');
  const areaBounds=[7.95*2.95,8.05*3.05].map(rounded);
  assert.equal(answer('rounding-bounds','perimeter-area'),`21.8≤P<22.2 cm; ${areaBounds[0]}≤A<${areaBounds[1]} cm².`);
  const speedText=answer('rounding-bounds','speed-bounds');
  assert.ok(speedText.includes(`${149.5/12.5}`));
  assert.ok(speedText.includes(`${Number((150.5/11.5).toPrecision(5))}`));
  assert.match(speedText,/unattained/);
  const regions={a:9,b:8,c:7,ab:6,ac:5,bc:4,abc:4,out:7};
  assert.equal(regions.a+regions.ab+regions.ac+regions.abc,24);
  assert.equal(regions.b+regions.ab+regions.bc+regions.abc,22);
  assert.equal(regions.c+regions.ac+regions.bc+regions.abc,20);
  assert.equal(Object.values(regions).reduce((a,b)=>a+b),50);
  assert.match(answer('sets-venn','three-counts'), /Exactly one=24; exactly two=15; none=7/);
  const minutes=(24*60+(6*60+10)-5*60)-((22*60+30)-2*60);
  assert.equal(answer('time-money-calculator','zones'),`${Math.floor(minutes/60)} h ${minutes%60} min.`);
  assert.equal(answer('time-money-calculator','overnight'),`${Math.floor((24*60+134-1316)/60)} h ${(24*60+134-1316)%60} min.`);
});
