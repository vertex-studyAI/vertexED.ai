import assert from 'node:assert/strict';
import test from 'node:test';

import { isRuntimeRelevant, shouldBuild } from '../scripts/vercel-ignore-build.mjs';

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
