import {
  buildEvidenceLedger,
  compileDependencyWaves,
  selectWithinCpuBudget,
  verifyTaskEvidence,
} from '../src/core.mjs';

const manifests = [
  {
    id: 'baseline',
    project: 'synthetic-memory-study',
    claim: 'Establish a reproducible baseline metric.',
    command: 'node experiments/baseline.mjs',
    priority: 'P1',
    dependencies: [],
    expectedArtifacts: ['results/baseline.json'],
    estimatedCpuMinutes: 4,
  },
  {
    id: 'ablation',
    project: 'synthetic-memory-study',
    claim: 'Measure one frozen ablation against the baseline.',
    command: 'node experiments/ablation.mjs',
    priority: 'P2',
    dependencies: ['baseline'],
    expectedArtifacts: ['results/ablation.json'],
    estimatedCpuMinutes: 5,
  },
  {
    id: 'report',
    project: 'synthetic-memory-study',
    claim: 'Package only verified evidence into the final report.',
    command: 'node experiments/report.mjs',
    priority: 'P3',
    dependencies: ['baseline', 'ablation'],
    expectedArtifacts: ['REPORT.md'],
    estimatedCpuMinutes: 2,
  },
];

const waves = compileDependencyWaves(manifests);
const budget = selectWithinCpuBudget(manifests, 12);
const baselineEvidence = verifyTaskEvidence(manifests[0], {
  exitCode: 0,
  artifacts: ['results/baseline.json'],
  checks: [
    { name: 'schema-valid', passed: true },
    { name: 'deterministic-rerun', passed: true },
  ],
});
const blockedReport = verifyTaskEvidence(manifests[2], {
  exitCode: 0,
  artifacts: [],
  checks: [{ name: 'source-results-present', passed: false }],
});

console.log(JSON.stringify({
  project: 'T2424-0046',
  name: 'Auto-Research Foundry',
  claimBoundary: 'deterministic planning/evidence-gating library only; it never executes manifest commands',
  waves: waves.map((wave, index) => ({ wave: index + 1, tasks: wave.map((task) => task.id) })),
  budget: {
    budgetCpuMinutes: budget.budgetCpuMinutes,
    usedCpuMinutes: budget.usedCpuMinutes,
    selected: budget.selected.map((task) => task.id),
    deferred: budget.deferred.map((task) => ({ id: task.id, reason: task.reason })),
  },
  evidenceLedger: buildEvidenceLedger([baselineEvidence, blockedReport]),
}, null, 2));
