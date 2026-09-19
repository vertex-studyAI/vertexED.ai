import assert from 'node:assert/strict';
import test from 'node:test';
import { join } from 'node:path';
import { resolvePublicGuidePath } from '../api/_lib/studyGuideRetrieval.js';

const root = join(process.cwd(), 'public');

test('resolvePublicGuidePath accepts approved study-guide markdown under public/', () => {
  const resolved = resolvePublicGuidePath(root, '/study-guides/myp/biology/command-terms.md');
  assert.ok(resolved.endsWith(`${join('public', 'study-guides', 'myp', 'biology', 'command-terms.md')}`)
    || resolved.includes(`${join('study-guides', 'myp', 'biology', 'command-terms.md')}`));
});

test('resolvePublicGuidePath rejects traversal and non-guide paths', () => {
  assert.throws(() => resolvePublicGuidePath(root, '../package.json'), /Invalid study guide path/);
  assert.throws(() => resolvePublicGuidePath(root, '/study-guides/../../.env'), /Invalid study guide path/);
  assert.throws(() => resolvePublicGuidePath(root, '/study-guides/myp/secret.txt'), /Invalid study guide path/);
  assert.throws(() => resolvePublicGuidePath(root, '/etc/passwd'), /Invalid study guide path/);
});
