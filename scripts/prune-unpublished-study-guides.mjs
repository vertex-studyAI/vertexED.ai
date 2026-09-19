import { readFile, readdir, rm } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { isPublishableGuide } from '../src/lib/studyGuidePublication.mjs';

function normalizedRelative(root, path) {
  return relative(root, path).split('\\').join('/');
}

async function collectMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...await collectMarkdownFiles(path));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
      files.push(path);
    }
  }
  return files;
}

/**
 * Vite copies public/ directly into dist/. The repository intentionally keeps
 * unreviewed guide source under public/ for server-side review/retrieval, so the
 * build must remove held Markdown from the browser-addressable artifact.
 */
export async function pruneUnpublishedStudyGuides({
  distRoot = resolve('dist'),
  ledgerPath = resolve('public/study-guides/myp/provenance-ledger.json'),
} = {}) {
  const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
  if (!Array.isArray(ledger?.entries)) {
    throw new TypeError('Study-guide provenance ledger is missing entries.');
  }

  const approved = new Set(
    ledger.entries
      .filter(isPublishableGuide)
      .map((entry) => String(entry.path || '').replace(/^\/+/, '')),
  );

  const guideRoot = resolve(distRoot, 'study-guides', 'myp');
  const markdownFiles = await collectMarkdownFiles(guideRoot);
  const observed = new Set(markdownFiles.map((path) => normalizedRelative(distRoot, path)));

  const missingApproved = [...approved].filter((path) => !observed.has(path));
  if (missingApproved.length > 0) {
    throw new Error(`Publishable study-guide files missing from build artifact: ${missingApproved.join(', ')}`);
  }

  let removed = 0;
  let kept = 0;
  for (const path of markdownFiles) {
    const artifactPath = normalizedRelative(distRoot, path);
    if (approved.has(artifactPath)) {
      kept += 1;
      continue;
    }
    await rm(path);
    removed += 1;
  }

  return { approved: approved.size, kept, removed, scanned: markdownFiles.length };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : '';
if (invokedPath === fileURLToPath(import.meta.url)) {
  try {
    const result = await pruneUnpublishedStudyGuides();
    console.log(
      `[study-guides] static publication boundary: kept=${result.kept} removed=${result.removed} approved=${result.approved}`,
    );
  } catch (error) {
    console.error(`[study-guides] publication pruning failed: ${error?.message ?? error}`);
    process.exitCode = 1;
  }
}
