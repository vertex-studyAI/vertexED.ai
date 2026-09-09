import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildProvenanceLedger } from '../scripts/generate-study-guide-provenance.mjs';

test('the provenance ledger covers every guide file with a stable content hash', async () => {
  const ledger = await buildProvenanceLedger();
  const persisted = JSON.parse(await readFile('public/study-guides/myp/provenance-ledger.json', 'utf8'));
  assert.deepEqual(persisted, ledger);
  assert.equal(ledger.summary.files, 245);
  assert.equal(new Set(ledger.entries.map((entry) => entry.contentId)).size, ledger.entries.length);
  for (const entry of ledger.entries) {
    const content = await readFile(`public${entry.path}`, 'utf8');
    assert.equal(entry.contentHash, `sha256:${createHash('sha256').update(content).digest('hex')}`);
  }
});

test('no guide can be published without approval, a known license, a source, and a reviewer', async () => {
  const ledger = await buildProvenanceLedger();
  const publishable = ledger.entries.filter((entry) => entry.publicationStatus === 'published');
  for (const entry of publishable) {
    assert.equal(entry.editorialStatus, 'approved');
    assert.notEqual(entry.license, 'unknown');
    assert.ok(entry.source);
    assert.ok(entry.factualReviewer);
    assert.ok(entry.reviewedAt);
  }
  assert.equal(publishable.length, 0);
});

test('risk language produces review flags instead of invented provenance', async () => {
  const ledger = await buildProvenanceLedger();
  assert.ok(ledger.summary.quarantined > 0);
  assert.ok(ledger.entries.some((entry) => entry.riskFlags.includes('verbatim-claim')));
  assert.ok(ledger.entries.every((entry) => entry.author === null && entry.source === null));
});
