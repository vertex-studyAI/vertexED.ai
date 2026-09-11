import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  MAX_APEX_CHAT_MESSAGES,
  clearApexChatMessages,
  loadApexChatMessages,
  normalizeApexChatMessages,
  saveApexChatMessages,
} from '../src/lib/apexChatStorage.mjs';

const hookSource = readFileSync(new URL('../src/hooks/useApexChat.ts', import.meta.url), 'utf8');

function memoryOwner(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    sessionStorage: {
      getItem(key) {
        return values.has(key) ? values.get(key) : null;
      },
      setItem(key, value) {
        values.set(key, value);
      },
      removeItem(key) {
        values.delete(key);
      },
    },
  };
}

test('Apex chat persistence rejects malformed roots, rows, and duplicate ids', () => {
  assert.deepEqual(normalizeApexChatMessages(null), []);
  assert.deepEqual(normalizeApexChatMessages({ id: 'not-an-array' }), []);

  assert.deepEqual(
    normalizeApexChatMessages([
      { id: '  first  ', role: 'user', text: 'Question' },
      { id: 'first', role: 'assistant', text: 'duplicate id' },
      { id: 'bad-role', role: 'system', text: 'nope' },
      { id: '', role: 'assistant', text: 'nope' },
      { id: 'second', role: 'assistant', text: '' },
      null,
    ]),
    [
      { id: 'first', role: 'user', text: 'Question' },
      { id: 'second', role: 'assistant', text: '' },
    ],
  );
});

test('Apex chat persistence remains bounded to the latest messages', () => {
  const messages = Array.from({ length: MAX_APEX_CHAT_MESSAGES + 5 }, (_, index) => ({
    id: `m-${index}`,
    role: index % 2 === 0 ? 'user' : 'assistant',
    text: `message ${index}`,
  }));

  const normalized = normalizeApexChatMessages(messages);
  assert.equal(normalized.length, MAX_APEX_CHAT_MESSAGES);
  assert.equal(normalized[0].id, 'm-5');
  assert.equal(normalized.at(-1).id, `m-${MAX_APEX_CHAT_MESSAGES + 4}`);
});

test('Apex chat persistence fails closed when session storage is unavailable or throws', () => {
  const blockedOwner = {};
  Object.defineProperty(blockedOwner, 'sessionStorage', {
    get() {
      throw new Error('blocked');
    },
  });

  assert.deepEqual(loadApexChatMessages(blockedOwner, 'key'), []);
  assert.equal(saveApexChatMessages(blockedOwner, 'key', []), false);
  assert.equal(clearApexChatMessages(blockedOwner, 'key'), false);
});

test('Apex chat save/load/clear uses the safe session boundary', () => {
  const owner = memoryOwner();
  const messages = [{ id: 'one', role: 'user', text: 'hello' }];

  assert.equal(saveApexChatMessages(owner, 'key', messages), true);
  assert.deepEqual(loadApexChatMessages(owner, 'key'), messages);
  assert.equal(clearApexChatMessages(owner, 'key'), true);
  assert.deepEqual(loadApexChatMessages(owner, 'key'), []);
});

test('useApexChat no longer performs direct sessionStorage operations', () => {
  assert.match(hookSource, /loadApexChatMessages\(window, storageKey\)/);
  assert.match(hookSource, /saveApexChatMessages\(window, storageKey, messages\)/);
  assert.match(hookSource, /clearApexChatMessages\(window, storageKey\)/);
  assert.doesNotMatch(hookSource, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});
