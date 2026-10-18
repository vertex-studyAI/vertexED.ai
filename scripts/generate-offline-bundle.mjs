import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, relative } from 'node:path';

export async function generateOfflineBundle(directory) {
  const root = resolve(directory);
  const files = ['index.html'];
  for (const asset of ['logo.png', 'app-mark.svg', 'favicon.ico']) {
    try { await access(resolve(root, asset)); files.push(asset); } catch { /* Optional in isolated build fixtures. */ }
  }
  async function collect(folder) {
    for (const entry of await readdir(resolve(root, folder), { withFileTypes: true })) {
      const name = `${folder}/${entry.name}`;
      if (entry.isDirectory()) await collect(name);
      else if (entry.isFile()) files.push(name);
    }
  }
  await collect('assets');
  await collect('myp5-content');
  // Some minimal test fixtures predate AP; include the complete public library
  // when present, without admitting arbitrary runtime or private response files.
  try { await access(resolve(root, 'ap-content')); await collect('ap-content'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const entries = [];
  let bytes = 0;
  for (const file of files.sort()) {
    const content = await readFile(resolve(root, file));
    bytes += content.length;
    entries.push({ url: `/${file}`, integrity: `sha256-${createHash('sha256').update(content).digest('base64')}` });
  }
  if (bytes > 20 * 1024 * 1024) throw new Error('Offline bundle exceeds the 20 MiB public asset budget.');
  const template = await readFile(new URL('./offline-worker.js', import.meta.url), 'utf8');
  const version = createHash('sha256').update(JSON.stringify(entries)).update(template).digest('hex');
  const worker = `const MANIFEST = ${JSON.stringify({ version, entries })};\n${template}`;
  await writeFile(resolve(root, 'sw.js'), worker);
  return { version, files: entries.length, bytes, worker: relative(process.cwd(), resolve(root, 'sw.js')) };
}
