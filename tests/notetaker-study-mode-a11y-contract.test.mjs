import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');
const app = fs.readFileSync('src/app/App.tsx', 'utf8');

test('notetaker route keeps the accessibility boundary wrapper', () => {
  assert.match(
    app,
    /path="notetaker"\s+element=\{<ProtectedRoute><NotetakerAccessibilityBoundary><NotetakerQuiz \/><\/NotetakerAccessibilityBoundary><\/ProtectedRoute>\}/,
  );
});

test('fullscreen flashcard overlay ships native dialog semantics', () => {
  assert.match(source, /aria-label="Fullscreen flashcard study"/);
  assert.match(source, /aria-label="Close Fullscreen flashcard study"/);
  assert.match(source, /role="dialog"[\s\S]*?aria-modal="true"[\s\S]*?Fullscreen flashcard study/);
  assert.match(source, /Card \{currentFlashIndex \+ 1\}\/\{flashcards\.length\}/);
  assert.match(source, /role="status" aria-live="polite"[\s\S]*?Card \{currentFlashIndex \+ 1\}/);
});

test('spaced-repetition study mode ships native dialog semantics and rating names', () => {
  assert.match(source, /aria-label="Spaced repetition study mode"/);
  assert.match(source, /aria-label="Close Spaced repetition study mode"/);
  assert.match(source, /role="group" aria-label="Rate this flashcard"/);
  assert.match(source, /aria-label=\{`Rate card \$\{rating\}`\}/);
  assert.match(
    source,
    /Card \{studyIndex \+ 1\} of \{studyQueue\.length\}/,
  );
  assert.match(
    source,
    /role="status" aria-live="polite"[\s\S]*?Card \{studyIndex \+ 1\} of \{studyQueue\.length\}/,
  );
});
