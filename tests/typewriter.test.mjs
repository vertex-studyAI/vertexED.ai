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

test("apex chat storage keys are scoped per page", () => {
  function apexChatStorageKey(page, threadKey) {
    const scope = threadKey?.trim() || page || "global";
    return `vertex_apex_thread_${scope}`;
  }
  assert.equal(apexChatStorageKey("chatbot"), "vertex_apex_thread_chatbot");
  assert.equal(apexChatStorageKey("chatbot", "socratic-drill"), "vertex_apex_thread_socratic-drill");
  assert.notEqual(apexChatStorageKey("chatbot"), apexChatStorageKey("study-zone"));
});
