#!/usr/bin/env node
import { createGzip } from 'node:zlib';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { readFile } from 'node:fs/promises';

import {
  DARCY_V2_SPLITS,
  generateV2Permeability,
  hashV2Manifest,
  buildV2SplitManifest,
} from '../src/v2.mjs';
import { solveSteadyDarcy1D } from '../src/core.mjs';

const args = process.argv.slice(2);
const get = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
};
const has = (name) => args.includes(name);

const splitName = get('--split');
const outPath = get('--out');
if (!splitName || !outPath) {
  throw new Error('usage: export-v2-dataset.mjs --split <name> --out <path.jsonl.gz> [--preoutcome-data] --freeze-config <path>');
}
const split = DARCY_V2_SPLITS[splitName];
if (!split) throw new Error(`unknown frozen split: ${splitName}`);

const configPath = get('--freeze-config');
if (!configPath) throw new Error('FAIL-CLOSED: --freeze-config is required');
const freeze = JSON.parse(await readFile(configPath, 'utf8'));

const preOutcomeAllowed = has('--preoutcome-data') && ['train', 'validation'].includes(splitName);
if (!preOutcomeAllowed && freeze.training_authorized !== true) {
  throw new Error('FAIL-CLOSED: test/OOD export is forbidden while training_authorized is false');
}
if (['id_test', 'ood_a', 'ood_b', 'ood_c', 'ood_d', 'ood_e'].includes(splitName) && freeze.training_authorized !== true) {
  throw new Error('FAIL-CLOSED: ID-test/OOD reference export is locked until the full learned freeze is authorized');
}

const manifestHash = hashV2Manifest(buildV2SplitManifest());
if (manifestHash !== freeze.unresolved_pretraining_blockers.split_manifest_sha256) {
  throw new Error(`split manifest hash mismatch: ${manifestHash}`);
}

async function* rows() {
  for (let offset = 0; offset < split.count; offset += 1) {
    const seed = split.start + offset;
    const generated = generateV2Permeability(splitName, seed);
    const target = solveSteadyDarcy1D(generated.permeability);
    yield JSON.stringify({
      protocolId: freeze.protocol_id,
      split: splitName,
      seed,
      spec: generated.spec,
      logK: generated.logK,
      pressure: target.pressure,
      flux: target.flux,
    }) + '\n';
  }
}

await pipeline(Readable.from(rows()), createGzip({ level: 9 }), createWriteStream(outPath));
console.log(JSON.stringify({
  split: splitName,
  count: split.count,
  out: outPath,
  splitManifestSha256: manifestHash,
  scientificOutcomeEvaluated: false,
}, null, 2));
