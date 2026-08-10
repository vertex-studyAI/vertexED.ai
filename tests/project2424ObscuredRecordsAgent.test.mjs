import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildDecisionLedger,
  evidenceProfile,
  freshnessScore,
  reportingBlockers,
  scoreLead
} from '../portfolio/project2424/projects/T2424-0038/src/core.mjs';

const baseLead = {
  id: 'lead-a',
  title: 'Evidence-backed lead',
  claim: 'A bounded factual claim.',
  novelty: 0.6,
  impact: 0.6,
  risk: 0.4,
  ageHours: 12,
  sources: [
    { publisher: 'official.example', primary: true, sourceType: 'official', evidence: 0.95 },
    { publisher: 'wire.example', sourceType: 'wire', evidence: 0.8 }
  ]
};

test('high-risk single-source claims fail closed', () => {
  const lead = {
    ...baseLead,
    risk: 0.9,
    sources: [{ publisher: 'tip.example', sourceType: 'anonymous-tip', evidence: 0.7 }]
  };
  const blockers = reportingBlockers(lead);
  assert.ok(blockers.some((item) => item.includes('three independent publishers')));
  assert.ok(blockers.some((item) => item.includes('primary source')));
  assert.equal(scoreLead(lead).decision, 'HOLD_FOR_VERIFICATION');
});

test('duplicate outlets do not masquerade as independent corroboration', () => {
  const duplicated = {
    ...baseLead,
    sources: [
      { publisher: 'same.example', primary: true, sourceType: 'official', evidence: 0.9 },
      { publisher: 'same.example', sourceType: 'analysis', evidence: 0.9 },
      { publisher: 'same.example', sourceType: 'wire', evidence: 0.9 }
    ]
  };
  const diverse = {
    ...baseLead,
    sources: [
      { publisher: 'one.example', primary: true, sourceType: 'official', evidence: 0.9 },
      { publisher: 'two.example', sourceType: 'analysis', evidence: 0.9 },
      { publisher: 'three.example', sourceType: 'wire', evidence: 0.9 }
    ]
  };
  assert.equal(evidenceProfile(duplicated).independentPublishers, 1);
  assert.equal(evidenceProfile(diverse).independentPublishers, 3);
  assert.ok(scoreLead(diverse).score > scoreLead(duplicated).score);
});

test('freshness score decays by one half-life', () => {
  assert.equal(freshnessScore(0, 72), 1);
  assert.ok(Math.abs(freshnessScore(72, 72) - 0.5) < 1e-12);
  assert.ok(freshnessScore(144, 72) < freshnessScore(72, 72));
});

test('reportable candidates rank before held leads and ties are deterministic', () => {
  const reportableB = { ...baseLead, id: 'b' };
  const reportableA = { ...baseLead, id: 'a' };
  const held = {
    ...baseLead,
    id: 'held',
    sources: [{ publisher: 'one.example', sourceType: 'tip', evidence: 0.8 }]
  };
  const ledger = buildDecisionLedger([held, reportableB, reportableA]);
  assert.deepEqual(ledger.map((entry) => entry.id), ['a', 'b', 'held']);
  assert.equal(ledger[2].decision, 'HOLD_FOR_VERIFICATION');
});

test('malformed scoring inputs fail closed', () => {
  assert.throws(() => scoreLead({ ...baseLead, risk: 1.2 }), /\[0, 1\]/);
  assert.throws(() => scoreLead({ ...baseLead, sources: [] }), /non-empty array/);
  assert.throws(() => freshnessScore(-1), />= 0/);
});
