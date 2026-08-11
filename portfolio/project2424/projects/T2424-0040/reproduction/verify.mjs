import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resultsPath = path.join(projectRoot, 'evidence/results.json');
const manifestPath = path.join(projectRoot, 'evidence/manifest.json');

function fail(message) {
  throw new Error(message);
}

function sameArray(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function independentlyRecomputePolicy(result, policyKey) {
  const nodes = new Map(result.fixture.nodes.map((node) => [node.id, node]));
  const mastery = Object.fromEntries(result.fixture.nodes.map((node) => [node.id, 0]));
  let violatingSelections = 0;
  let unmetPrerequisiteEdges = 0;

  for (const selection of result[policyKey].selections) {
    const node = nodes.get(selection.conceptId);
    if (!node) fail(`${policyKey} selects unknown concept ${selection.conceptId}`);
    const unmet = node.prerequisites.filter(
      (prerequisite) => (mastery[prerequisite] ?? 0) < result.fixture.threshold,
    );
    if (!sameArray(unmet, selection.unmetPrerequisites)) {
      fail(`${policyKey} stored unmet prerequisites disagree at step ${selection.step}`);
    }
    if (unmet.length > 0) violatingSelections += 1;
    unmetPrerequisiteEdges += unmet.length;
    mastery[node.id] = 1;
  }

  const completedConcepts = result.fixture.nodes.filter(
    (node) => mastery[node.id] >= result.fixture.threshold,
  ).length;

  if (violatingSelections !== result[policyKey].violatingSelections) {
    fail(`${policyKey} violatingSelections mismatch`);
  }
  if (unmetPrerequisiteEdges !== result[policyKey].unmetPrerequisiteEdges) {
    fail(`${policyKey} unmetPrerequisiteEdges mismatch`);
  }
  if (completedConcepts !== result[policyKey].completedConcepts) {
    fail(`${policyKey} completedConcepts mismatch`);
  }

  return { violatingSelections, unmetPrerequisiteEdges, completedConcepts };
}

export async function verifyRetainedEvidence() {
  const resultBytes = await fs.readFile(resultsPath);
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const result = JSON.parse(resultBytes.toString('utf8'));
  const actualSha256 = createHash('sha256').update(resultBytes).digest('hex');

  if (manifest.projectId !== 'T2424-0040' || result.projectId !== 'T2424-0040') {
    fail('project identity mismatch');
  }
  if (manifest.result.path !== 'evidence/results.json') fail('unexpected evidence result path');
  if (manifest.result.sha256 !== actualSha256) {
    fail(`retained result SHA-256 mismatch: ${actualSha256}`);
  }
  if (result.boundary?.syntheticFixture !== true) fail('synthetic fixture boundary must remain explicit');
  if (result.boundary?.realLearners !== false) fail('realLearners must remain false');
  if (result.boundary?.learningEffectiveness !== false) fail('learningEffectiveness must remain false');
  if (result.boundary?.researchComplete !== false) fail('researchComplete must remain false');

  const prerequisiteAware = independentlyRecomputePolicy(result, 'prerequisiteAware');
  const utilityOnlyBaseline = independentlyRecomputePolicy(result, 'utilityOnlyBaseline');

  if (prerequisiteAware.violatingSelections > result.claim.prerequisiteAwareMaxViolatingSelections) {
    fail('prerequisite-aware policy violates frozen maximum');
  }
  if (utilityOnlyBaseline.violatingSelections < result.claim.utilityOnlyMinViolatingSelections) {
    fail('utility-only baseline does not meet frozen negative-control minimum');
  }
  if (prerequisiteAware.completedConcepts !== result.fixture.nodes.length) {
    fail('prerequisite-aware policy does not complete the frozen graph');
  }

  const expectedVerdict =
    prerequisiteAware.violatingSelections === 0 &&
    prerequisiteAware.completedConcepts === result.fixture.nodes.length &&
    utilityOnlyBaseline.violatingSelections >= result.claim.utilityOnlyMinViolatingSelections
      ? 'PASS_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS'
      : 'FAIL_CONTROLLED_PREREQUISITE_ORDERING_MECHANICS';
  if (result.verdict !== expectedVerdict) fail('stored verdict disagrees with independently recomputed evidence');

  return {
    projectId: result.projectId,
    resultSha256: actualSha256,
    prerequisiteAware,
    utilityOnlyBaseline,
    verdict: result.verdict,
    boundary: {
      importsSchedulerImplementation: false,
      humanReviewerIndependenceProven: false,
      realLearnerValidation: false,
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  verifyRetainedEvidence()
    .then((summary) => process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`))
    .catch((error) => {
      process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
      process.exitCode = 1;
    });
}
