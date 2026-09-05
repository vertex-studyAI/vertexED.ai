import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const player = readFileSync(new URL('../src/components/notebook/NotebookTtsPlayer.tsx', import.meta.url), 'utf8');

test('speech completion callbacks cannot clobber a newer utterance', () => {
  assert.match(
    player,
    /utterance\.onend = \(\) => \{\s*if \(utteranceRef\.current !== utterance\) return;/,
  );
  assert.match(
    player,
    /utterance\.onerror = \(\) => \{\s*if \(utteranceRef\.current !== utterance\) return;/,
  );
});

test('replacing generated script content only cancels speech owned by this player', () => {
  assert.match(player, /const previousScriptRef = useRef\(script\);/);
  assert.match(
    player,
    /if \(previousScriptRef\.current === script\) return;\s*previousScriptRef\.current = script;\s*if \(utteranceRef\.current\) stop\(\);/,
  );
  assert.match(
    player,
    /const activeUtterance = utteranceRef\.current;\s*if \(activeUtterance && typeof window !== 'undefined' && window\.speechSynthesis\) \{\s*window\.speechSynthesis\.cancel\(\);/,
  );
});

test('unsupported speech synthesis does not create a server/client hydration mismatch', () => {
  assert.match(player, /const \[speechSupported, setSpeechSupported\] = useState\(false\);/);
  assert.match(
    player,
    /setSpeechSupported\(\s*typeof window !== 'undefined' &&\s*Boolean\(window\.speechSynthesis\) &&\s*typeof SpeechSynthesisUtterance === 'function',\s*\);/,
  );
  assert.match(player, /if \(!speechSupported\) return null;/);
  assert.doesNotMatch(player, /if \(typeof window !== 'undefined' && !window\.speechSynthesis\)/);
});

test('play requires both the speech queue and utterance constructor', () => {
  assert.match(
    player,
    /typeof window === 'undefined' \|\|\s*!window\.speechSynthesis \|\|\s*typeof SpeechSynthesisUtterance !== 'function'/,
  );
  assert.match(player, /const utterance = new SpeechSynthesisUtterance\(clean\);/);
});

test('unmount cleanup cancels only an owned utterance and never calls stateful stop', () => {
  assert.match(
    player,
    /\(\) => \(\) => \{\s*if \(!utteranceRef\.current\) return;[\s\S]*?window\.speechSynthesis\.cancel\(\);[\s\S]*?utteranceRef\.current = null;\s*\}/,
  );
  assert.doesNotMatch(player, /useEffect\(\(\) => \(\) => stop\(\), \[stop\]\)/);
});

test('pause cannot affect the global speech queue without an owned utterance', () => {
  assert.match(
    player,
    /!window\.speechSynthesis \|\|\s*!utteranceRef\.current\s*\) \{\s*return;\s*\}\s*window\.speechSynthesis\.pause\(\);/,
  );
});

test('speech control icons remain decorative because controls already have text or an accessible name', () => {
  assert.match(player, /<Play className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Pause className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Square className="h-3 w-3" aria-hidden \/>/);
});
