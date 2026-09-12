import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/userContent.ts', 'utf8');
const reviewer = fs.readFileSync('src/pages/AnswerReviewer.tsx', 'utf8');

function functionBody(name) {
  const match = source.match(new RegExp(`(?:export )?function ${name}\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  assert.ok(match, `${name} must exist`);
  return match[1];
}

test('chat handoff producer fails closed through safe session storage', () => {
  const body = functionBody('setChatHandoff');
  assert.match(body, /normalizeChatHandoff\(context\)/);
  assert.match(body, /resolveSessionStorage\(window\)/);
  assert.match(body, /safeStorageSet\(storage, chatHandoff, JSON\.stringify\(normalized\)\)/);
  assert.match(body, /throw new Error\('Temporary browser storage is unavailable\.'\)/);
  assert.doesNotMatch(body, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('chat handoff consumer is one-time and validates persisted payloads', () => {
  const body = functionBody('consumeChatHandoff');
  assert.match(body, /resolveSessionStorage\(window\)/);
  assert.match(body, /safeStorageGet\(storage, chatHandoff\)/);
  assert.match(body, /safeStorageRemove\(storage, chatHandoff\)/);
  assert.match(body, /normalizeChatHandoff\(JSON\.parse\(raw\)\)/);
  assert.doesNotMatch(body, /as Record<string, string>/);
  assert.doesNotMatch(body, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('chat handoff normalizer enforces a bounded known-field schema', () => {
  const body = functionBody('normalizeChatHandoff');
  assert.match(body, /CHAT_HANDOFF_FIELDS\.has\(key\)/);
  assert.match(body, /source\.trim\(\)\.length === 0/);
  assert.match(body, /CHAT_HANDOFF_LIMITS\.source/);
  assert.match(body, /CHAT_HANDOFF_LIMITS\[field\]/);
});

test('answer reviewer only navigates after the synchronous handoff write returns', () => {
  assert.match(
    reviewer,
    /setChatHandoff\(\{[\s\S]*?source: "answer-reviewer"[\s\S]*?\}\);\s*navigate\("\/chatbot"\);/,
  );
});
