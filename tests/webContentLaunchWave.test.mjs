import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const wave = new URL('portfolio/web-launch-wave-20260812/', root);
const financeScript = new URL('apply-financemeta-content-wave.mjs', wave);
const bu1ldScript = new URL('apply-bu1ld-proof-density.mjs', wave);
const bu1ldPeopleScript = new URL('apply-bu1ld-p0-people.mjs', wave);

for (const script of [financeScript, bu1ldScript, bu1ldPeopleScript]) {
  test(`${script.pathname.split('/').at(-1)} parses as JavaScript`, () => {
    const result = spawnSync(process.execPath, ['--check', script.pathname], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
  });
}

test('recovery scripts are pinned to the exact audited target heads', async () => {
  const finance = await readFile(financeScript, 'utf8');
  const bu1ld = await readFile(bu1ldScript, 'utf8');
  const bu1ldPeople = await readFile(bu1ldPeopleScript, 'utf8');

  assert.match(finance, /f9265ce6ae94bf01048271ecfcf09d5be7059604/);
  assert.match(finance, /fbdd503223edc5b1780509720391083f485a4a85/);
  assert.match(bu1ld, /daa80c1124b2a6d7d09b7669e04d29e50cffcbbe/);
  assert.match(bu1ldPeople, /daa80c1124b2a6d7d09b7669e04d29e50cffcbbe/);
});

test('FinanceMeta content recovery removes unsupported public scale and partner promotion', async () => {
  const finance = await readFile(financeScript, 'utf8');
  assert.match(finance, /FinanceMeta/);
  assert.match(finance, /Learn finance\. Research it\. Build with it\./);
  assert.match(finance, /No public 25,000\+ impact, 15\+ country, 50\+ member/);
  assert.match(finance, /Jane Street/);
  assert.match(finance, /partner\/collaborator claim/);
  assert.match(finance, /primary source/);
});

test('Bu1LD recovery downgrades the lab publication overclaim and adds bounded evidence', async () => {
  const bu1ld = await readFile(bu1ldScript, 'utf8');
  const people = await readFile(bu1ldPeopleScript, 'utf8');
  assert.match(bu1ld, /research divisions in the platform/);
  assert.match(bu1ld, /Show the artifact\. Show the boundary\./);
  assert.match(bu1ld, /Not allowed: public benchmark superiority/);
  assert.match(bu1ld, /Not allowed: real-market validation/);
  assert.match(people, /Removed generic Lab contributors card/);
});
