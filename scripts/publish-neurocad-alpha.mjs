#!/usr/bin/env node

import { copyFile, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveBuildRevision } from './generate-build-revision.mjs';

const DEFAULT_SOURCE_ROOT = resolve('portfolio/project2424/projects/T2424-0037');
const DEFAULT_OUTPUT_ROOT = resolve('public/neurocad');
const ALPHA_ENTRY_IMPORT = 'from "../src/alpha.mjs";';
const PUBLISHED_ENTRY_IMPORT = 'from "./src/alpha.mjs";';
const REVISION_META_PATTERN = /<meta name="neurocad-build-revision" content="[^"]*"\s*\/?>/;

function revisionMeta(revision) {
  return `<meta name="neurocad-build-revision" content="${revision ?? 'local-development'}" />`;
}

export async function publishNeuroCadAlpha({
  sourceRoot = DEFAULT_SOURCE_ROOT,
  outputRoot = DEFAULT_OUTPUT_ROOT,
  revision = resolveBuildRevision(),
} = {}) {
  const webRoot = resolve(sourceRoot, 'web');
  const srcRoot = resolve(sourceRoot, 'src');

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
  let publishedIndex;
  if (REVISION_META_PATTERN.test(sourceIndex)) {
    publishedIndex = sourceIndex.replace(REVISION_META_PATTERN, revisionMeta(revision));
  } else if (sourceIndex.includes('</head>')) {
    publishedIndex = sourceIndex.replace('</head>', `  ${revisionMeta(revision)}\n</head>`);
  } else {
    throw new Error('NeuroCAD publish refused: canonical browser index has no </head> boundary for revision stamping.');
  }
  await writeFile(resolve(outputRoot, 'index.html'), publishedIndex, 'utf8');

  const manifest = {
    product: 'NeuroCAD Alpha 0.1',
    route: '/neurocad/',
    revision: revision ?? null,
    source: 'portfolio/project2424/projects/T2424-0037',
    generated: true,
  };
  await writeFile(resolve(outputRoot, 'release-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  console.log(`[neurocad-publish] prepared /neurocad/ from canonical Alpha source at revision ${revision ?? 'local-development'}`);
  return manifest;
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) {
  publishNeuroCadAlpha().catch((error) => {
    console.error(`[neurocad-publish] ${error instanceof Error ? error.message : String(error)}`);
    process.exitCode = 1;
  });
}
