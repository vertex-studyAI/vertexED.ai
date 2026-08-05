#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RUNTIME_PREFIXES = [
  'api/',
  'public/',
  'scripts/',
  'src/',
  'supabase/',
];

const RUNTIME_FILES = new Set([
  '.npmrc',
  'components.json',
  'index.html',
  'package-lock.json',
  'package.json',
  'vercel.json',
]);

const ROOT_BUILD_CONFIG = /^(?:eslint\.config\.|postcss\.config\.|tailwind\.config\.|tsconfig(?:\.|$)|vite\.config\.)/;

function normalizePath(filePath) {
  return filePath.trim().replace(/^\.\//, '').replaceAll('\\', '/');
}

export function isRuntimeRelevant(filePath) {
  const normalized = normalizePath(filePath);
  if (!normalized) return false;
  if (RUNTIME_FILES.has(normalized)) return true;
  if (RUNTIME_PREFIXES.some((prefix) => normalized.startsWith(prefix))) return true;
  return !normalized.includes('/') && ROOT_BUILD_CONFIG.test(normalized);
}

export function shouldBuild(changedFiles) {
  return changedFiles.some(isRuntimeRelevant);
}

export function readChangedFiles() {
  const output = execFileSync(
    'git',
    ['diff', '--name-only', '--diff-filter=ACDMRTUXB', 'HEAD^', 'HEAD'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  return output
    .split('\n')
    .map(normalizePath)
    .filter(Boolean);
}

export function run() {
  try {
    const changedFiles = readChangedFiles();

    if (changedFiles.length === 0) {
      console.log('[vercel-ignore] No changed files could be identified; building conservatively.');
      return 1;
    }

    const relevantFiles = changedFiles.filter(isRuntimeRelevant);
    if (relevantFiles.length > 0) {
      console.log('[vercel-ignore] Runtime-relevant changes detected; continuing the build:');
      for (const file of relevantFiles) console.log(`- ${file}`);
      return 1;
    }

    console.log('[vercel-ignore] Documentation, research, test, or operations-only change; skipping the build:');
    for (const file of changedFiles) console.log(`- ${file}`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`[vercel-ignore] Unable to inspect the previous commit (${message}); building conservatively.`);
    return 1;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedPath) {
  process.exitCode = run();
}
