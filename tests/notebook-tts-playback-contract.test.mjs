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
  assert.equal((player.match(/utteranceRef\.current = null;/g) ?? []).length, 3);
});

test('replacing generated script content stops stale speech before it can be resumed', () => {
  assert.match(player, /const previousScriptRef = useRef\(script\);/);
  assert.match(
    player,
    /useEffect\(\(\) => \{\s*if \(previousScriptRef\.current === script\) return;\s*previousScriptRef\.current = script;\s*stop\(\);\s*\}, \[script, stop\]\);/,
  );
});

test('speech control icons remain decorative because controls already have text or an accessible name', () => {
  assert.match(player, /<Play className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Pause className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Square className="h-3 w-3" aria-hidden \/>/);
});
