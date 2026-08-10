import test from 'node:test';
import assert from 'node:assert/strict';

import {
  escapeHtml,
  renderPortfolioHtml,
  renderPortfolioJson,
  sortProjectRecords,
  summarizePortfolio,
} from '../portfolio/project2424/projects/T2424-0049/src/core.mjs';

const records = [
  {
    id: 'T2424-0099',
    name: 'Blocked Example',
    type: 'research',
    state: 'BLOCKED',
    artifact: 'portfolio/project2424/projects/T2424-0099/',
    verdict: 'BLOCKED',
    claimBoundary: 'No result claim.',
  },
  {
    id: 'T2424-0002',
    name: 'Tested Example',
    type: 'tool',
    state: 'MERGED_TESTED',
    artifact: 'portfolio/project2424/projects/T2424-0002/',
    verdict: 'TESTED_TOOL',
    claimBoundary: 'Local deterministic tool only.',
    exactHead: 'abcdef1',
    ciRun: '12345',
  },
  {
    id: 'T2424-0001',
    name: 'Negative Example',
    type: 'experiment',
    state: 'NEGATIVE_OR_INCONCLUSIVE',
    artifact: 'https://example.com/evidence',
    verdict: 'NEGATIVE',
    claimBoundary: 'The predeclared gate failed.',
  },
];

test('HTML escaping blocks supplied markup from becoming executable content', () => {
  assert.equal(escapeHtml('<script>alert("x")</script>'), '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
  const html = renderPortfolioHtml([{ ...records[1], name: '<img src=x onerror=alert(1)>' }]);
  assert.equal(html.includes('<img src=x onerror=alert(1)>'), false);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});

test('summary never infers certified completion from merged/tested state', () => {
  const summary = summarizePortfolio(records);
  assert.equal(summary.total, 3);
  assert.equal(summary.byState.MERGED_TESTED, 1);
  assert.equal(summary.certifiedComplete, 0);
});

test('certified count changes only when explicitly supplied', () => {
  const summary = summarizePortfolio([{ ...records[1], certifiedComplete: true }]);
  assert.equal(summary.certifiedComplete, 1);
});

test('sorting is deterministic and state-aware', () => {
  assert.deepEqual(sortProjectRecords(records).map((record) => record.id), [
    'T2424-0002',
    'T2424-0001',
    'T2424-0099',
  ]);
});

test('renderers retain evidence identity and claim boundaries', () => {
  const html = renderPortfolioHtml(records);
  const json = JSON.parse(renderPortfolioJson(records));
  assert.ok(html.includes('/portfolio/project2424/projects/T2424-0002/'));
  assert.ok(html.includes('abcdef1'));
  assert.ok(html.includes('The predeclared gate failed.'));
  assert.equal(json.projects[0].id, 'T2424-0002');
  assert.equal(json.projects[0].ciRun, '12345');
});

test('invalid states and ungrounded artifact strings fail closed', () => {
  assert.throws(() => renderPortfolioJson([{ ...records[0], state: 'COMPLETE' }]), /state must be one of/);
  assert.throws(() => renderPortfolioJson([{ ...records[0], artifact: 'somewhere/maybe' }]), /artifact must be a portfolio path or explicit URL/);
});
