import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), 'utf8');
const [html, source, css, packageJson] = await Promise.all([
  read('index.html'),
  read('src/main.tsx'),
  read('src/index.css'),
  read('package.json'),
]);

test('mounts the real stylesheet', () => {
  assert.match(source, /import\s+["']\.\/index\.css["']/);
  assert.doesNotMatch(html, /href=["']\/index\.css["']/);
});

test('mounts React into the public root', () => {
  assert.match(html, /id=["']root["']/);
  assert.match(source, /createRoot\s*\(/);
  assert.match(source, /getElementById\s*\(\s*["']root["']\s*\)/);
  assert.match(source, /\.render\s*\(/);
});

test('shows the FinanceMeta pathways, programs, and contact route', () => {
  assert.match(source, /FinanceMeta/i);
  for (const pathway of ['Learn', 'Research', 'Build', 'Publish', 'Compete', 'Contribute', 'Lead']) {
    assert.match(source, new RegExp(`\\b${pathway}\\b`, 'i'), `${pathway} pathway is missing`);
  }
  for (const program of ['Axiom Pathways', 'FinanceMeta Research', 'Global Fellowship', 'Partnership Network']) {
    assert.match(source, new RegExp(program, 'i'), `${program} is missing`);
  }
  assert.match(source, /mailto:financeforalledu@gmail\.com/i);
});

test('removes the stale particle-heavy dependency surface', () => {
  assert.doesNotMatch(source, /tsparticles|<Particles|particlesInit/i);
  assert.doesNotMatch(packageJson, /tsparticles/i);
});

test('includes accessibility, theme, and responsive safeguards', () => {
  assert.match(source, /Skip to content/i);
  assert.match(source, /aria-label/i);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(source, /localStorage/i);
});
