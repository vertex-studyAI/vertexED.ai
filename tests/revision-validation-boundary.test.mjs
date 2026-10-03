import test from 'node:test';
import assert from 'node:assert/strict';
import {scheduleRevisionRetry, rankWeakTopics, deriveRevisionQueue} from '../src/lib/revisionEvidence.mjs';
const now=Date.parse('2026-10-03T00:00:00Z');
const schedule={intervalStep:0,dueAt:'2026-10-01T00:00:00Z'};
const attempt=(i, extra={})=>({id:`a${i}`,topicId:'t',topicLabel:'Topic',sessionId:`s${i%2}`,questionId:`q${i%2}`,evidenceState:'verified_incorrect',at:'2026-10-01T00:00:00Z',...extra});
const entry=(extra={})=>({id:'e',dueAt:'2026-10-01T00:00:00Z',updatedAt:'2026-10-01T00:00:00Z',evidenceState:'unverified',...extra});
test('non-boolean complete cannot promote a partially loaded evidence set',()=>{
 for(const complete of ['false','true',1,[],{},null]) assert.deepEqual(rankWeakTopics([1,2,3].map(i=>attempt(i)),{now,complete}),{complete:false,ranked:[],insufficient:[]});
});
test('impossible calendar dates cannot schedule retries',()=>{
 for(const dueAt of ['2026-02-29T00:00:00Z','2026-02-30T00:00:00Z','2026-04-31T00:00:00Z','1900-02-29T00:00:00Z']) assert.throws(()=>scheduleRevisionRetry({...schedule,dueAt},'verified_correct',now),TypeError);
});
test('impossible dates cannot enter ranking or due-queue evidence',()=>{
 for(const bad of ['2026-02-30T00:00:00Z','2026-04-31T00:00:00Z']){
  assert.throws(()=>rankWeakTopics([attempt(1,{at:bad})],{now,complete:true}),TypeError);
  for(const key of ['dueAt','updatedAt']) assert.throws(()=>deriveRevisionQueue([entry({[key]:bad})],now),TypeError);
 }
});
test('overflowed times and truncated times do not silently normalize',()=>{
 for(const dueAt of ['2026-10-01T24:00:00Z','2026-10-01T00:00Z','2026-10-01T00:00:00.1234Z']) assert.throws(()=>scheduleRevisionRetry({...schedule,dueAt},'verified_correct',now),TypeError);
});
test('real leap days and millisecond precision remain valid',()=>{
 for(const at of ['2000-02-29T00:00:00Z','2024-02-29T23:59:59Z','2026-10-01T00:00:00.1Z','2026-10-01T00:00:00.12Z','2026-10-01T00:00:00.123Z']) assert.equal(rankWeakTopics([attempt(1,{at})],{now,complete:true}).insufficient.length,1);
});
test('whitespace-only evidence identities fail closed',()=>{
 for(const key of ['id','topicId','topicLabel','sessionId','questionId']) for(const blank of [' ','\t\n']) assert.throws(()=>rankWeakTopics([attempt(1,{[key]:blank})],{now,complete:true}),TypeError);
 assert.throws(()=>deriveRevisionQueue([entry({id:' '})],now),TypeError);
});
test('finite but unrepresentable clocks are rejected consistently',()=>{
 for(const clock of [1e20,-1e20,253402300800000,-62167219200001]){
  assert.throws(()=>rankWeakTopics([],{now:clock,complete:true}),TypeError);
  assert.throws(()=>deriveRevisionQueue([],clock),TypeError);
  assert.throws(()=>scheduleRevisionRetry(schedule,'verified_correct',clock),TypeError);
 }
});
test('retry date overflow reports a validation error without mutating its input',()=>{
 const s=Object.freeze({...schedule,intervalStep:4});
 assert.throws(()=>scheduleRevisionRetry(s,'verified_correct',Date.parse('9999-12-31T00:00:00Z')),TypeError);
 assert.equal(s.intervalStep,4);
});
test('calendar sweep rejects every invalid day from 1996 through 2030',()=>{
 let checked=0;
 for(let year=1996;year<=2030;year++) for(let month=1;month<=12;month++){
  const days=new Date(Date.UTC(year,month,0)).getUTCDate();
  for(let day=1;day<=31;day++){
   const at=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T12:00:00Z`;
   const call=()=>rankWeakTopics([attempt(1,{at})],{now:Date.parse('2031-01-01T00:00:00Z'),complete:true});
   if(day>days) assert.throws(call,TypeError,at); else assert.equal(call().insufficient.length,1,at);
   checked++;
  }
 }
 assert.equal(checked,13020);
});
