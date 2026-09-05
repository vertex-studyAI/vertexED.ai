import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const project = new URL('../portfolio/new-projects/t2424-1863-local-diffusion-operator/', import.meta.url);
const read = (path) => readFile(new URL(path, project), 'utf8');

const section = (markdown, heading, nextHeading) => {
  const start = markdown.indexOf(heading);
  assert.notEqual(start, -1, `missing section: ${heading}`);
  const end = nextHeading ? markdown.indexOf(nextHeading, start + heading.length) : markdown.length;
  assert.notEqual(end, -1, `missing section boundary: ${nextHeading}`);
  return markdown.slice(start, end);
};

test('T2424-1863 negative verdict is explicit in every release-critical manuscript section', async () => {
  const manuscript = await read('paper/MANUSCRIPT.md');
  const abstract = section(manuscript, '## Abstract', '## 1.');
  const primaryResults = section(manuscript, '### 4.1 Primary preregistered 10-seed test', '### 4.2');
  const conclusion = section(manuscript, '## 10. Conclusion', '## Release status');

  assert.match(abstract, /primary hypothesis therefore failed/i);
  assert.match(primaryResults, /preregistered hypothesis therefore fails/i);
  assert.match(conclusion, /failed its >75% improvement criterion/i);

  assert.match(manuscript, /seeds `0\.\.9` as the literal primary preregistered test/);
  assert.match(manuscript, /20-seed run as an expanded retained execution\/reproduction/);
  assert.match(manuscript, /not a replacement for the literal 10-seed preregistration/);

  const forbiddenAffirmativeClaims = [
    /primary hypothesis (?:passed|was supported)/i,
    /we (?:demonstrate|show|establish) (?:that )?.*(?:outperform|superior)/i,
    /statistically significant improvement/i,
    /generalizes? to real (?:PDE|datasets?)/i,
    /production[- ]ready/i,
  ];
  for (const pattern of forbiddenAffirmativeClaims) {
    assert.doesNotMatch(manuscript, pattern);
  }
});

test('manuscript expanded metrics are derived from retained uncertainty evidence', async () => {
  const [manuscript, uncertaintyText] = await Promise.all([
    read('paper/MANUSCRIPT.md'),
    read('paper/evidence/uncertainty_metrics.json'),
  ]);
  const uncertainty = JSON.parse(uncertaintyText);
  const metric = uncertainty.conditions.diffusion.relative_improvement;
  const control = uncertainty.conditions.zero_diffusion.relative_improvement;

  assert.match(manuscript, new RegExp(`${(metric.mean * 100).toFixed(4)}%`));
  assert.match(manuscript, new RegExp(`${(metric.min * 100).toFixed(4)}%–${(metric.max * 100).toFixed(4)}%`));
  assert.match(manuscript, new RegExp(`${(metric.sample_sd * 100).toFixed(4)} percentage points`));
  assert.match(manuscript, new RegExp(`${(control.mean * 100).toFixed(4)}%`));
  assert.ok(metric.max < 0.75, 'retained diffusion maximum must remain below the frozen gate');
});

test('evidence figure is accessible, complete, and explicit about the failed gate', async () => {
  const [svg, matrix] = await Promise.all([
    read('paper/evidence/per_seed_relative_improvement.svg'),
    read('paper/CLAIM_EVIDENCE_MATRIX.md'),
  ]);

  assert.match(svg, /role="img" aria-labelledby="title desc"/);
  assert.match(svg, /<title id="title">T2424-1863 per-seed relative improvement<\/title>/);
  assert.match(svg, /Every diffusion result is below the frozen greater-than-75-percent gate/);
  assert.equal((svg.match(/<circle [^>]+><title>/g) ?? []).length, 40);
  assert.equal((svg.match(/Diffusion seed \d+:/g) ?? []).length, 20);
  assert.equal((svg.match(/Zero-diffusion control seed \d+:/g) ?? []).length, 20);

  assert.match(matrix, /deterministic point-level figure reconciled against all committed raw seeds and the frozen threshold/);
  assert.match(matrix, /NOT PREPRINT_READY/);
});
