import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const apexHookSource = fs.readFileSync('src/hooks/useApexChat.ts', 'utf8');
const askSource = fs.readFileSync('api/_handlers/ask.js', 'utf8');
const guideSource = fs.readFileSync('api/_handlers/study-guide-chat.js', 'utf8');

test('Apex client sends only completed prior turns in history', () => {
  assert.match(apexHookSource, /const priorHistory: ChatbotMessage\[\] = messages\.map/);
  assert.doesNotMatch(apexHookSource, /\[\.\.\.messages, userMsg\]\.map/);
  assert.match(apexHookSource, /fetchChatbotAnswer\(\{/);
  assert.match(apexHookSource, /question,/);
  assert.match(apexHookSource, /history: priorHistory,/);
  assert.match(apexHookSource, /context,/);
  assert.match(apexHookSource, /sources,/);
});

test('ask handler drops an older-client trailing duplicate of the current question', () => {
  assert.match(askSource, /const recentHistory = history\.slice\(-10\)/);
  assert.match(askSource, /duplicatesCurrentQuestion/);
  assert.match(askSource, /index === recentHistory\.length - 1 && role === "user" && text === trimmedQuestion/);
  assert.match(askSource, /if \(text && !duplicatesCurrentQuestion\) messages\.push/);
  assert.match(askSource, /messages\.push\(\{ role: "user", content: trimmedQuestion \}\)/);
});

test('study-guide chat also drops a trailing duplicate current question', () => {
  assert.match(guideSource, /const historyEntries = Array\.isArray\(history\) \? history\.slice\(-4\) : \[\]/);
  assert.match(guideSource, /index === historyEntries\.length - 1 && role === 'user' && text === trimmedQuestion/);
  assert.match(guideSource, /STUDENT QUESTION: \$\{trimmedQuestion\}/);
});
