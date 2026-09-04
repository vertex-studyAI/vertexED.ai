import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const manifestUrl = new URL('research/multimodal-calibration/AUTHORIZATION_MANIFEST.json', root);

async function sha256(url) {
  return crypto.createHash('sha256').update(await fs.readFile(url)).digest('hex');
}

test('authorization manifest binds the exact prompt and scoring implementation bytes', async () => {
  const manifest = JSON.parse(await fs.readFile(manifestUrl, 'utf8'));
  const scoring = manifest.option_score_extraction;

  assert.equal(scoring.prompt_template_path, 'research/multimodal-calibration/prompt-template.mjs');
  assert.equal(scoring.prompt_template_sha256, await sha256(new URL(scoring.prompt_template_path, root)));
  assert.equal(scoring.implementation_path, 'research/multimodal-calibration/option-scoring.mjs');
  assert.equal(scoring.implementation_sha256, await sha256(new URL(scoring.implementation_path, root)));
  assert.equal(scoring.validated_against_model, false);
});
