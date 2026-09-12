import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const source = fs.readFileSync('src/lib/userContent.ts', 'utf8');

function functionBody(name) {
  const match = source.match(new RegExp(`export function ${name}\\([^)]*\\)[^{]*\\{([\\s\\S]*?)\\n\\}`, 'm'));
  assert.ok(match, `${name} must exist`);
  return match[1];
}

test('artifact restore producer resolves session storage through the fail-closed boundary', () => {
  const body = functionBody('queueArtifactRestore');
  assert.match(body, /resolveSessionStorage\(window\)/);
  assert.match(body, /safeStorageSet\(storage, restore, JSON\.stringify\(item\)\)/);
  assert.match(body, /throw new Error\('Temporary browser storage is unavailable\.'\)/);
  assert.doesNotMatch(body, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});

test('artifact restore consumer is one-time and validates persisted payloads', () => {
  const body = functionBody('consumeArtifactRestore');
  assert.match(body, /resolveSessionStorage\(window\)/);
  assert.match(body, /safeStorageGet\(storage, restore\)/);
  assert.match(body, /safeStorageRemove\(storage, restore\)/);
  assert.match(body, /normalizeStoredArtifact\(JSON\.parse\(raw\)\)/);
  assert.doesNotMatch(body, /as StudyArtifact/);
  assert.doesNotMatch(body, /sessionStorage\.(?:getItem|setItem|removeItem)/);
});
