import assert from 'node:assert/strict';
import test from 'node:test';

import sharp from 'sharp';

import {
  applyShiftTransform,
  SHIFT_CONDITIONS,
  TRANSFORM_LIBRARY,
  TRANSFORM_SEED
} from '../research/multimodal-calibration/transforms.mjs';

async function makeFixture() {
  return sharp({
    create: {
      width: 20,
      height: 20,
      channels: 3,
      background: { r: 240, g: 20, b: 10 }
    }
  }).png().toBuffer();
}

async function pixelAt(buffer, x, y) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const offset = (y * info.width + x) * info.channels;
  return Array.from(data.subarray(offset, offset + 3));
}

test('transform provenance constants stay frozen', () => {
  assert.equal(TRANSFORM_SEED, 20260904);
  assert.deepEqual(TRANSFORM_LIBRARY, { package: 'sharp', version: '0.35.3' });
  assert.deepEqual(Object.keys(SHIFT_CONDITIONS), ['S0', 'S1', 'S2', 'S3', 'S4', 'S5']);
});

test('clean transform is byte deterministic and canonicalizes to PNG', async () => {
  const fixture = await makeFixture();
  const first = await applyShiftTransform(fixture, 'S0');
  const second = await applyShiftTransform(fixture, 'S0');

  assert.deepEqual(first, second);
  const metadata = await sharp(first).metadata();
  assert.equal(metadata.format, 'png');
  assert.equal(metadata.width, 20);
  assert.equal(metadata.height, 20);
});

test('blur severities are deterministic and alter a nonuniform image', async () => {
  const fixture = await sharp({
    create: {
      width: 20,
      height: 20,
      channels: 3,
      background: { r: 0, g: 0, b: 0 }
    }
  })
    .composite([{ input: await sharp({ create: { width: 4, height: 4, channels: 3, background: { r: 255, g: 255, b: 255 } } }).png().toBuffer(), left: 8, top: 8 }])
    .png()
    .toBuffer();

  const clean = await applyShiftTransform(fixture, 'S0');
  for (const condition of ['S1', 'S2', 'S3']) {
    const first = await applyShiftTransform(fixture, condition);
    const second = await applyShiftTransform(fixture, condition);
    assert.deepEqual(first, second);
    assert.notDeepEqual(first, clean);
  }
});

test('central occlusion replaces only the centered half-width by half-height patch', async () => {
  const fixture = await makeFixture();
  const occluded = await applyShiftTransform(fixture, 'S4');

  assert.deepEqual(await pixelAt(occluded, 10, 10), [127, 127, 127]);
  assert.deepEqual(await pixelAt(occluded, 0, 0), [240, 20, 10]);
  assert.deepEqual(await pixelAt(occluded, 19, 19), [240, 20, 10]);
});

test('missingness returns a fixed neutral placeholder at original dimensions', async () => {
  const fixture = await makeFixture();
  const missing = await applyShiftTransform(fixture, 'S5');
  const metadata = await sharp(missing).metadata();

  assert.equal(metadata.width, 20);
  assert.equal(metadata.height, 20);
  assert.deepEqual(await pixelAt(missing, 0, 0), [127, 127, 127]);
  assert.deepEqual(await pixelAt(missing, 10, 10), [127, 127, 127]);
});

test('unknown conditions and empty inputs fail closed', async () => {
  const fixture = await makeFixture();
  await assert.rejects(() => applyShiftTransform(fixture, 'S9'), /unknown multimodal calibration shift condition/);
  await assert.rejects(() => applyShiftTransform(Buffer.alloc(0), 'S0'), /input must be a non-empty Buffer/);
});
