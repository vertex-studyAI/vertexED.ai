import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';
import { publishNeuroCadAlpha } from '../scripts/publish-neurocad-alpha.mjs';

const sourceRoot = resolve('portfolio/project2424/projects/T2424-0037');

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

test('publishes the canonical NeuroCAD Alpha as a deploy-shaped /neurocad/ route', async () => {
  const tempRoot = await mkdtemp(join(tmpdir(), 'neurocad-public-route-'));
  const outputRoot = join(tempRoot, 'neurocad');
  const revision = '0123456789abcdef0123456789abcdef01234567';

  try {
    const manifest = await publishNeuroCadAlpha({ sourceRoot, outputRoot, revision });

    assert.equal(manifest.route, '/neurocad/');
    assert.equal(manifest.revision, revision);
    assert.equal(await exists(join(outputRoot, 'index.html')), true);
    assert.equal(await exists(join(outputRoot, 'styles.css')), true);
    assert.equal(await exists(join(outputRoot, 'app.mjs')), true);
    assert.equal(await exists(join(outputRoot, 'src', 'alpha.mjs')), true);
    assert.equal(await exists(join(outputRoot, 'src', 'alpha', 'engine.mjs')), true);

    const app = await readFile(join(outputRoot, 'app.mjs'), 'utf8');
    assert.match(app, /from "\.\/src\/alpha\.mjs";/);
    assert.doesNotMatch(app, /from "\.\.\/src\/alpha\.mjs";/);

    const index = await readFile(join(outputRoot, 'index.html'), 'utf8');
    assert.match(index, new RegExp(`<meta name="neurocad-build-revision" content="${revision}" \\/>`));
    assert.match(index, /NeuroCAD Alpha 0\.1/);
    assert.match(index, /not airworthy, manufacturable/);

    const publishedAlpha = await readFile(join(outputRoot, 'src', 'alpha.mjs'), 'utf8');
    const canonicalAlpha = await readFile(join(sourceRoot, 'src', 'alpha.mjs'), 'utf8');
    assert.equal(publishedAlpha, canonicalAlpha, 'deployment packaging must not fork the canonical CAD implementation');

    const writtenManifest = JSON.parse(await readFile(join(outputRoot, 'release-manifest.json'), 'utf8'));
    assert.deepEqual(writtenManifest, manifest);
  } finally {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
