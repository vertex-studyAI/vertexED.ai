import assert from 'node:assert/strict';
import test from 'node:test';
import { formatFriendlyMath } from '../src/lib/friendlyMath.mjs';

test('friendly maths converts common spoken entry without executing input', () => {
  assert.equal(formatFriendlyMath('x square plus y cubed'), 'x² plus y³');
  assert.equal(formatFriendlyMath('a to the power of 12'), 'a¹²');
  assert.equal(formatFriendlyMath('square root of 81'), '√(81)');
  assert.equal(formatFriendlyMath('2 times x divided by 4'), '2 × x ÷ 4');
  assert.equal(formatFriendlyMath('<script>alert(1)</script>'), '<script>alert(1)</script>');
});
