import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, unlink } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';
import { hasExactContentApproval } from '../contracts/contentPublication.js';

const projectRoot = resolve(import.meta.dirname, '..');
const publicDirectories = ['study-guides/myp', 'ap-content', 'myp5-content', 'learning-library'];
export const contentHash = (body) => `sha256:${createHash('sha256').update(body).digest('hex')}`;
// Preview responses must match the build bytes hashed by the offline worker.
const serializePublicationJson = (body) => `${JSON.stringify(body)}\n`;

export async function readPublicationApprovals(root = projectRoot) {
  const register = JSON.parse(await readFile(resolve(root, 'contracts/content-publication-approvals.json'), 'utf8'));
  if (register.schemaVersion !== 1 || !Array.isArray(register.entries)) throw new Error('Invalid content approval register.');
  if (new Set(register.entries.map((entry) => entry.path)).size !== register.entries.length) throw new Error('Duplicate content approval path.');
  return register.entries;
}

async function filesBelow(root, directory) {
  const files = [];
  let entries;
  try { entries = await readdir(resolve(root, directory), { withFileTypes: true }); }
  catch (error) { if (error.code === 'ENOENT') return files; throw error; }
  for (const entry of entries) {
    const name = `${directory}/${entry.name}`;
    if (entry.isDirectory()) files.push(...await filesBelow(root, name));
    else if (entry.isFile() || entry.isSymbolicLink()) files.push(name);
  }
  return files;
}

export async function approvedStaticPaths({ root = projectRoot, approvals, now = Date.now() } = {}) {
  approvals ??= await readPublicationApprovals(root);
  const allowed = new Set();
  const publicRoot = resolve(root, 'public');
  for (const entry of approvals) {
    if (typeof entry.path !== 'string' || !publicDirectories.some((dir) => entry.path.startsWith(`/${dir}/`))) continue;
    const path = resolve(publicRoot, entry.path.slice(1));
    if (!path.startsWith(`${publicRoot}${sep}`) || /[\\\0]/.test(entry.path) || entry.path.includes('/../')) continue;
    try {
      const body = await readFile(path);
      if (hasExactContentApproval(entry, contentHash(body), now)) allowed.add(entry.path);
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return allowed;
}

export function isControlledContentPath(rawUrl) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(rawUrl, 'http://localhost').pathname).replaceAll('\\', '/'); }
  catch { return true; }
  // Decode before normalisation so encoded traversal cannot bypass the boundary.
  pathname = new URL(pathname, 'http://localhost').pathname;
  return publicDirectories.some((dir) => pathname === `/${dir}` || pathname.startsWith(`/${dir}/`));
}

export async function publicationResponse(rawUrl, { root = projectRoot, approvals } = {}) {
  if (!isControlledContentPath(rawUrl)) return null;
  const path = new URL(decodeURIComponent(new URL(rawUrl, 'http://localhost').pathname), 'http://localhost').pathname;
  const allowed = await approvedStaticPaths({ root, approvals });
  if (path === '/learning-library/manifest.json') {
    const manifest = JSON.parse(await readFile(resolve(root, 'public', path.slice(1)), 'utf8'));
    return { status: 200, body: { ...manifest, entries: manifest.entries.filter(entry => allowed.has(entry.json))
      .map(entry => ({ ...entry, markdown: allowed.has(entry.markdown) ? entry.markdown : null })) } };
  }
  if (allowed.has(path)) return null;
  if (path === '/study-guides/myp/manifest.json') {
    const manifest = JSON.parse(await readFile(resolve(root, 'public', path.slice(1)), 'utf8'));
    return { status: 200, body: { ...manifest, subjects: manifest.subjects.map((subject) => ({ ...subject,
      pages: subject.pages.filter((page) => allowed.has(page.path)),
    })).filter((subject) => subject.pages.length > 0) } };
  }
  if (path === '/study-guides/myp/provenance-ledger.json') {
    approvals ??= await readPublicationApprovals(root);
    const entries = approvals.filter((entry) => allowed.has(entry.path) && entry.path.startsWith('/study-guides/myp/'));
    return { status: 200, body: { schemaVersion: 1, programme: 'IB_MYP', entries,
      summary: { files: entries.length, approved: entries.length, unreviewed: 0, quarantined: 0, heldFromIndex: 0 },
      evidenceBoundary: 'Only exact-hash approved publication records are included. The authoring inventory remains private to the repository.',
    } };
  }
  if (path === '/myp5-content/manifest.json') {
    const manifest = JSON.parse(await readFile(resolve(root, 'public', path.slice(1)), 'utf8'));
    const subjects = manifest.subjects.filter((subject) => allowed.has(`/myp5-content/${subject.slug}.json`));
    return { status: 200, body: { ...manifest, subjects,
      lessonCount: subjects.reduce((sum, subject) => sum + subject.lessonCount, 0),
      questionCount: subjects.reduce((sum, subject) => sum + subject.questionCount, 0),
    } };
  }
  return { status: 403, body: { code: 'CONTENT_REVIEW_REQUIRED', error: 'This study material is awaiting subject review and is not available yet.' } };
}

/** Only the disposable build output is pruned. Authoring files remain intact. */
export async function enforcePublishedContent(outputDirectory, { root = projectRoot, approvals } = {}) {
  const outputRoot = resolve(outputDirectory);
  if (outputRoot === resolve(root) || outputRoot === resolve(root, 'public') || outputRoot.startsWith(`${resolve(root, 'public')}${sep}`) || !relative(root, outputRoot)) {
    throw new Error('Refusing to prune source content. Provide a disposable build directory.');
  }
  const allowed = await approvedStaticPaths({ root, approvals });
  const removed = [];
  for (const directory of publicDirectories) {
    for (const name of await filesBelow(outputRoot, directory)) {
      const path = `/${name}`;
      if (allowed.has(path) && path !== '/learning-library/manifest.json') {
        const expected = await readFile(resolve(root, 'public', name));
        const actual = await readFile(resolve(outputRoot, name));
        if (contentHash(actual) === contentHash(expected)) continue;
      }
      if (['/study-guides/myp/manifest.json', '/study-guides/myp/provenance-ledger.json', '/myp5-content/manifest.json', '/learning-library/manifest.json'].includes(path)) {
        const response = await publicationResponse(path, { root, approvals });
        await writeFile(resolve(outputRoot, name), serializePublicationJson(response.body));
      } else {
        await unlink(resolve(outputRoot, name));
        removed.push(path);
      }
    }
  }
  return { approvedAssets: allowed.size, heldAssetsRemoved: removed.length, removed };
}

export function contentPublicationMiddleware(options = {}) {
  return (request, response, next) => {
    void publicationResponse(request.url, options).then((result) => {
      if (!result) return next();
      response.statusCode = result.status;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
      response.end(serializePublicationJson(result.body));
    }).catch(() => {
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.setHeader('Cache-Control', 'no-store');
      response.end(serializePublicationJson({ error: 'Study material approval could not be checked. Try again later.' }));
    });
  };
}
