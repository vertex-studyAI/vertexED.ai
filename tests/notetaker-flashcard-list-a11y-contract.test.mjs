import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/pages/NotetakerQuiz.tsx', 'utf8');

test('inline flashcard picker exposes a named list navigation region', () => {
  assert.match(source, /<nav className="mt-3 flex gap-2 overflow-auto pb-1" aria-label="Flashcard list">/);
  assert.match(source, /aria-label=\{`Go to flashcard \$\{i \+ 1\}`\}/);
  assert.match(source, /aria-current=\{i === currentFlashIndex \? "true" : undefined\}/);
});

test('flashcard empty states announce with status role', () => {
  assert.match(
    source,
    /role="status">No flashcards yet - generate notes first and we'll build them for you\.<\/div>/,
  );
  assert.match(
    source,
    /role="status">Generate notes first - flashcards and quiz use the same source material\.<\/div>/,
  );
});
