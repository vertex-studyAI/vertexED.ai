import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const mockExamSource = await readFile(
  new URL("../src/components/MockExamMode.tsx", import.meta.url),
  "utf8",
);
const modalSource = await readFile(
  new URL("../src/components/AccessibleModal.tsx", import.meta.url),
  "utf8",
);

test("mock exam reuses the shared accessible modal in every rendered state", () => {
  assert.match(mockExamSource, /import AccessibleModal from "@\/components\/AccessibleModal"/);
  assert.equal((mockExamSource.match(/<AccessibleModal/g) ?? []).length, 3);
  assert.match(mockExamSource, /initialFocusRef={titleRef}/);
  assert.match(mockExamSource, /titleId="mock-exam-title"/);
  assert.match(mockExamSource, /descriptionId="mock-exam-description"/);
});

test("shared modal accepts a self-contained overlay without weakening defaults", () => {
  assert.match(modalSource, /overlayClassName\?: string/);
  assert.match(modalSource, /overlayClassName = "blur-background"/);
  assert.match(modalSource, /<div className={overlayClassName} role="presentation">/);
  assert.match(modalSource, /role="dialog"/);
  assert.match(modalSource, /aria-modal="true"/);
  assert.match(modalSource, /trapModalFocus/);
  assert.match(modalSource, /restoreModalFocus/);
});

test("generated mock-exam content has screen-reader labels", () => {
  assert.match(mockExamSource, /role="timer"/);
  assert.match(mockExamSource, /aria-label={`Time remaining:/);
  assert.match(mockExamSource, /aria-label="Exam question navigation"/);
  assert.match(mockExamSource, /aria-current={i === index \? "step" : undefined}/);
  assert.match(mockExamSource, /aria-label={`Go to question/);
  assert.match(mockExamSource, /<label htmlFor="mock-exam-answer" className="sr-only">/);
  assert.match(mockExamSource, /aria-expanded={showRubric}/);
  assert.match(mockExamSource, /aria-controls="mock-exam-rubric-notes"/);
});

test("mock-exam overlays do not depend on planner-only CSS", () => {
  assert.match(mockExamSource, /const CENTERED_OVERLAY =/);
  assert.match(mockExamSource, /const FULL_SCREEN_OVERLAY =/);
  assert.match(mockExamSource, /overlayClassName={CENTERED_OVERLAY}/);
  assert.match(mockExamSource, /overlayClassName={FULL_SCREEN_OVERLAY}/);
});
