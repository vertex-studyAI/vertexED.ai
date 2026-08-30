#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const RUNTIME_PREFIXES = [
  'api/',
  'public/',
  'src/',
  'supabase/',
];

const RUNTIME_FILES = new Set([
  '.npmrc',
  'components.json',
  'index.html',
  'package-lock.json',
  'package.json',
  'scripts/build.mjs',
  'scripts/generate-build-revision.mjs',
  'scripts/generate-study-guide-sitemap.mjs',
  'scripts/publish-neurocad-alpha.mjs',
  'scripts/validate-vercel-functions.mjs',
  'scripts/vercel-ignore-build.mjs',
  'vercel.json',
]);

const ROOT_BUILD_CONFIG = /^(?:eslint\.config\.|postcss\.config\.|tailwind\.config\.|tsconfig(?:\.|$)|vite\.config\.)/;
const DIFF_FILTER = 'ACDMRTUXB';
const GIT_REVISION = /^[0-9a-f]{7,40}$/;
const PREVIOUS_DEPLOY_SHA_ENV = 'VERCEL_GIT_PREVIOUS_SHA';
const DEFAULT_BRANCH_CANDIDATES = ['origin/main', 'main'];
const DEFAULT_BRANCH_FETCH_ARGS = ['fetch', '--no-tags', '--depth=64', 'origin', 'main:refs/remotes/origin/main'];

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

function resolveFirstVercelDeploymentBase({ head, runGit }) {
  for (const candidate of DEFAULT_BRANCH_CANDIDATES) {
    try {
      const mergeBase = String(runGit(['merge-base', head, candidate]) || '').trim().toLowerCase();
      if (GIT_REVISION.test(mergeBase) && mergeBase !== head) return mergeBase;
    } catch {
      // Try the next locally available representation of the default branch.
    }
  }

  // Vercel's first preview clone may not expose origin/main locally. Fetch a
  // bounded main history once, then retry. If that still cannot establish a
  // common ancestor, the caller remains conservative and performs a build.
  try {
    runGit(DEFAULT_BRANCH_FETCH_ARGS);
    const mergeBase = String(runGit(['merge-base', head, 'origin/main']) || '').trim().toLowerCase();
    if (GIT_REVISION.test(mergeBase) && mergeBase !== head) return mergeBase;
  } catch {
    // Fall through to the fail-closed build path.
  }

  throw new Error(`missing ${PREVIOUS_DEPLOY_SHA_ENV} and unable to establish a merge base with main`);
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

export function readChangedFiles({
  head = 'HEAD',
  previousSha = process.env[PREVIOUS_DEPLOY_SHA_ENV],
  isVercel = Boolean(process.env.VERCEL),
  runGit = defaultRunGit,
} = {}) {
  const previous = String(previousSha || '').trim().toLowerCase();
  let base = `${head}^`;

  if (previous) {
    if (!GIT_REVISION.test(previous)) {
      throw new Error(`invalid ${PREVIOUS_DEPLOY_SHA_ENV}: ${previous}`);
    }
    base = previous;
  } else if (isVercel) {
    // VERCEL_GIT_PREVIOUS_SHA is empty on a branch's first deployment. Comparing
    // only HEAD^ can miss runtime changes made earlier on a multi-commit PR, so
    // compare the complete branch delta against main or build conservatively.
    base = resolveFirstVercelDeploymentBase({ head, runGit });
  }

  const output = runGit([
    'diff',
    '--name-only',
    `--diff-filter=${DIFF_FILTER}`,
    base,
    head,
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

    if (changedFiles.length === 0 || shouldBuild(changedFiles)) {
      if (!GIT_REVISION.test(revision)) {
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
    console.log(`[vercel-ignore] Unable to inspect deployment diff (${message}); building conservatively.`);
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
