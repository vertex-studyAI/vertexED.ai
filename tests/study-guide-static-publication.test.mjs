import assert from 'node:assert/strict';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { pruneUnpublishedStudyGuides } from '../scripts/prune-unpublished-study-guides.mjs';

function approved(path) {
  return {
    path,
    editorialStatus: 'approved',
    publicationStatus: 'published',
    source: 'reviewed source',
    factualReviewer: 'reviewer',
    reviewedAt: '2026-09-19T00:00:00.000Z',
    license: 'permitted',
    permittedUse: 'study',
  };
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

test('static build keeps only provenance-approved study-guide markdown', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-guides-'));
  try {
    const distRoot = join(root, 'dist');
    const guideRoot = join(distRoot, 'study-guides', 'myp', 'biology');
    await mkdir(guideRoot, { recursive: true });

    const approvedPath = join(guideRoot, 'approved.md');
    const heldPath = join(guideRoot, 'held.md');
    const manifestPath = join(distRoot, 'study-guides', 'myp', 'manifest.json');
    await writeFile(approvedPath, '# approved\n');
    await writeFile(heldPath, '# held\n');
    await writeFile(manifestPath, '{}\n');

    const ledgerPath = join(root, 'ledger.json');
    await writeFile(ledgerPath, JSON.stringify({
      entries: [
        approved('/study-guides/myp/biology/approved.md'),
        {
          ...approved('/study-guides/myp/biology/held.md'),
          editorialStatus: 'unreviewed',
          publicationStatus: 'held-from-index',
        },
      ],
    }));

    const result = await pruneUnpublishedStudyGuides({ distRoot, ledgerPath });
    assert.deepEqual(result, { approved: 1, kept: 1, removed: 1, scanned: 2 });
    assert.equal(await exists(approvedPath), true);
    assert.equal(await exists(heldPath), false);
    assert.equal(await readFile(manifestPath, 'utf8'), '{}\n');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('static publication pruning fails closed when an approved file is absent', async () => {
  const root = await mkdtemp(join(tmpdir(), 'vertexed-guides-missing-'));
  try {
    const distRoot = join(root, 'dist');
    await mkdir(join(distRoot, 'study-guides', 'myp'), { recursive: true });
    const ledgerPath = join(root, 'ledger.json');
    await writeFile(ledgerPath, JSON.stringify({
      entries: [approved('/study-guides/myp/biology/missing.md')],
    }));

    await assert.rejects(
      pruneUnpublishedStudyGuides({ distRoot, ledgerPath }),
      /Publishable study-guide files missing from build artifact/,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('production build invokes static guide publication pruning', async () => {
  const build = await readFile(new URL('../scripts/build.mjs', import.meta.url), 'utf8');
  assert.match(build, /pruneUnpublishedStudyGuides/);
  assert.ok(
    build.indexOf('if (status !== 0)') < build.lastIndexOf('await pruneUnpublishedStudyGuides()'),
    'pruning must run only after a successful Vite build',
  );
});
