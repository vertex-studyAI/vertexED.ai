import assert from 'node:assert/strict';
import test from 'node:test';
import { createConversationStore } from '../src/lib/conversationStore.mjs';
import { validateConversations, conversationSearchEntries } from '../contracts/apexConversation.js';
const msg = (text = 'Question', id = 'm1') => ({ id, role: 'user', text });
const snap = (text = 'Question') => ({ version: 1, threads: [{ id: 'apex-main', messages: [msg(text)] }] });
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const memory = () => { const values = new Map(); return { values, getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v) }; };
function harness() {
  const storage = memory(); let cloud = null; let revision = 0; let online = true; let current = true;
  const request = async (method, body) => {
    if (!online) throw new Error('Offline. Saved on this device only.');
    if (method === 'GET') return { items: cloud ? [structuredClone(cloud)] : [] };
    if (body.expectedUpdatedAt !== (cloud?.updated_at ?? null)) throw new Error('Conversation history changed elsewhere. Export this copy, then reload the account copy before continuing.');
    cloud = { id: 'ee38e832-e67d-4537-93a5-efda63c08dcb', kind: 'conversation', payload: structuredClone(body.payload), updated_at: new Date(++revision * 1000).toISOString() };
    return { item: cloud };
  };
  return { storage, request, cloud: () => cloud, online: value => { online = value; }, current: value => { current = value; },
    create: (extra = {}) => createConversationStore({ key: 'history', storage, request, isCurrent: () => current, ...extra }) };
}
test('conversation validation preserves citations and rejects malformed, duplicate and oversized history', () => {
  const data = snap(); data.threads[0].messages.push({ id: 'a', role: 'assistant', text: 'Evidence', sources: [{ id: 's', title: 'Notebook', excerpt: 'Quoted text' }] });
  assert.deepEqual(validateConversations(data), data);
  for (const invalid of [null, {}, { version: 1, threads: [data.threads[0], data.threads[0]] }, { version: 1, threads: [{ id: 'a', messages: [msg(), msg()] }] }, { version: 1, threads: [{ id: 'a', messages: [msg('x'.repeat(50001))] }] }, { version: 1, threads: [{ id: 'a', messages: Array.from({ length: 201 }, (_, i) => msg('Q', `m${i}`)) }] }]) assert.throws(() => validateConversations(invalid));
});
test('another device resumes full messages and citations; search includes answer text', async () => {
  const h = harness(); const a = h.create(); await a.load();
  const messages = [msg('Diffusion'), { id: 'a', role: 'assistant', text: 'Concentration gradient', sources: [{ id: 's', title: 'Biology' }] }];
  a.updateThread('apex-main', messages); await a.sync(); const b = h.create({ storage: memory() }); await b.load();
  assert.deepEqual(b.getSnapshot().snapshot.threads[0].messages, messages);
  assert.match(conversationSearchEntries(b.getSnapshot().snapshot)[0].keywords, /gradient/);
});
test('offline work survives a restart and retries against its original revision', async () => {
  const h = harness(); const a = h.create(); await a.load(); h.online(false); a.updateThread('apex-main', [msg()]);
  assert.equal(await a.sync(), false); assert.equal(a.getSnapshot().dirty, true); h.online(true);
  const b = h.create(); await b.load(); assert.deepEqual(h.cloud().payload, snap()); assert.equal(b.getSnapshot().dirty, false);
});
test('two-device conflicts preserve both copies and keep a backup before explicit recovery', async () => {
  const h = harness(); const a = h.create(); const storage = memory(); const b = h.create({ storage }); await a.load(); await b.load();
  a.updateThread('apex-main', [msg('First')]); await a.sync(); b.updateThread('apex-main', [msg('Second')]); await b.sync();
  assert.equal(b.getSnapshot().readOnly, true); assert.equal(h.cloud().payload.threads[0].messages[0].text, 'First'); assert.match(b.exportData(), /Second/);
  await b.load(true); assert.equal(b.getSnapshot().snapshot.threads[0].messages[0].text, 'First'); assert.ok([...storage.values.keys()].some(k => k.startsWith('history:recovery:')));
});
test('stale tabs cannot overwrite newer local bytes', async () => {
  const h = harness(); const a = h.create(); await a.load(); const b = h.create(); await b.load();
  b.updateThread('apex-main', [msg('Newer')]); const bytes = h.storage.getItem('history');
  assert.equal(a.updateThread('apex-main', [msg('Older')]), false); assert.equal(h.storage.getItem('history'), bytes); assert.match(a.exportData(), /Older/);
});
test('clearing preserves a revision tombstone so stale devices cannot resurrect history', async () => {
  const h = harness(); const a = h.create(); await a.load(); a.updateThread('apex-main', [msg()]); await a.sync();
  const b = h.create({ storage: memory() }); await b.load(); a.updateThread('apex-main', []); await a.sync();
  b.updateThread('apex-main', [msg('Stale')]); await b.sync(); assert.equal(b.getSnapshot().readOnly, true); assert.deepEqual(h.cloud().payload.threads, []);
});
test('corrupt bytes are preserved and exportable', async () => {
  const h = harness(); h.storage.setItem('history', '{broken'); const a = h.create(); assert.equal(a.getSnapshot().readOnly, true);
  assert.equal(await a.load(), false); assert.equal(h.storage.getItem('history'), '{broken'); assert.match(a.exportData(), /broken/);
});
test('quota failures preserve the in-memory recovery copy', async () => {
  const h = harness(); const a = h.create(); await a.load(); h.storage.setItem = () => { throw new Error('Quota exceeded'); };
  assert.equal(a.updateThread('apex-main', [msg('Keep this')]), false); assert.match(a.exportData(), /Keep this/); assert.equal(a.getSnapshot().readOnly, true); assert.equal(h.cloud(), null);
});
test('account switches reject late reads and old-account exports and writes', async () => {
  const h = harness(); const wait = deferred(); const a = h.create({ request: () => wait.promise }); const loading = a.load(); h.current(false);
  wait.resolve({ items: [{ payload: snap('Private'), updated_at: new Date().toISOString() }] }); assert.equal(await loading, false);
  assert.deepEqual(a.getSnapshot().snapshot.threads, []); assert.equal(h.storage.values.size, 0); assert.equal(a.updateThread('x', [msg()]), false); assert.throws(() => a.exportData(), /Account changed/);
});
test('incomplete acknowledgements keep pending data for retry', async () => {
  const h = harness(); const a = h.create({ request: async method => method === 'GET' ? { items: [] } : { ok: true } });
  await a.load(); a.updateThread('apex-main', [msg()]); await a.sync(); assert.equal(a.getSnapshot().dirty, true); assert.match(a.getSnapshot().status, /acknowledgement/);
});
test('edits during a pending save are saved afterwards without dropping the reply', async () => {
  const h = harness(); const wait = deferred(); let first = true;
  const a = h.create({ request: async (method, body) => { if (method === 'POST' && first) { first = false; await wait.promise; } return h.request(method, body); } });
  await a.load(); a.updateThread('apex-main', [msg()]); const saving = a.sync(); a.updateThread('apex-main', [msg(), { id: 'a', role: 'assistant', text: 'Reply' }]); wait.resolve(); await saving;
  assert.equal(h.cloud().payload.threads[0].messages.length, 2); assert.equal(a.getSnapshot().dirty, false);
});
test('legacy session messages import without deleting their original bytes', async () => {
  const h = harness(); const legacy = JSON.stringify([msg('Legacy')]);
  const a = h.create({ legacyPrefix: 'old:', legacyStorage: { length: 1, key: () => 'old:apex-main', getItem: () => legacy } });
  await a.load(); assert.equal(h.cloud().payload.threads[0].messages[0].text, 'Legacy');
});

test('failed explicit recovery cannot remove corruption protection', async () => {
  const h = harness(); h.storage.setItem('history', '{broken'); const store = h.create();
  h.online(false); await store.load(true);
  assert.equal(store.getSnapshot().readOnly, true);
  assert.equal(store.updateThread('apex-main', [msg('Must not overwrite')]), false);
  assert.equal(h.storage.getItem('history'), '{broken');
});

test('reaching a history limit keeps old messages and still allows clearing after export', async () => {
  const h = harness(); const store = h.create(); await store.load();
  store.updateThread('apex-main', [msg()]);
  assert.equal(store.updateThread('apex-main', [msg('x'.repeat(50001))]), false);
  assert.deepEqual(store.getSnapshot().snapshot, snap());
  assert.equal(store.getSnapshot().readOnly, false);
  assert.equal(store.updateThread('apex-main', []), true);
});
