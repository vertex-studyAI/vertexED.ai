import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { extractInitialAssetPaths, measureBuild } from '../scripts/check-build-performance.mjs';

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
  const [app, layout, chat, viteConfig] = await Promise.all([
    readFile(new URL('../src/app/App.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/layout/SiteLayout.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/chat/GlobalChatPanel.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../vite.config.ts', import.meta.url), 'utf8'),
  ]);
  assert.match(app, /const Features = lazy\(\(\) => import\("@\/pages\/Features"\)\)/);
  assert.doesNotMatch(app, /import Features from/);
  assert.match(layout, /const GlobalChatPanel = lazy\(\(\) => import\("@\/components\/chat\/GlobalChatPanel"\)\)/);
  assert.match(layout, /shouldLoadGlobalChat &&/);
  assert.match(chat, /const ApexMessageList = lazy\(\(\) => import\("@\/components\/chat\/ApexMessageList"\)\)/);
  assert.doesNotMatch(viteConfig, /return 'chat-markdown'/);
});
