import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const workflow = readFileSync(new URL('../.github/workflows/production-health.yml', import.meta.url), 'utf8');

function between(source, start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  assert.notEqual(startIndex, -1, `missing workflow marker: ${start}`);
  assert.notEqual(endIndex, -1, `missing workflow marker: ${end}`);
  return source.slice(startIndex, endIndex);
}

test('production health separates evidence collection from health enforcement', () => {
  const probe = between(
    workflow,
    '      - name: Collect canonical public production health evidence',
    '      - name: Upload probe evidence',
  );

  assert.match(probe, /id: probe/);
  assert.doesNotMatch(probe, /continue-on-error:\s*true/);
  assert.match(probe, /healthy='false'/);
  assert.match(probe, /healthy='true'/);
  assert.match(probe, /echo "healthy=\$\{healthy\}" >> "\$GITHUB_OUTPUT"/);
  assert.doesNotMatch(probe, /\bexit 1\b/);

  assert.match(
    workflow,
    /Open or update production incident[\s\S]*steps\.probe\.outputs\.healthy == 'false'/,
  );
  assert.match(
    workflow,
    /Close recovered production incident[\s\S]*steps\.probe\.outputs\.healthy == 'true'/,
  );
  assert.match(
    workflow,
    /Enforce production health gate[\s\S]*steps\.probe\.outputs\.healthy == 'false'[\s\S]*run: exit 1/,
  );
});

test('workflow changes retrigger their own release-contract test', () => {
  const occurrences = workflow.match(/- 'tests\/productionHealthWorkflow\.test\.mjs'/g) ?? [];
  assert.equal(occurrences.length, 2);
  assert.match(
    workflow,
    /node --test tests\/immutableRevision\.test\.mjs tests\/productionHealthWorkflow\.test\.mjs/,
  );
});
