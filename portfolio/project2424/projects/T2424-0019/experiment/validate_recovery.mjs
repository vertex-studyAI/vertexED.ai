import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateNpmsRecovery } from '../src/recovery_gate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.join(here, '..', 'evidence', 'recovered_experiment_report.json');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
console.log(JSON.stringify(validateNpmsRecovery(report), null, 2));
