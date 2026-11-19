import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { checkBuildPerformance, extractInitialAssetPaths, measureBuild } from '../scripts/check-build-performance.mjs';

test('initial asset extraction includes only executable, preload, and stylesheet assets', () => {
  const html = `
    <script type="module" src="/assets/app.js"></script>
    <link rel="modulepreload" href="/assets/vendor.js">
    <link rel="stylesheet" href="/assets/app.css">
    <link rel="icon" href="/assets/icon.png">
    <script src="https://third-party.test/script.js"></script>
  `;
  assert.deepEqual(extractInitialAssetPaths(html), [
    '/assets/app.css',
    '/assets/app.js',
    '/assets/vendor.js',
  ]);
});

test('build performance measurement fails closed when a frozen gzip budget is exceeded', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'vertexed-performance-'));
  await mkdir(join(distDir, 'assets'));
  await writeFile(join(distDir, 'assets', 'app.js'), 'export default "vertexed";'.repeat(50));
  await writeFile(join(distDir, 'assets', 'app.css'), '.vertexed{display:block}'.repeat(20));
  const result = await measureBuild({
    distDir,
    html: '<script type="module" src="/assets/app.js"></script><link rel="stylesheet" href="/assets/app.css">',
    budgets: {
      initialJavaScriptGzipBytes: 1,
      initialCssGzipBytes: 1,
      largestJavaScriptGzipBytes: 1,
      totalJavaScriptGzipBytes: 1,
    },
  });
  assert.equal(result.violations.length, 4);
  assert.ok(result.metrics.initialJavaScriptGzipBytes > 1);
  assert.ok(result.metrics.initialCssGzipBytes > 1);
});

test('landing and tutor renderers retain lazy dependency boundaries', async () => {
  const { readFile } = await import('node:fs/promises');
  const [app, authLanding, layout, chat, viteConfig] = await Promise.all([
    readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/AuthLandingRedirect.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/layout/SiteLayout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/chat/GlobalChatPanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../vite.config.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(app, /const Features = lazy\(\(\) => import\("@\/pages\/Features"\)\)/);
  assert.doesNotMatch(app, /import Features from/);
  assert.match(authLanding, /const Home = lazy\(\(\) => import\("@\/pages\/Home"\)\)/);
  assert.doesNotMatch(authLanding, /import Home from/);
  assert.match(layout, /const GlobalChatPanel = lazy\(\(\) => import\("@\/components\/chat\/GlobalChatPanel"\)\)/);
  assert.match(layout, /shouldLoadGlobalChat &&/);
  assert.match(chat, /const ApexMessageList = lazy\(\(\) => import\("@\/components\/chat\/ApexMessageList"\)\)/);
  assert.doesNotMatch(viteConfig, /return 'chat-markdown'/);
});

test('module workers count toward frozen JavaScript budgets', async () => {
  const distDir = await mkdtemp(join(tmpdir(), 'vertexed-worker-budget-'));
  await mkdir(join(distDir, 'assets'));
  await writeFile(join(distDir, 'assets', 'worker.mjs'), 'export default "worker";');
  const result = await measureBuild({
    distDir,
    html: '<script type="module" src="/assets/worker.mjs"></script>',
    budgets: { totalJavaScriptGzipBytes: 1 },
  });
  assert.ok(result.metrics.initialJavaScriptGzipBytes > 1);
  assert.equal(result.metrics.totalJavaScriptGzipBytes, result.metrics.initialJavaScriptGzipBytes);
  assert.equal(result.metrics.largestJavaScriptGzipBytes, result.metrics.totalJavaScriptGzipBytes);
  assert.equal(result.violations[0].name, 'totalJavaScriptGzipBytes');
});

test('invalid budget definitions cannot produce an empty violation list', async (t) => {
  const distDir = await mkdtemp(join(tmpdir(), 'vertexed-invalid-budget-'));
  t.after(() => rm(distDir, { recursive: true, force: true }));
  await mkdir(join(distDir, 'assets'));
  await writeFile(join(distDir, 'assets', 'app.js'), 'export default 1;');
  const html = '<script type="module" src="/assets/app.js"></script>';
  const invalidBudgets = [
    {},
    [],
    null,
    { initialJavascriptGzipBytes: 1 },
    { initialJavaScriptGzipBytes: 1000, totalJavaScriptGzipByte: 1 },
    { totalJavaScriptGzipBytes: '1000' },
    { totalJavaScriptGzipBytes: -1 },
    { totalJavaScriptGzipBytes: 1.5 },
    { totalJavaScriptGzipBytes: Infinity },
    { totalJavaScriptGzipBytes: Number.MAX_SAFE_INTEGER + 1 },
  ];
  for (const budgets of invalidBudgets) {
    await assert.rejects(measureBuild({ distDir, html, budgets }), /budget/i);
  }
  const zeroBudget = await measureBuild({ distDir, html, budgets: { totalJavaScriptGzipBytes: 0 } });
  assert.equal(zeroBudget.violations.length, 1);
  assert.ok(zeroBudget.violations[0].actual > 0);
});

test('the file-backed release gate requires every frozen metric', async (t) => {
  const distDir = await mkdtemp(join(tmpdir(), 'vertexed-budget-config-'));
  t.after(() => rm(distDir, { recursive: true, force: true }));
  await mkdir(join(distDir, 'assets'));
  await writeFile(join(distDir, 'assets', 'app.js'), 'export default 1;');
  await writeFile(join(distDir, 'assets', 'app.css'), 'body{color:blue}');
  await writeFile(join(distDir, 'index.html'), '<script type="module" src="/assets/app.js"></script><link rel="stylesheet" href="/assets/app.css">');
  const budgetPath = join(distDir, 'budgets.json');
  const budgets = {
    initialJavaScriptGzipBytes: 1000,
    initialCssGzipBytes: 1000,
    largestJavaScriptGzipBytes: 1000,
    totalJavaScriptGzipBytes: 1000,
  };
  for (const missingMetric of Object.keys(budgets)) {
    const incomplete = { ...budgets };
    delete incomplete[missingMetric];
    await writeFile(budgetPath, JSON.stringify({ version: 1, budgets: incomplete }));
    await assert.rejects(checkBuildPerformance({ distDir, budgetPath }), new RegExp(missingMetric));
  }
  await writeFile(budgetPath, JSON.stringify({ version: 1, budgets }));
  const valid = await checkBuildPerformance({ distDir, budgetPath });
  assert.deepEqual(valid.violations, []);
  assert.ok(valid.metrics.initialJavaScriptGzipBytes > 0);
  assert.ok(valid.metrics.initialCssGzipBytes > 0);
});
