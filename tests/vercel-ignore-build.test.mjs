import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findLatestRuntimeRevision,
  isRuntimeRelevant,
  readChangedFiles,
  shouldBuild,
} from '../scripts/vercel-ignore-build.mjs';

test('runtime source, API, database, and production build-script changes continue Vercel builds', () => {
  for (const file of [
    'src/App.tsx',
    'api/_handlers/health.js',
    'public/robots.txt',
    'supabase/migrations/20260805_example.sql',
    'supabase/config.toml',
    'scripts/build.mjs',
    'scripts/generate-build-revision.mjs',
    'scripts/generate-study-guide-sitemap.mjs',
    'scripts/publish-neurocad-alpha.mjs',
    'scripts/validate-vercel-functions.mjs',
    'scripts/vercel-ignore-build.mjs',
  ]) assert.equal(isRuntimeRelevant(file), true, file);
});

test('operator, QA, and maintenance scripts do not consume VertexED Vercel builds', () => {
  for (const file of [
    'scripts/percy-state-doctor.mjs',
    'scripts/portfolio-command-status.mjs',
    'scripts/smoke-deploy.mjs',
    'scripts/neurocad-alpha-openscad-qa.mjs',
    'scripts/indexnow.mjs',
    'scripts/ping-sitemaps.mjs',
  ]) assert.equal(isRuntimeRelevant(file), false, file);
});

test('root dependency and build configuration changes continue Vercel builds', () => {
  for (const file of ['package.json','package-lock.json','index.html','vercel.json','vite.config.ts','tsconfig.app.json','tailwind.config.ts','postcss.config.js','eslint.config.js']) assert.equal(isRuntimeRelevant(file), true, file);
});

test('documentation, research, CI, and test-only changes skip Vercel builds', () => {
  for (const file of ['docs/PRODUCTION_MONITORING.md','portfolio/financemeta-yel/session.md','.percy/state.json','.github/workflows/ci.yml','tests/example.test.mjs','e2e/smoke.spec.ts','evals/README.md']) assert.equal(isRuntimeRelevant(file), false, file);
});

test('a mixed commit builds when any runtime-relevant file changed', () => assert.equal(shouldBuild(['docs/release-notes.md','portfolio/research.md','src/pages/Login.tsx']), true));
test('a non-runtime commit is skipped', () => assert.equal(shouldBuild(['docs/release-notes.md','.percy/task_queue.json','tests/release-contract.test.mjs','scripts/percy-state-doctor.mjs']), false));

test('path normalization handles checkout-style prefixes and separators', () => {
  assert.equal(isRuntimeRelevant('./src/App.tsx'), true);
  assert.equal(isRuntimeRelevant('src\\App.tsx'), true);
  assert.equal(isRuntimeRelevant('./supabase\\migrations\\example.sql'), true);
  assert.equal(isRuntimeRelevant('./docs/README.md'), false);
});

test('deployment diff uses the previous successful Vercel SHA when available', () => {
  const previousSha = '1111111111111111111111111111111111111111';
  const calls = [];
  const runGit = (args) => { calls.push(args); return 'tests/release-contract.test.mjs\nvercel.json\n'; };
  assert.deepEqual(readChangedFiles({ previousSha, runGit }), ['tests/release-contract.test.mjs', 'vercel.json']);
  assert.deepEqual(calls, [['diff','--name-only','--diff-filter=ACDMRTUXB',previousSha,'HEAD']]);
});

test('first Vercel preview compares the whole branch against the main merge base', () => {
  const mergeBase = '6666666666666666666666666666666666666666';
  const calls = [];
  const runGit = (args) => {
    calls.push(args);
    const key = args.join(' ');
    if (key === 'merge-base HEAD origin/main') return `${mergeBase}\n`;
    if (key === `diff --name-only --diff-filter=ACDMRTUXB ${mergeBase} HEAD`) {
      return 'scripts/vercel-ignore-build.mjs\ntests/vercel-ignore-build.test.mjs\n';
    }
    throw new Error(`unexpected git call: ${key}`);
  };
  assert.deepEqual(
    readChangedFiles({ previousSha: '', isVercel: true, runGit }),
    ['scripts/vercel-ignore-build.mjs', 'tests/vercel-ignore-build.test.mjs'],
  );
  assert.deepEqual(calls, [
    ['merge-base','HEAD','origin/main'],
    ['diff','--name-only','--diff-filter=ACDMRTUXB',mergeBase,'HEAD'],
  ]);
});

