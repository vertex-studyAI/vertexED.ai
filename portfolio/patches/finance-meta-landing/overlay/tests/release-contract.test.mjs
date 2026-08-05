import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

async function read(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
}

test('React mounts into the public root and loads the source stylesheet', async () => {
  const [html, main] = await Promise.all([
    read('index.html'),
    read('src/main.tsx'),
  ]);

  assert.match(html, /id=["']root["']/);
  assert.doesNotMatch(html, /href=["']\/index\.css["']/);
  assert.match(main, /createRoot\s*\(/);
  assert.match(main, /getElementById\s*\(\s*["']root["']\s*\)/);
  assert.match(main, /\.render\s*\(/);
  assert.match(main, /import\s+["']\.\/index\.css["']/);
});

test('landing source presents the FinanceMeta pathways and contact route', async () => {
  const sourceFiles = await Promise.all([
    read('src/main.tsx'),
    read('src/App.tsx').catch(() => ''),
  ]);
  const source = sourceFiles.join('\n');

  assert.match(source, /FinanceMeta/i);
  for (const pathway of ['Learn', 'Research', 'Build', 'Publish', 'Compete', 'Contribute', 'Lead']) {
    assert.match(source, new RegExp(`\\b${pathway}\\b`, 'i'), `${pathway} pathway is missing`);
  }
  assert.match(source, /mailto:/i);
});

test('release configuration is present and executable', async () => {
  const packageJson = JSON.parse(await read('package.json'));

  assert.equal(packageJson.name, 'finance-meta-landing');
  for (const script of ['typecheck', 'audit:prod', 'test', 'build', 'test:dist', 'ci', 'test:e2e']) {
    assert.equal(typeof packageJson.scripts?.[script], 'string', `missing npm script: ${script}`);
  }

  for (const path of [
    'tailwind.config.js',
    'postcss.config.js',
    'tsconfig.json',
    'playwright.config.ts',
    'src/index.css',
  ]) {
    const file = await stat(new URL(`../../${path}`, import.meta.url));
    assert.equal(file.isFile(), true, `${path} must be a file`);
  }
});
