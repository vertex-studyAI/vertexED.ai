import assert from 'node:assert/strict';
import test from 'node:test';
import { createFluid } from '../src/lib/landingFluid.mjs';

test('fluid bounds allocation and ignores invalid pointer samples', () => {
  const fluid = createFluid(10000, -20);
  assert.equal(fluid.width, 128); assert.equal(fluid.height, 16);
  fluid.splat(NaN, .5, .1, .1);
  assert.ok(fluid.dye.every(value => value === 0));
});
test('dye advects, dissipates, remains finite and resets', () => {
  const fluid = createFluid(32, 24);
  fluid.splat(.5, .5, .2, -.1);
  const initial = [...fluid.dye];
  assert.ok(initial.some(value => value > 0));
  fluid.step(0); assert.deepEqual([...fluid.dye], initial);
  fluid.step(.03); assert.notDeepEqual([...fluid.dye], initial);
  for (let i = 0; i < 240; i++) fluid.step(.03);
  assert.ok(fluid.dye.every(value => Number.isFinite(value) && value >= 0 && value < .001));
  fluid.clear(); assert.ok(fluid.dye.every(value => value === 0));
});
test('extreme movement and stalled frames cannot grow dye unbounded', () => {
  const fluid = createFluid(24, 24);
  for (let i = 0; i < 50; i++) { fluid.splat(.5, .5, 1e9, -1e9); fluid.step(100); }
  assert.ok(fluid.dye.every(value => Number.isFinite(value) && value >= 0 && value <= 1.5));
});