test('first Vercel preview fetches bounded main history when the clone lacks a base ref', () => {
  const mergeBase = '7777777777777777777777777777777777777777';
  let fetched = false;
  const calls = [];
  const runGit = (args) => {
    calls.push(args);
    const key = args.join(' ');
    if (key === 'fetch --no-tags --depth=64 origin main:refs/remotes/origin/main') {
      fetched = true;
      return '';
    }
    if (key === 'merge-base HEAD origin/main' && fetched) return `${mergeBase}\n`;
    if (key === 'merge-base HEAD origin/main' || key === 'merge-base HEAD main') {
      throw new Error('ref unavailable in initial clone');
    }
    if (key === `diff --name-only --diff-filter=ACDMRTUXB ${mergeBase} HEAD`) {
      return '.github/workflows/research.yml\nportfolio/project2424/manifest.json\n';
    }
    throw new Error(`unexpected git call: ${key}`);
  };

  assert.deepEqual(
    readChangedFiles({ previousSha: '', isVercel: true, runGit }),
    ['.github/workflows/research.yml', 'portfolio/project2424/manifest.json'],
  );
  assert.ok(calls.some((args) => args[0] === 'fetch'));
});

test('first Vercel preview fails closed when no safe branch base is available', () => {
  const runGit = () => { throw new Error('ref unavailable'); };
  assert.throws(
    () => readChangedFiles({ previousSha: '', isVercel: true, runGit }),
    /unable to establish a merge base with main/,
  );
});

test('deployment diff falls back to the previous commit outside Vercel', () => {
  const calls = [];
  const runGit = (args) => { calls.push(args); return 'docs/release.md\n'; };
  assert.deepEqual(readChangedFiles({ previousSha: '', isVercel: false, runGit }), ['docs/release.md']);
  assert.deepEqual(calls, [['diff','--name-only','--diff-filter=ACDMRTUXB','HEAD^','HEAD']]);
});

test('deployment diff rejects a malformed Vercel previous SHA', () => {
  assert.throws(() => readChangedFiles({ previousSha: 'not-a-sha', runGit: () => '' }), /invalid VERCEL_GIT_PREVIOUS_SHA/);
});

test('latest runtime revision skips newer operations-only commits', () => {
  const operationsRevision = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const runtimeRevision = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const calls = [];
  const runGit = (args) => {
    calls.push(args);
    const key = args.join(' ');
    if (key === 'rev-list --first-parent HEAD') return `${operationsRevision}\n${runtimeRevision}\n`;
    if (key === `rev-parse ${operationsRevision}^1`) return '1111111111111111111111111111111111111111\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 1111111111111111111111111111111111111111 ${operationsRevision}`) return '.github/workflows/ci.yml\ndocs/release.md\n';
    if (key === `rev-parse ${runtimeRevision}^1`) return '2222222222222222222222222222222222222222\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 2222222222222222222222222222222222222222 ${runtimeRevision}`) return 'src/pages/Login.tsx\n';
    throw new Error(`unexpected git call: ${key}`);
  };
  assert.equal(findLatestRuntimeRevision({ runGit }), runtimeRevision);
  assert.ok(calls.length >= 5);
});

test('latest runtime revision skips operator-script-only commits', () => {
  const operationsRevision = 'dddddddddddddddddddddddddddddddddddddddd';
  const runtimeRevision = 'eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
  const runGit = (args) => {
    const key = args.join(' ');
    if (key === 'rev-list --first-parent HEAD') return `${operationsRevision}\n${runtimeRevision}\n`;
    if (key === `rev-parse ${operationsRevision}^1`) return '4444444444444444444444444444444444444444\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 4444444444444444444444444444444444444444 ${operationsRevision}`) return 'scripts/percy-state-doctor.mjs\nscripts/portfolio-command-status.mjs\n';
    if (key === `rev-parse ${runtimeRevision}^1`) return '5555555555555555555555555555555555555555\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 5555555555555555555555555555555555555555 ${runtimeRevision}`) return 'api/_handlers/health.js\n';
    throw new Error(`unexpected git call: ${key}`);
  };
  assert.equal(findLatestRuntimeRevision({ runGit }), runtimeRevision);
});

test('latest runtime revision treats an unclassifiable empty commit conservatively', () => {
  const revision = 'cccccccccccccccccccccccccccccccccccccccc';
  const runGit = (args) => {
    const key = args.join(' ');
    if (key === 'rev-list --first-parent HEAD') return `${revision}\n`;
    if (key === `rev-parse ${revision}^1`) return '3333333333333333333333333333333333333333\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 3333333333333333333333333333333333333333 ${revision}`) return '';
    throw new Error(`unexpected git call: ${key}`);
  };
  assert.equal(findLatestRuntimeRevision({ runGit }), revision);
});
