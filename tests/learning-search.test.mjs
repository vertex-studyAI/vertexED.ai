import test from 'node:test';
import assert from 'node:assert/strict';
import { learningSearchEntries } from '../src/lib/learningSearch.ts';
const store = values => ({ getItem: key => values[key] ?? null });
test('search indexes only the current account notebook, cards and main conversation', () => {
  const local = store({
    'vertex_notebooks:alice:data': JSON.stringify([{id:'notes1',title:'Mechanics',subject:'Physics',sources:[{content:'Impulse and momentum'}]}]),
    'vertex_content:alice:sr_deck': JSON.stringify([{front:'Define acceleration',back:'Rate of change of velocity'}]),
    'vertex_notebooks:bob:data': JSON.stringify([{id:'secret',title:'Private other account',sources:[]}]),
  });
  const session = store({'vertex_apex:alice:apex-main': JSON.stringify([{text:'Explain impulse',role:'user'}]), 'vertex_apex:bob:apex-main': JSON.stringify([{text:'Secret conversation'}])});
  const entries=learningSearchEntries('alice',local,session);
  assert.ok(entries.some(e=>e.title==='Mechanics' && e.to.includes('notebook=notes1')));
  assert.ok(entries.some(e=>e.title==='Define acceleration'));
  assert.ok(entries.some(e=>e.title==='Explain impulse'));
  assert.ok(entries.every(e=>!JSON.stringify(e).includes('Secret') && !JSON.stringify(e).includes('Private other')));
});
test('malformed optional local search records do not break global search',()=>{
  const entries=learningSearchEntries('alice',store({'vertex_content:alice:sr_deck':'broken'}),store({}));
  assert.ok(entries.some(e=>e.title==='Newton second law'));
});
