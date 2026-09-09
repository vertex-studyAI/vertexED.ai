import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const player = readFileSync(
  new URL('../src/components/notebook/NotebookTtsPlayer.tsx', import.meta.url),
  'utf8',
);

test('notebook TTS does not expose an enabled no-op Play control for non-speakable content', () => {
  assert.match(player, /const speechText = scriptToSpeech\(script\);/);
  assert.match(player, /if \(!speechText\) return;/);
  assert.match(
    player,
    /if \(!speechSupported \|\| \(!speechText && !playing && !paused\)\) return null;/,
  );
  assert.match(player, /disabled=\{!speechText\}/);
  assert.match(player, /new SpeechSynthesisUtterance\(speechText\)/);
});
