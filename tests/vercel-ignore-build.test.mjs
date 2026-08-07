import assert from 'node:assert/strict';
import test from 'node:test';

import { findLatestRuntimeRevision, isRuntimeRelevant, shouldBuild } from '../scripts/vercel-ignore-build.mjs';

test('runtime source, API, and database changes continue Vercel builds', () => {
  for (const file of [
    'src/App.tsx',
    'api/_handlers/health.js',
    'public/robots.txt',
    'scripts/generate-study-guide-sitemap.mjs',
    'supabase/migrations/20260805_example.sql',
    'supabase/config.toml',
  ]) {
    assert.equal(isRuntimeRelevant(file), true, file);
  }
});

test('root dependency and build configuration changes continue Vercel builds', () => {
  for (const file of [
    'package.json',
    'package-lock.json',
    'index.html',
    'vercel.json',
    'vite.config.ts',
    'tsconfig.app.json',
    'tailwind.config.ts',
    'postcss.config.js',
    'eslint.config.js',
  ]) {
    assert.equal(isRuntimeRelevant(file), true, file);
  }
});

test('documentation, research, CI, and test-only changes skip Vercel builds', () => {
  for (const file of [
    'docs/PRODUCTION_MONITORING.md',
    'portfolio/financemeta-yel/session.md',
    '.percy/state.json',
    '.github/workflows/ci.yml',
    'tests/example.test.mjs',
    'e2e/smoke.spec.ts',
    'evals/README.md',
  ]) {
    assert.equal(isRuntimeRelevant(file), false, file);
  }
});

test('a mixed commit builds when any runtime-relevant file changed', () => {
  assert.equal(
    shouldBuild([
      'docs/release-notes.md',
      'portfolio/research.md',
      'src/pages/Login.tsx',
    ]),
    true,
  );
});

test('a non-runtime commit is skipped', () => {
  assert.equal(
    shouldBuild([
      'docs/release-notes.md',
      '.percy/task_queue.json',
      'tests/release-contract.test.mjs',
    ]),
    false,
  );
});

test('path normalization handles checkout-style prefixes and separators', () => {
  assert.equal(isRuntimeRelevant('./src/App.tsx'), true);
  assert.equal(isRuntimeRelevant('src\\App.tsx'), true);
  assert.equal(isRuntimeRelevant('./supabase\\migrations\\example.sql'), true);
  assert.equal(isRuntimeRelevant('./docs/README.md'), false);
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
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 1111111111111111111111111111111111111111 ${operationsRevision}`) {
      return '.github/workflows/ci.yml\ndocs/release.md\n';
    }
    if (key === `rev-parse ${runtimeRevision}^1`) return '2222222222222222222222222222222222222222\n';
    if (key === `diff --name-only --diff-filter=ACDMRTUXB 2222222222222222222222222222222222222222 ${runtimeRevision}`) {
      return 'src/pages/Login.tsx\n';
    }
    throw new Error(`unexpected git call: ${key}`);
  };

  assert.equal(findLatestRuntimeRevision({ runGit }), runtimeRevision);
  assert.ok(calls.length >= 5);
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
