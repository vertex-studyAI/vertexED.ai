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
    /const activeUtterance = utteranceRef\.current;\s*if \(activeUtterance && typeof window !== 'undefined' && window\.speechSynthesis\) \{[\s\S]*?window\.speechSynthesis\.cancel\(\);/,
  );
});

test('play reconciles script identity before resume so effects cannot expose stale speech', () => {
  const playStart = player.indexOf('const play = () =>');
  const cleanStart = player.indexOf('const clean = scriptToSpeech(script);', playStart);
  const resumeStart = player.indexOf('if (paused && utteranceRef.current)', playStart);
  assert.ok(playStart >= 0 && cleanStart > playStart && resumeStart > cleanStart);

  const preResume = player.slice(playStart, resumeStart);
  assert.match(
    preResume,
    /if \(previousScriptRef\.current !== script\) \{\s*previousScriptRef\.current = script;\s*if \(utteranceRef\.current\) stop\(\);\s*\}/,
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

test('resume failures stop only the utterance owned by this player', () => {
  assert.match(
    player,
    /if \(paused && utteranceRef\.current\) \{\s*try \{\s*window\.speechSynthesis\.resume\(\);\s*setPaused\(false\);\s*setPlaying\(true\);\s*\} catch \{\s*stop\(\);\s*\}\s*return;/,
  );
});

test('speak failures clear owned playback state instead of leaving a hidden active utterance', () => {
  assert.match(
    player,
    /utteranceRef\.current = utterance;\s*try \{\s*window\.speechSynthesis\.speak\(utterance\);\s*setPlaying\(true\);\s*\} catch \{\s*if \(utteranceRef\.current === utterance\) \{\s*utteranceRef\.current = null;\s*setPlaying\(false\);\s*setPaused\(false\);/,
  );
});

test('stop clears local playback ownership even when browser cancellation throws', () => {
  const stopStart = player.indexOf('const stop = useCallback');
  const cleanupStart = player.indexOf('// Cleanup must not call', stopStart);
  assert.ok(stopStart >= 0 && cleanupStart > stopStart);
  const stopSection = player.slice(stopStart, cleanupStart);

  assert.match(stopSection, /try \{\s*window\.speechSynthesis\.cancel\(\);\s*\} catch \{/);
  const cancelIndex = stopSection.indexOf('window.speechSynthesis.cancel()');
  const clearIndex = stopSection.indexOf('utteranceRef.current = null');
  assert.ok(cancelIndex >= 0 && clearIndex > cancelIndex);
});

test('unmount cleanup cancels only an owned utterance and never calls stateful stop', () => {
  const cleanupStart = player.indexOf('// Cleanup must not call');
  const scriptChangeStart = player.indexOf('// Generated notebook content can be replaced', cleanupStart);
  assert.ok(cleanupStart >= 0 && scriptChangeStart > cleanupStart);
  const cleanupSection = player.slice(cleanupStart, scriptChangeStart);

  assert.match(cleanupSection, /if \(!utteranceRef\.current\) return;/);
  assert.match(cleanupSection, /try \{\s*window\.speechSynthesis\.cancel\(\);\s*\} catch \{/);
  assert.match(cleanupSection, /utteranceRef\.current = null;/);
  assert.doesNotMatch(cleanupSection, /\bstop\(\)/);
});

test('unmount cleanup releases local ownership even when browser cancellation throws', () => {
  const cleanupStart = player.indexOf('// Cleanup must not call');
  const scriptChangeStart = player.indexOf('// Generated notebook content can be replaced', cleanupStart);
  const cleanupSection = player.slice(cleanupStart, scriptChangeStart);
  const cancelIndex = cleanupSection.indexOf('window.speechSynthesis.cancel()');
  const catchIndex = cleanupSection.indexOf('} catch {', cancelIndex);
  const clearIndex = cleanupSection.indexOf('utteranceRef.current = null', catchIndex);

  assert.ok(cancelIndex >= 0);
  assert.ok(catchIndex > cancelIndex);
  assert.ok(clearIndex > catchIndex);
});

test('pause cannot affect the global speech queue without an owned utterance', () => {
  const pauseStart = player.indexOf('const pause = () =>');
  const renderStart = player.indexOf('// Render the same empty tree', pauseStart);
  assert.ok(pauseStart >= 0 && renderStart > pauseStart);
  const pauseSection = player.slice(pauseStart, renderStart);

  assert.match(
    pauseSection,
    /!window\.speechSynthesis \|\|\s*!utteranceRef\.current\s*\) \{\s*return;/,
  );
  assert.match(pauseSection, /try \{\s*window\.speechSynthesis\.pause\(\);/);
});

test('pause failures fail closed through the owned stop path', () => {
  const pauseStart = player.indexOf('const pause = () =>');
  const renderStart = player.indexOf('// Render the same empty tree', pauseStart);
  const pauseSection = player.slice(pauseStart, renderStart);
  assert.match(
    pauseSection,
    /try \{\s*window\.speechSynthesis\.pause\(\);\s*setPaused\(true\);\s*setPlaying\(false\);\s*\} catch \{[\s\S]*?stop\(\);\s*\}/,
  );
});

test('speech control icons remain decorative because controls already have text or an accessible name', () => {
  assert.match(player, /<Play className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Pause className="h-3\.5 w-3\.5" aria-hidden \/>/);
  assert.match(player, /<Square className="h-3 w-3" aria-hidden \/>/);
});
