import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { selectProductionIncident } from '../scripts/select-production-incident.mjs';

const title = 'Production health monitor failure';
const root = fileURLToPath(new URL('../', import.meta.url));
const workflow = readFileSync(new URL('../.github/workflows/production-health.yml', import.meta.url), 'utf8');
const unrelated = Array.from({ length: 100 }, (_, index) => ({
  number: 1200 + index,
  title: `Unrelated issue ${index}`,
  state: 'open',
}));
const original = { number: 652, title, state: 'open' };

function lookups(source) {
  return [...source.matchAll(/issue_number="\$\(([\s\S]*?)\n          \)"/g)].map((match) => match[1]);
}

function runLookup(command, pages, exitStatus = 0) {
  const directory = mkdtempSync(join(tmpdir(), 'vertexed-incident-'));
  try {
    const fixture = join(directory, 'pages.json');
    writeFileSync(fixture, JSON.stringify(pages));
    writeFileSync(join(directory, 'gh'), `#!${process.execPath}\n
      const fs = require('node:fs');
      const args = process.argv.slice(2);
      const pages = JSON.parse(fs.readFileSync(process.env.INCIDENT_FIXTURE, 'utf8'));
      const selected = args.includes('--paginate') ? pages : pages.slice(0, 1);
      if (args.includes('--slurp')) {
        process.stdout.write(JSON.stringify(selected));
      } else {
        for (const issue of selected.flat()) {
          if (issue.title === process.env.INCIDENT_TITLE) console.log(issue.number);
        }
      }
      process.exitCode = Number(process.env.INCIDENT_FIXTURE_EXIT);
    `, { mode: 0o755 });
    return spawnSync('bash', ['-c', `set -euo pipefail\nissue_number="$(\n${command}\n)"\nprintf '%s' "$issue_number"`], {
      cwd: root,
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}${delimiter}${process.env.PATH}`,
        GITHUB_REPOSITORY: 'vertex-studyAI/vertexED.ai',
        INCIDENT_TITLE: title,
        INCIDENT_FIXTURE: fixture,
        INCIDENT_FIXTURE_EXIT: String(exitStatus),
      },
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('both live workflow lookups find an incident beyond the first 100 issues', () => {
  const commands = lookups(workflow);
  assert.equal(commands.length, 2, 'failure and recovery must both resolve the existing incident');
  for (const command of commands) {
    const result = runLookup(command, [unrelated, [original]]);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, '652');
  }
});

test('lookup reuses the oldest open incident and excludes matching pull requests and closed issues', () => {
  const pages = [
    [{ number: 1144, title, state: 'open' }, { number: 12, title, state: 'open', pull_request: {} }],
    [{ number: 10, title, state: 'closed' }, original],
  ];
  assert.equal(selectProductionIncident(pages, title), 652);
  assert.equal(selectProductionIncident(pages.reverse(), title), 652);
});

test('both workflow lookups fail before any mutation if a later API page fails', () => {
  for (const command of lookups(workflow)) {
    const result = runLookup(command, [[original]], 1);
    assert.notEqual(result.status, 0);
    assert.equal(result.stdout, '');
  }
});

test('no matching incident returns no number', () => {
  assert.equal(selectProductionIncident([unrelated, []], title), null);
  const result = runLookup(lookups(workflow)[0], [unrelated, []]);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
});

test('malformed pages fail instead of reporting no incident', () => {
  assert.throws(() => selectProductionIncident({ message: 'API failure' }, title));
  assert.throws(() => selectProductionIncident([null], title));
  assert.throws(() => selectProductionIncident([[{ title, state: 'open' }]], title));
  const result = spawnSync(process.execPath, ['scripts/select-production-incident.mjs', title], {
    cwd: root,
    encoding: 'utf8',
    input: '{incomplete',
  });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, '');
});
