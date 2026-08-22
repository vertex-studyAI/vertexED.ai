#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readdir, copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveBuildRevision } from './generate-build-revision.mjs';

const DEFAULT_SOURCE_ROOT = resolve('portfolio/project2424/projects/T2424-0037');
const DEFAULT_OUTPUT_ROOT = resolve('public/neurocad');
const ALPHA_ENTRY_IMPORT = 'from "../src/alpha.mjs";';
const PUBLISHED_ENTRY_IMPORT = 'from "./src/alpha.mjs";';
const REVISION_META_PATTERN = /<meta name="neurocad-build-revision" content="[^"]*"\s*\/?>/;
const ARTIFACT_META_PATTERN = /<meta name="neurocad-artifact-revision" content="[^"]*"\s*\/?>/;
const PACKAGER_PATH = fileURLToPath(import.meta.url);

function revisionMeta(revision) {
  return `<meta name="neurocad-build-revision" content="${revision ?? 'local-development'}" />`;
}

function artifactMeta(artifactRevision) {
  return `<meta name="neurocad-artifact-revision" content="${artifactRevision}" />`;
}

async function listFiles(root) {
  const files = [];

  async function visit(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(path);
      } else if (entry.isFile()) {
        files.push(path);
      }
    }
  }

  await visit(root);
  return files;
}

export async function computeNeuroCadArtifactRevision({ sourceRoot = DEFAULT_SOURCE_ROOT } = {}) {
  const hash = createHash('sha256');
  const inputs = [
    ...(await listFiles(resolve(sourceRoot, 'src'))),
    resolve(sourceRoot, 'web', 'app.mjs'),
    resolve(sourceRoot, 'web', 'index.html'),
    resolve(sourceRoot, 'web', 'styles.css'),
    PACKAGER_PATH,
  ];

  for (const path of inputs) {
    const label = path === PACKAGER_PATH
      ? 'packager:scripts/publish-neurocad-alpha.mjs'
      : `source:${relative(sourceRoot, path).replaceAll('\\', '/')}`;
    hash.update(label);
    hash.update('\0');
    hash.update(await readFile(path));
    hash.update('\0');
  }

  return `sha256:${hash.digest('hex')}`;
}

export async function publishNeuroCadAlpha({
  sourceRoot = DEFAULT_SOURCE_ROOT,
  outputRoot = DEFAULT_OUTPUT_ROOT,
  revision = resolveBuildRevision(),
} = {}) {
  const webRoot = resolve(sourceRoot, 'web');
  const srcRoot = resolve(sourceRoot, 'src');
  const artifactRevision = await computeNeuroCadArtifactRevision({ sourceRoot });

  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });

  await cp(srcRoot, resolve(outputRoot, 'src'), { recursive: true });
  await copyFile(resolve(webRoot, 'styles.css'), resolve(outputRoot, 'styles.css'));

  const sourceApp = await readFile(resolve(webRoot, 'app.mjs'), 'utf8');
  if (!sourceApp.includes(ALPHA_ENTRY_IMPORT)) {
    throw new Error('NeuroCAD publish refused: expected canonical ../src/alpha.mjs browser import was not found.');
  }
  const publishedApp = sourceApp.replace(ALPHA_ENTRY_IMPORT, PUBLISHED_ENTRY_IMPORT);
  await writeFile(resolve(outputRoot, 'app.mjs'), publishedApp, 'utf8');

  const sourceIndex = await readFile(resolve(webRoot, 'index.html'), 'utf8');
  let publishedIndex = sourceIndex;
  if (REVISION_META_PATTERN.test(publishedIndex)) {
    publishedIndex = publishedIndex.replace(REVISION_META_PATTERN, revisionMeta(revision));
  } else if (publishedIndex.includes('</head>')) {
    publishedIndex = publishedIndex.replace('</head>', `  ${revisionMeta(revision)}\n</head>`);
  } else {
    throw new Error('NeuroCAD publish refused: canonical browser index has no </head> boundary for revision stamping.');
  }

  if (ARTIFACT_META_PATTERN.test(publishedIndex)) {
    publishedIndex = publishedIndex.replace(ARTIFACT_META_PATTERN, artifactMeta(artifactRevision));
  } else if (publishedIndex.includes('</head>')) {
    publishedIndex = publishedIndex.replace('</head>', `  ${artifactMeta(artifactRevision)}\n</head>`);
  } else {
    throw new Error('NeuroCAD publish refused: canonical browser index has no </head> boundary for artifact stamping.');
  }
  await writeFile(resolve(outputRoot, 'index.html'), publishedIndex, 'utf8');

  const manifest = {
    product: 'NeuroCAD Alpha 0.1',
    route: '/neurocad/',
    revision: revision ?? null,
    artifactRevision,
    source: 'portfolio/project2424/projects/T2424-0037',
    generated: true,
  };
  await writeFile(resolve(outputRoot, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(
    `[neurocad-publish] prepared /neurocad/ artifact ${artifactRevision} from canonical Alpha source at repository revision ${revision ?? 'local-development'}`,
  );
  return manifest;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  publishNeuroCadAlpha().catch((error) => {
    console.error(`[neurocad-publish] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
