#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import { removePilotParticipant } from '../src/lib/pilotAnalyticsCore.mjs';

const parseArgs = (argv) => {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value == null) return null;
    args.set(key.slice(2), value);
  }
  return args;
};

const args = parseArgs(process.argv.slice(2));
if (!args?.get('input') || !args?.get('output') || !args?.get('participant')) {
  process.stderr.write('Usage: node scripts/remove-pilot-participant.mjs --input pilot.json --output retained.json --participant <pseudonymous-id>\n');
  process.exitCode = 2;
} else {
  try {
    const inputBytes = await readFile(args.get('input'));
    const parsed = JSON.parse(inputBytes.toString('utf8'));
    const records = Array.isArray(parsed) ? parsed : parsed?.sessions;
    if (!Array.isArray(records)) throw new TypeError('input JSON must be an array or an object with a sessions array');

    const beforeSha256 = createHash('sha256').update(inputBytes).digest('hex');
    const result = removePilotParticipant(records, args.get('participant'));
    const output = { sessions: result.records };
    const outputBytes = Buffer.from(`${JSON.stringify(output, null, 2)}\n`, 'utf8');
    const afterSha256 = createHash('sha256').update(outputBytes).digest('hex');

    await writeFile(args.get('output'), outputBytes);
    process.stdout.write(`${JSON.stringify({
      removed_record_count: result.removed_record_count,
      retained_record_count: result.records.length,
      input_sha256: beforeSha256,
      output_sha256: afterSha256,
    })}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
