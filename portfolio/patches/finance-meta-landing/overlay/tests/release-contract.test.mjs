import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

async function read(path) {
  return readFile(join(projectRoot, path), 'utf8');
}

async function collectSource(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const chunks = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      chunks.push(await collectSource(path));
      continue;
    }
    if (['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name))) {
      chunks.push(await readFile(path, 'utf8'));
    }
  }

  return chunks.join('\n');
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
  const source = await collectSource(join(projectRoot, 'src'));

  assert.match(source, /FinanceMeta/i);
  for (const pathway of ['Learn', 'Research', 'Build', 'Publish', 'Compete', 'Contribute', 'Lead']) {
    assert.match(source, new RegExp(`\\b${pathway}\\b`, 'i'), `${pathway} pathway is missing`);
  }
  assert.match(source, /mailto:financeforalledu@gmail\.com/i);
});

test('release configuration is present and executable', async () => {
  const packageJson = JSON.parse(await read('package.json'));

  assert.equal(packageJson.name, 'financemeta-landing');
  for (const script of ['typecheck', 'audit:prod', 'test', 'build', 'test:dist', 'ci', 'test:e2e']) {
    assert.equal(typeof packageJson.scripts?.[script], 'string', `missing npm script: ${script}`);
  }

  for (const path of [
    'index.html',
    'tsconfig.json',
    'playwright.config.ts',
    'src/main.tsx',
    'src/index.css',
  ]) {
    const file = await stat(join(projectRoot, path));
    assert.equal(file.isFile(), true, `${path} must be a file`);
  }
});
