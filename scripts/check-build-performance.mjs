#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function extractInitialAssetPaths(html) {
  const paths = new Set();
  const tagPattern = /<(?:script|link)\b[^>]*>/gi;
  for (const tag of html.match(tagPattern) ?? []) {
    const isInitial = /<script\b/i.test(tag) && /\btype=["']module["']/i.test(tag)
      || /\brel=["'](?:modulepreload|stylesheet)["']/i.test(tag);
    if (!isInitial) continue;
    const match = tag.match(/\b(?:src|href)=["']([^"']+)["']/i);
    if (!match || !match[1].startsWith('/assets/')) continue;
    paths.add(match[1]);
  }
  return [...paths].sort();
}

async function measureFile(distDir, publicPath) {
  const absolute = resolve(distDir, `.${publicPath}`);
  if (!absolute.startsWith(`${resolve(distDir)}/`)) {
    throw new Error(`Refusing asset outside dist: ${publicPath}`);
  }
  const body = await readFile(absolute);
  return {
    path: publicPath,
    type: extname(publicPath).slice(1),
    rawBytes: body.length,
    gzipBytes: gzipSync(body, { level: 9 }).length,
  };
}

export async function measureBuild({ distDir, html, budgets }) {
  const initial = await Promise.all(
    extractInitialAssetPaths(html).map((asset) => measureFile(distDir, asset)),
  );
  const assetNames = await readdir(resolve(distDir, 'assets'));
  const allJavaScript = await Promise.all(
    assetNames.filter((name) => name.endsWith('.js')).map((name) => measureFile(distDir, `/assets/${name}`)),
  );
  const sum = (items) => items.reduce((total, item) => total + item.gzipBytes, 0);
  const initialJavaScript = initial.filter((item) => item.type === 'js');
  const initialCss = initial.filter((item) => item.type === 'css');
  const metrics = {
    initialJavaScriptGzipBytes: sum(initialJavaScript),
    initialCssGzipBytes: sum(initialCss),
    largestJavaScriptGzipBytes: Math.max(0, ...allJavaScript.map((item) => item.gzipBytes)),
    totalJavaScriptGzipBytes: sum(allJavaScript),
  };
  const violations = Object.entries(budgets)
    .filter(([name, limit]) => !Number.isFinite(limit) || metrics[name] > limit)
    .map(([name, limit]) => ({ name, actual: metrics[name], limit }));
  return { metrics, budgets, initialAssets: initial, violations };
}

export async function checkBuildPerformance({
  distDir = resolve(root, 'dist'),
  budgetPath = resolve(root, 'performance-budgets.json'),
} = {}) {
  const [html, configSource] = await Promise.all([
    readFile(resolve(distDir, 'index.html'), 'utf8'),
    readFile(budgetPath, 'utf8'),
  ]);
  const config = JSON.parse(configSource);
  if (config.version !== 1 || !config.budgets || typeof config.budgets !== 'object') {
    throw new Error('performance-budgets.json must contain version 1 budgets');
  }
  return measureBuild({ distDir, html, budgets: config.budgets });
}

async function main() {
  const result = await checkBuildPerformance();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.violations.length > 0) {
    process.stderr.write(`[performance] ${result.violations.length} bundle budget violation(s)\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write('[performance] PASS: built assets remain within frozen gzip budgets\n');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main();
}
