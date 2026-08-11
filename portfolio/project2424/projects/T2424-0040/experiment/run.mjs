import { simulatePolicy } from '../src/core.mjs';

export const frozenFixture = Object.freeze({
  threshold: 0.8,
  steps: 6,
  nodes: [
    { id: 'budgeting', prerequisites: [], utility: 2, difficulty: 1 },
    { id: 'time_value', prerequisites: ['budgeting'], utility: 4, difficulty: 1 },
    { id: 'bonds', prerequisites: ['time_value'], utility: 5, difficulty: 1 },
    { id: 'diversification', prerequisites: ['budgeting'], utility: 4, difficulty: 1 },
    { id: 'capm', prerequisites: ['time_value', 'diversification'], utility: 8, difficulty: 1 },
    { id: 'options', prerequisites: ['bonds', 'capm'], utility: 9, difficulty: 1 },
  ],
});

export function runFrozenExperiment() {
  const prerequisiteAware = simulatePolicy(frozenFixture.nodes, {
    policy: 'prerequisite-aware',
    threshold: frozenFixture.threshold,
    steps: frozenFixture.steps,
  });
  const utilityOnlyBaseline = simulatePolicy(frozenFixture.nodes, {
    policy: 'utility-only',
    threshold: frozenFixture.threshold,
    steps: frozenFixture.steps,
  });

  const gates = {
    zeroPrerequisiteViolations: prerequisiteAware.violatingSelections === 0,
    completesFrozenGraph: prerequisiteAware.completedConcepts === frozenFixture.nodes.length,
    baselineHasAtLeastFourViolatingSelections: utilityOnlyBaseline.violatingSelections >= 4,
  };

  return {
    schemaVersion: 1,
    projectId: 'T2424-0040',
    experiment: 'controlled-synthetic-learning-graph-ordering',
    fixture: frozenFixture,
    claim: {
      prerequisiteAwareMaxViolatingSelections: 0,
      utilityOnlyMinViolatingSelections: 4,
    },
    prerequisiteAware,
    utilityOnlyBaseline,
    gates,
    verdict: Object.values(gates).every(Boolean)
      ? 'PASS_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS'
      : 'FAIL_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS',
    boundary: {
      syntheticFixture: true,
      realLearners: false,
      learningEffectiveness: false,
      financeKnowledgeValidity: false,
      researchComplete: false,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runFrozenExperiment(), null, 2)}\n`);
}
