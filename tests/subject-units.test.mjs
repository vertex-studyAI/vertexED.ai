import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { learningLessonSchema } from '../contracts/learningLibrary.js';
import { subjectUnits } from '../src/content/subject-units/index.mjs';
import { subjectUnitTargets, subjectUnitSources, routesForTarget } from '../src/content/subject-units/coverage.mjs';
import { buildSubjectUnitCoverage, validateSubjectUnitCoverage } from '../scripts/report-subject-unit-coverage.mjs';
import { priorityPlanningCodes, buildSubjectPathways } from '../scripts/report-subject-pathways.mjs';
import { readLearningLibrary } from '../scripts/generate-learning-library.mjs';
import { contentHash, publicationResponse } from '../scripts/content-publication.mjs';
const lesson = id => subjectUnits.find(l => l.id === `unit-${id}`);
const answer = (id,q) => lesson(id).questions.find(item => item.id === q).answer;

test('19 substantial original lessons supply all reader modes without earning review', async () => {
  assert.equal(subjectUnits.length,19);
  assert.equal((await readLearningLibrary()).length,91);
  assert.equal((await readLearningLibrary({includeSubjectUnits:false})).length,72);
  for (const l of subjectUnits) {
    learningLessonSchema.parse(l);
    assert.notEqual(l.subject,'Mathematics');
    assert.equal(l.editorialStatus,'unreviewed');
    assert.ok(l.notes.flatMap(n=>n.paragraphs).join(' ').split(/\s+/).length >= 300);
    assert.equal(l.questions.length,6);
    assert.equal(l.workedExamples.length,2);
    assert.equal(l.flashcards.length,5);
    assert.deepEqual(new Set(l.teachingSequence.flatMap(s=>s.questionIds)),new Set(l.questions.map(q=>q.id)));
    assert.deepEqual(l.revisionGuide.practiceQuestionIds,l.questions.map(q=>q.id));
    assert.doesNotMatch(JSON.stringify(l),/\bTODO\b|\bTBD\b|coming soon|lorem ipsum/i);
    for (const q of l.questions) {
      assert.match(q.prompt,/^\[(?:GCSE|IGCSE|A-Level)/);
      assert.equal(q.marks,q.markingPoints.length);
      assert.equal(q.type,'extended');
      assert.equal(q.numericAnswer,undefined,'multipart reasoning remains self-reviewed');
    }
  }
});

test('all 26 priority non-maths course identities have actual topic evidence, not completion credit', async () => {
  const expected = Object.entries(priorityPlanningCodes).flatMap(([programme,subjects]) => Object.entries(subjects)
    .filter(([subject])=>!['Mathematics','Further Mathematics'].includes(subject)).map(([,code])=>`${programme}:${code}`)).sort();
  assert.equal(expected.length,26);
  assert.deepEqual(subjectUnitTargets.map(t=>`${t.programme}:${t.qualificationCode}`).sort(),expected);
  assert.equal(validateSubjectUnitCoverage(),true);
  const report=await buildSubjectUnitCoverage();
  assert.deepEqual(report,JSON.parse(await readFile('docs/evidence/subject-unit-coverage-20261022.json','utf8')));
  assert.deepEqual(report.summary,{lessons:19,courseTargets:26,subjects:12,noteWords:6894,questions:114,workedExamples:38,
    flashcards:95,tieredCourseTargets:6,completedCourses:0,independentlyReviewedLessons:0,publishedLessons:0});
  const pathways=await buildSubjectPathways();
  for(const t of report.targets){
    assert.equal(t.complete,false); assert.equal(t.verifiedCoveragePercent,null);
    assert.equal(t.independentlyReviewed,false); assert.ok(t.remaining.length>=2);
    assert.equal(pathways.pathways.find(p=>p.programme===t.programme&&p.subject===t.subject).planningTarget.authoredTopicUnits.sourceId,t.sourceId);
    for(const route of t.routes) for(const evidence of route.lessons){
      const l=subjectUnits.find(l=>l.id===evidence.lessonId);
      assert.ok(evidence.questionIds.length>=4);
      assert.ok(evidence.questionIds.every(id=>l.questions.some(q=>q.id===id)));
    }
  }
  for(const receipt of report.lessonReceipts){
    assert.equal(contentHash(await readFile(receipt.sourceFile,'utf8')),receipt.sourceHash);
    assert.equal(contentHash(await readFile(`public${receipt.asset}`,'utf8')),receipt.contentHash);
    assert.equal(contentHash(await readFile(`public${receipt.markdown}`,'utf8')),receipt.markdownHash);
    assert.equal((await publicationResponse(receipt.asset)).status,403);
    assert.equal((await publicationResponse(receipt.markdown)).status,403);
  }
});

test('board-specific science distinctions do not leak into Core routes', () => {
  const route=(programme,subject,tier)=>routesForTarget(subjectUnitTargets.find(t=>t.programme===programme&&t.subject===subject),subjectUnits).find(r=>r.tier===tier).lessons[0].questionIds;
  for(const [subject,excluded] of [['Biology','mixed-unit-scale'],['Chemistry','weighted-isotopes'],['Physics','charge-transfer']]){
    assert.ok(!route('IGCSE',subject,'Core').includes(excluded));
    assert.ok(route('IGCSE',subject,'Extended').includes(excluded));
    assert.ok(route('GCSE',subject,'Foundation').includes(excluded));
    assert.ok(route('GCSE',subject,'Higher').includes(excluded));
  }
  assert.ok(!route('IGCSE','Chemistry','Core').includes('chemical-isotopes'));
  assert.ok(!route('IGCSE','Physics','Core').includes('opposite-directions'));
  for(const subject of ['Biology','Chemistry','Physics']){
    const target=subjectUnitTargets.find(t=>t.programme==='IGCSE'&&t.subject===subject);
    const core=routesForTarget(target,subjectUnits).find(r=>r.tier==='Core');
    assert.ok(core.lessons[0].noteHeadings.every(heading=>!heading.includes('Extended only')));
  }
  const cs=subjectUnitTargets.find(t=>t.programme==='GCSE'&&t.subject==='Computer Science');
  assert.deepEqual(routesForTarget(cs,subjectUnits)[0].lessons[0].questionIds,['binary-denary','denary-binary','binary-add','right-shift']);
  const economics=subjectUnitTargets.find(t=>t.programme==='IGCSE'&&t.subject==='Economics');
  assert.equal(routesForTarget(economics,subjectUnits)[0].lessons[0].questionIds.length,4);
  assert.ok(subjectUnitTargets.filter(t=>!['Biology','Chemistry','Physics'].includes(t.subject)).every(t=>routesForTarget(t,subjectUnits)[0].tier==='untiered'));
});

test('coverage checks reject missing/orphan references, source loss and invented completion', () => {
  for(const mutate of [t=>t.push(t[0]),t=>{t[0].lessonIds=['unit-missing'];},t=>{t[0].sourceId='missing';},
    t=>{t[0].remaining=[];},t=>{t[0].complete=true;},t=>{t[0].verifiedCoveragePercent=100;},t=>{t[0].lessonIds=[];}]){
    const targets=structuredClone(subjectUnitTargets); mutate(targets);
    assert.throws(()=>validateSubjectUnitCoverage(targets));
  }
  const orphan={...subjectUnits[0],id:'unit-orphan'};
  assert.throws(()=>validateSubjectUnitCoverage(subjectUnitTargets,[...subjectUnits,orphan]),/Orphan/);
  assert.throws(()=>validateSubjectUnitCoverage(subjectUnitTargets,subjectUnits,{...subjectUnitSources,unused:{}}),/Orphan source/);
});

test('selected science, economics and decision keys are independently recalculated', () => {
  assert.equal(answer('cells-and-microscopy','same-unit-scale'),`${48/.12} times.`);
  assert.equal(answer('cells-and-microscopy','mixed-unit-scale'),`${36*1000/45} times.`);
  assert.equal(answer('atoms-isotopes-and-ions','weighted-isotopes'),`${20*.6+22*.4}.`);
  assert.equal(answer('current-resistance-circuits','resistance-value'),`${Number((3.6/.12).toFixed(10))} ohms.`);
  assert.equal(answer('current-resistance-circuits','charge-transfer'),`${Number((.6*3*60).toFixed(10))} C.`);
  assert.match(answer('a-level-membrane-transport','mass-change'),/\+7\.0%/);
  assert.ok(Math.abs((4.28-4)/4*100-7)<1e-12);
  assert.equal(answer('a-level-amount-substance','acid-ratio'),`${(.2*.030/2/.025).toFixed(3)} mol dm^-3.`);
  assert.match(answer('a-level-amount-substance','ideal-gas'),new RegExp((.5*8.314*300/100000).toPrecision(3).replace('.','\\.')));
  assert.equal(answer('a-level-amount-substance','burette-uncertainty'),`${(2*.05/20*100).toFixed(2)}%.`);
  assert.equal(3.315e-19/6.63e-34,5e14);
  assert.equal(answer('a-level-quantum-phenomena','threshold-number'),'5.00 × 10^14 Hz.');
  assert.equal(answer('a-level-decision-trees','expected-gain'),`£${.4*90000+.6*20000-25000}.`);
  assert.equal(answer('a-level-decision-trees','probability-threshold'),`${(15000+5000)/50000}.`);
  assert.equal(answer('scarcity-production-possibilities','frontier-cost'),`${14-8} machines total; ${(14-8)/(8-5)} machines per additional food unit.`);
  assert.equal(answer('binary-hex-and-shifts','binary-denary'),`${parseInt('01011010',2)} and ${parseInt('01011010',2).toString(16).toUpperCase()}.`);
  assert.equal(answer('binary-hex-and-shifts','denary-binary'),`${(109).toString(2).padStart(8,'0')}.`);
  assert.equal(answer('binary-hex-and-shifts','binary-add'),`${(parseInt('00101101',2)+parseInt('00010111',2)).toString(2).padStart(8,'0')}.`);
  assert.equal(answer('binary-hex-and-shifts','twos-complement'),`${parseInt('11110110',2)-256}; ${parseInt('12AF',16).toString(2).padStart(16,'0')}.`);
});

test('the actual programming examples execute on empty, duplicate, negative and absent cases', () => {
  const prose=lesson('a-level-search-complexity').notes.flatMap(n=>n.paragraphs).join(' ');
  for(const name of ['linearSearch','binarySearch']){
    const start=prose.indexOf(`function ${name}(`);
    const end=prose.indexOf('}.',start)+1;
    assert.ok(start>=0&&end>start);
    const fn=vm.runInNewContext(`(${prose.slice(start,end)})`,{}, {timeout:1000});
    assert.equal(fn([],1),-1);
    assert.equal(fn([-9,-3,0,4,8],-3),1);
    assert.equal(fn([1,4,9,16,25,36,49],36),5);
    assert.equal(fn([1,4,9,16,25,36,49],20),-1);
    assert.ok([0,1,2].includes(fn([4,4,4],4)));
    assert.equal(fn([4],5),-1);
    for(let size=0;size<40;size++){
      const values=Array.from({length:size},(_,i)=>i*3-20);
      for(let x=-21;x<size*3-19;x++) assert.equal(fn(values,x),values.indexOf(x));
    }
  }
});

test('selected routes and original source exercises remain honest and text-specific', () => {
  assert.match(lesson('germany-weimar-crises').notes.map(n=>n.paragraphs.join(' ')).join(' '),/Dawes Plan belongs to 1924/);
  assert.match(lesson('versailles-settlement').scope,/June prescription is Soviet control/);
  assert.match(lesson('a-level-henry-vii-security').unit,/1C/);
  assert.match(lesson('macbeth-ambition-agency').unit,/Macbeth/);
  assert.match(lesson('christmas-carol-change').unit,/A Christmas Carol/);
  assert.match(lesson('a-level-othello-knowledge').unit,/Othello/);
  assert.match(lesson('tectonic-processes-risk').scope,/Fictional/);
  const response=answer('reading-inference-comparison','notice-summary');
  assert.ok(response.split(/\s+/).length<=45);
  assert.match(lesson('reading-inference-comparison').notes[0].heading,/Original practice passage/);
  assert.match(subjectUnitSources['igcse-business'].version,/0264/);
  assert.match(subjectUnitSources['igcse-computing'].version,/2026–2028/);
  assert.match(subjectUnitSources['al-business'].url,/7132/);
});
