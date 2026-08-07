import test from "node:test";
import assert from "node:assert/strict";

function animateTypewriterSync(text, onUpdate, startIndex = 0) {
  if (!text.length) {
    onUpdate("");
    return [];
  }
  const steps = [];
  if (startIndex <= 0) {
    steps.push(text.slice(0, 1));
  }
  const from = startIndex > 0 ? startIndex : 1;
  for (let index = from; index < text.length; index += 1) {
    steps.push(text.slice(0, index + 1));
  }
  return steps;
}

test("typewriter includes first character immediately", () => {
  const steps = animateTypewriterSync("Hello", () => {});
  assert.equal(steps[0], "H");
  assert.equal(steps[steps.length - 1], "Hello");
  assert.equal(steps.length, 5);
});

test("typewriter handles single character", () => {
  const steps = animateTypewriterSync("A", () => {});
  assert.deepEqual(steps, ["A"]);
});

test("typewriter startIndex skips already-rendered prefix", () => {
  const steps = animateTypewriterSync("Hello", () => {}, 1);
  assert.deepEqual(steps, ["He", "Hel", "Hell", "Hello"]);
});

test("apex chat storage keys separate account and thread", () => {
  function normalizeAccount(scope) {
    if (scope === undefined) return "unhydrated";
    if (scope === null || typeof scope !== "string" || !scope.trim()) return "signed-out";
    return encodeURIComponent(scope.trim()).slice(0, 256);
  }
  function apexChatStorageKey(page, threadKey, accountScope) {
    const account = normalizeAccount(accountScope);
    const thread = threadKey?.trim() || page || "global";
    return `vertex_apex:${account}:${encodeURIComponent(thread).slice(0, 120)}`;
  }

  const firstUser = apexChatStorageKey("chatbot", "apex-main", "user-1");
  const secondUser = apexChatStorageKey("chatbot", "apex-main", "user-2");
  assert.notEqual(firstUser, secondUser);
  assert.notEqual(apexChatStorageKey("chatbot", "socratic-drill", "user-1"), firstUser);
  assert.notEqual(apexChatStorageKey("chatbot", "apex-main", undefined), firstUser);
  assert.notEqual(apexChatStorageKey("chatbot", "apex-main", null), firstUser);
});
