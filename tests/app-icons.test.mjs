import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';

test('every manifest icon has its declared dimensions and an opaque maskable safe area', async () => {
  const manifest = JSON.parse(await readFile('public/site.webmanifest', 'utf8'));
  for (const icon of manifest.icons) {
    const meta = await sharp(`public${icon.src}`).metadata();
    assert.equal(`${meta.width}x${meta.height}`, icon.sizes);
  }
  assert.ok(manifest.icons.some(icon => icon.sizes === '192x192' && icon.purpose === 'any'));
  const { data, info } = await sharp('public/icon-maskable-512.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += info.channels) {
    assert.equal(data[i + 3], 255);
    if (data[i] > 200 && data[i + 1] > 200) {
      const pixel = i / info.channels;
      assert.ok(Math.hypot(pixel % 512 - 256, Math.floor(pixel / 512) - 256) <= 205, 'mark fits maskable safe circle');
    }
  }
});

test('ICO entries point to real PNGs at 16, 32 and 48 pixels', async () => {
  const ico = await readFile('public/favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  for (let i = 0; i < 3; i++) {
    const at = 6 + i * 16;
    const start = ico.readUInt32LE(at + 12);
    const size = ico.readUInt32LE(at + 8);
    const meta = await sharp(ico.subarray(start, start + size)).metadata();
    assert.equal(meta.width, [16, 32, 48][i]);
  }
});
