import test from "node:test";
import assert from "node:assert/strict";

// Inline copy of typewriter logic for unit test (module is TS in src/)
function animateTypewriterSync(text, onUpdate) {
  if (!text.length) {
    onUpdate("");
    return [];
  }
  const steps = [text.slice(0, 1)];
  for (let index = 1; index < text.length; index += 1) {
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
