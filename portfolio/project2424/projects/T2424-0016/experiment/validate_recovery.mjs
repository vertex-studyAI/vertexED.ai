import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateRecoveredManifest } from '../src/evidence_gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, '..', 'evidence', 'recovered_claims.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const summary = validateRecoveredManifest(manifest);
console.log(JSON.stringify(summary, null, 2));
