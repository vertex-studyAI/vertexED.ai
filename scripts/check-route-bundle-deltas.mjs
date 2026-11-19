#!/usr/bin/env node

import { readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function logicalChunkName(filename) {
  const match = filename.match(/^(.+)-[A-Za-z0-9_-]{8,}\.js$/);
  return match?.[1] ?? null;
}

export async function measureRouteChunks({ distDir, config }) {
  const assetDir = resolve(distDir, 'assets');
  const files = await readdir(assetDir);
  const observed = new Map();
  for (const filename of files.filter((name) => name.endsWith('.js'))) {
    const logicalName = logicalChunkName(filename);
    if (!logicalName || !(logicalName in config.routes)) continue;
    const body = await readFile(resolve(assetDir, filename));
    if (observed.has(logicalName)) throw new Error(`Duplicate route chunk: ${logicalName}`);
    observed.set(logicalName, {
      file: filename,
      gzipBytes: gzipSync(body, { level: 9 }).length,
    });
  }

  const routes = Object.entries(config.routes).map(([name, baselineGzipBytes]) => {
    const asset = observed.get(name) ?? null;
    const gzipBytes = asset?.gzipBytes ?? null;
    const growthBytes = gzipBytes === null ? null : gzipBytes - baselineGzipBytes;
    return {
      name,
      baselineGzipBytes,
      maxGzipBytes: baselineGzipBytes + config.maxGrowthBytes,
      file: asset?.file ?? null,
      gzipBytes,
      growthBytes,
      status: asset === null ? 'MISSING' : growthBytes > config.maxGrowthBytes ? 'OVER_BUDGET' : 'PASS',
    };
  });
  return { baselineSourceSha: config.baselineSourceSha, maxGrowthBytes: config.maxGrowthBytes, routes,
    violations: routes.filter((route) => route.status !== 'PASS') };
}

export async function checkRouteBundleDeltas({
  distDir = resolve('dist'),
  budgetPath = resolve('performance-route-budgets.json'),
} = {}) {
  const config = JSON.parse(await readFile(budgetPath, 'utf8'));
  if (config.version !== 1 || typeof config.baselineSourceSha !== 'string' ||
      !Number.isFinite(config.maxGrowthBytes) || !config.routes || typeof config.routes !== 'object') {
    throw new Error('performance-route-budgets.json must contain a version 1 route baseline');
  }
  return measureRouteChunks({ distDir, config });
}

async function main() {
  const result = await checkRouteBundleDeltas();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.violations.length) {
    process.stderr.write(`[performance] ${result.violations.length} critical-route bundle violation(s)\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write('[performance] PASS: critical route chunks remain within baseline deltas\n');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) await main();
