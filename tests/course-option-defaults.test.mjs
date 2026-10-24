import assert from 'node:assert/strict';
import test from 'node:test';
import { courseOptionDefaults } from '../src/content/course-option-defaults.mjs';
import { buildSubjectPathways } from '../scripts/report-subject-pathways.mjs';

test('user-authorised History and Literature defaults are connected without earning coverage', async () => {
  assert.equal(courseOptionDefaults.length,5);
  const report=await buildSubjectPathways();
  for(const item of courseOptionDefaults){
    assert.equal(item.complete,false);
    assert.equal(item.teachingStatus,'topic-specific-authoring-in-progress');
    assert.equal(item.targetExamYear,2027);
    assert.ok(item.sources.every(source=>['www.aqa.org.uk','www.cambridgeinternational.org'].includes(new URL(source).hostname)));
    const pathway=report.pathways.find(p=>p.programme===item.programme&&p.subject===item.subject);
    assert.deepEqual(pathway.planningTarget.authoringOptions,item);
    assert.equal(pathway.complete,false);
  }
});

test('annual sites, series prescriptions and A-Level genre/date constraints remain distinct', () => {
  const find=(programme,subject)=>courseOptionDefaults.find(p=>p.programme===programme&&p.subject===subject);
  const gcse=find('GCSE','History');
  assert.equal(gcse.selections.at(-1).topic,'The Spanish Armada');
  assert.match(gcse.selections.at(-1).caution,/2028/);
  const igcse=find('IGCSE','History');
  assert.deepEqual(igcse.selections.at(-1).papers,[1,2,4]);
  assert.match(igcse.prescribedPaper2['2027-June'],/Eastern Europe/);
  assert.equal(igcse.prescribedPaper2['2027-March-India'],'Treaty of Versailles');
  const literature=find('A_LEVELS','English Literature');
  assert.ok(literature.selections.some(s=>s.fulfils==='Pre-1900 requirement'));
  assert.ok(literature.selections.some(s=>s.fulfils==='Post-2000 requirement'));
  const examTexts=literature.selections.filter(s=>s.text).map(s=>s.text);
  assert.equal(new Set(examTexts).size,6);
  assert.match(literature.selections.at(-1).scope,/centre approval/);
  const history=find('A_LEVELS','History');
  assert.deepEqual(history.selections.slice(0,2).map(s=>s.code),['1C','2O']);
  assert.match(history.selections.at(-1).scope,/100-year/);
});
