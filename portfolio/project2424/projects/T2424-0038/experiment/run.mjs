import { buildDecisionLedger } from '../src/core.mjs';

const leads = [
  {
    id: 'orbital-contract',
    title: 'Public orbital-compute contract expands',
    claim: 'A public agency materially expanded an orbital-compute programme.',
    novelty: 0.72,
    impact: 0.76,
    risk: 0.42,
    ageHours: 8,
    sources: [
      { publisher: 'agency.gov', primary: true, sourceType: 'official', evidence: 0.98 },
      { publisher: 'wire.example', sourceType: 'wire', evidence: 0.86 },
      { publisher: 'trade.example', sourceType: 'trade-press', evidence: 0.78 }
    ]
  },
  {
    id: 'anonymous-acquisition',
    title: 'Anonymous acquisition rumor',
    claim: 'A private company has been acquired.',
    novelty: 0.9,
    impact: 0.88,
    risk: 0.9,
    ageHours: 2,
    sources: [
      { publisher: 'rumor.example', sourceType: 'anonymous-tip', evidence: 0.38 }
    ]
  },
  {
    id: 'research-release',
    title: 'Research group releases benchmark',
    claim: 'A research group released a new public benchmark.',
    novelty: 0.58,
    impact: 0.55,
    risk: 0.25,
    ageHours: 30,
    sources: [
      { publisher: 'lab.example', primary: true, sourceType: 'research-release', evidence: 0.92 },
      { publisher: 'index.example', sourceType: 'index', evidence: 0.72 }
    ]
  }
];

console.log(JSON.stringify({
  experiment: 'T2424-0038 Obscured Records evidence-gated editorial triage',
  claimBoundary: 'deterministic prioritization aid only; no truth, legal-safety, or publication-autonomy claim',
  ledger: buildDecisionLedger(leads)
}, null, 2));
