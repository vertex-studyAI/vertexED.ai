import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const required = [
  'outreach/PROJECT.md',
  'outreach/STATE.md',
  'outreach/QUEUE.md',
  'outreach/DECISIONS.md',
  'outreach/EVIDENCE.md',
  'outreach/CONTACT_LEDGER.csv',
  'outreach/NEUROCAD_PILOT_EVIDENCE_TEMPLATE.md',
];

for (const path of required) {
  test(`outreach control artifact exists and is non-empty: ${path}`, async () => {
    const body = await readFile(path, 'utf8');
    assert.ok(body.trim().length > 0);
  });
}

test('contact ledger has the canonical schema and no duplicate recipient/project pairs', async () => {
  const body = await readFile('outreach/CONTACT_LEDGER.csv', 'utf8');
  const lines = body.trim().split(/\r?\n/);
  assert.equal(
    lines[0],
    'target,email,project,why_them,ask,last_contact,reply_status,next_action,follow_up_date,outcome,evidence,opt_out_or_cooldown',
  );

  const pairs = new Set();
  for (const line of lines.slice(1)) {
    // Current ledger fields before the first quoted free-text column are target,email,project.
    const [target, email, project] = line.split(',', 3);
    assert.ok(target);
    assert.match(email, /@/);
    assert.ok(project);
    const key = `${email.trim().toLowerCase()}::${project.trim().toLowerCase()}`;
    assert.equal(pairs.has(key), false, `duplicate recipient/project pair: ${key}`);
    pairs.add(key);
  }
});

test('state preserves evidence boundaries for current high-risk lanes', async () => {
  const state = await readFile('outreach/STATE.md', 'utf8');
  assert.match(state, /post-publication flagship browser certification has not been directly verified/i);
  assert.match(state, /Zendrop exposes 0 connected stores/i);
  assert.match(state, /No completed external pilot\/test is verified/i);
});
