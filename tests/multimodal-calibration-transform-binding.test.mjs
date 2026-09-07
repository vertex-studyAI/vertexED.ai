import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import test from 'node:test';

const manifestUrl = new URL('../research/multimodal-calibration/AUTHORIZATION_MANIFEST.json', import.meta.url);

test('authorization manifest transform digest matches exact implementation bytes', async () => {
  const manifest = JSON.parse(await fs.readFile(manifestUrl, 'utf8'));
  const implementationUrl = new URL(`../${manifest.transforms.implementation_path}`, import.meta.url);
  const implementation = await fs.readFile(implementationUrl);
  const digest = createHash('sha256').update(implementation).digest('hex');

  assert.equal(manifest.transforms.implementation_sha256, digest);
});
