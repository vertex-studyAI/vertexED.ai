#!/usr/bin/env node
/**
 * Ensures the api/ directory stays within Vercel Hobby's 12-function limit.
 * Only one top-level route file (the catch-all) may be deployed as a function.
 */
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(__dirname, '..', 'api');

const ALLOWED_TOP_LEVEL = new Set(['[[...path]].js']);

function isUnderscorePath(name) {
  return name.startsWith('_');
}

async function listTopLevelApiFiles() {
  const entries = await readdir(apiDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!/\.(js|ts|mjs)$/.test(entry.name)) continue;
    if (entry.name.endsWith('.backup')) continue;
    files.push(entry.name);
  }

  return files;
}

async function findNestedDeployableHandlers(dir) {
  const offenders = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (isUnderscorePath(entry.name)) continue;
      offenders.push(...await findNestedDeployableHandlers(full));
      continue;
    }
    if (!/\.(js|ts|mjs)$/.test(entry.name)) continue;
    if (entry.name.endsWith('.backup')) continue;
    if (isUnderscorePath(entry.name)) continue;
    if (dir === apiDir) continue;
    offenders.push(path.relative(apiDir, full));
  }

  return offenders;
}

async function main() {
  const topLevel = await listTopLevelApiFiles();
  const unexpectedTop = topLevel.filter((f) => !ALLOWED_TOP_LEVEL.has(f));
  const nested = await findNestedDeployableHandlers(apiDir);

  let failed = false;

  if (unexpectedTop.length > 0) {
    console.error('[vercel] Top-level api files that would become extra Serverless Functions:');
    for (const f of unexpectedTop) console.error(`  - api/${f}`);
    failed = true;
  }

  if (nested.length > 0) {
    console.error('[vercel] Nested api handlers outside underscore folders:');
    for (const f of nested) console.error(`  - api/${f}`);
    failed = true;
  }

  const functionCount = topLevel.filter((f) => ALLOWED_TOP_LEVEL.has(f)).length;
  if (functionCount !== 1) {
    console.error(`[vercel] Expected exactly 1 catch-all function, found ${functionCount}`);
    failed = true;
  }

  if (failed) {
    console.error('[vercel] Fix: move handlers to api/_handlers/ and keep only api/[[...path]].js at top level.');
    process.exit(1);
  }

  console.log(`[vercel] OK: ${functionCount} Serverless Function (Hobby limit: 12)`);
  console.log(`[vercel] Routed endpoints: ${Object.keys((await import('../api/_lib/routes.js')).ROUTES).length}`);
}

main().catch((err) => {
  console.error('[vercel] Validation failed:', err);
  process.exit(1);
});
