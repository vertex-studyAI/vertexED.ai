#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

import {
  buildParticipantPilotExport,
  buildPilotExport,
  pilotSessionsToCsv,
} from '../src/lib/pilotAnalyticsCore.mjs';

const usage = () => {
  process.stderr.write(
    [
      'Usage:',
      '  node scripts/export-pilot-analytics.mjs --input pilot.json --json out.json --csv out.csv',
      '    --generated-at 2026-09-02T00:00:00.000Z --source-revision <git-sha> [--participant <pseudonymous-id>]',
      '',
      'Input may be a JSON array of session records or {"sessions": [...]}.',
    ].join('\n') + '\n',
  );
};

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
const required = ['input', 'json', 'csv', 'generated-at', 'source-revision'];
if (!args || required.some((key) => !args.get(key))) {
  usage();
  process.exitCode = 2;
} else {
  try {
    const inputBytes = await readFile(args.get('input'));
    const parsed = JSON.parse(inputBytes.toString('utf8'));
    const records = Array.isArray(parsed) ? parsed : parsed?.sessions;
    if (!Array.isArray(records)) throw new TypeError('input JSON must be an array or an object with a sessions array');

    const digest = createHash('sha256').update(inputBytes).digest('hex');
    const metadata = {
      generated_at: args.get('generated-at'),
      source_revision: args.get('source-revision'),
      source: `input-sha256:${digest}`,
    };
    const participant = args.get('participant');
    const exported = participant
      ? buildParticipantPilotExport(records, participant, metadata)
      : buildPilotExport(records, metadata);
    const csvRecords = participant
      ? records.filter((record) => record?.participant_id === participant)
      : records;

    await writeFile(args.get('json'), `${JSON.stringify(exported, null, 2)}\n`, 'utf8');
    await writeFile(args.get('csv'), pilotSessionsToCsv(csvRecords), 'utf8');

    process.stdout.write(
      `${JSON.stringify({
        schema: exported.schema,
        accepted_session_count: exported.metadata.accepted_session_count,
        rejected_record_count: exported.metadata.rejected_record_count,
        input_sha256: digest,
      })}\n`,
    );
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
