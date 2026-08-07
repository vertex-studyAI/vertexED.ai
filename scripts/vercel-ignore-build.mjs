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
const DIFF_FILTER = 'ACDMRTUXB';

function normalizePath(filePath) {
  return filePath.trim().replace(/^\.\//, '').replaceAll('\\', '/');
}

function splitPaths(output) {
  return String(output || '')
    .split('\n')
    .map(normalizePath)
    .filter(Boolean);
}

function defaultRunGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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
  const output = defaultRunGit([
    'diff',
    '--name-only',
    `--diff-filter=${DIFF_FILTER}`,
    'HEAD^',
    'HEAD',
  ]);
  return splitPaths(output);
}

export function findLatestRuntimeRevision({ head = 'HEAD', runGit = defaultRunGit } = {}) {
  const revisions = String(runGit(['rev-list', '--first-parent', head]) || '')
    .split('\n')
    .map((revision) => revision.trim().toLowerCase())
    .filter(Boolean);

  if (revisions.length === 0) {
    throw new Error(`no commits found from ${head}`);
  }

  for (const revision of revisions) {
    let changedFiles = [];
    try {
      const parent = String(runGit(['rev-parse', `${revision}^1`]) || '').trim();
      changedFiles = splitPaths(runGit([
        'diff',
        '--name-only',
        `--diff-filter=${DIFF_FILTER}`,
        parent,
        revision,
      ]));
    } catch {
      changedFiles = splitPaths(runGit(['ls-tree', '-r', '--name-only', revision]));
    }

    // Match the deployment guard's fail-closed behavior: if a commit cannot be
    // classified from changed files, assume it was build-relevant.
    if (changedFiles.length === 0 || shouldBuild(changedFiles)) {
      if (!/^[0-9a-f]{7,40}$/.test(revision)) {
        throw new Error(`invalid Git revision returned by history: ${revision}`);
      }
      return revision;
    }
  }

  throw new Error(`no deploy-relevant commit found from ${head}`);
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
  if (process.argv.includes('--print-latest-runtime-revision')) {
    try {
      console.log(findLatestRuntimeRevision());
    } catch (error) {
      console.error(`[vercel-ignore] Unable to identify latest runtime revision: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    }
  } else {
    process.exitCode = run();
  }
}
