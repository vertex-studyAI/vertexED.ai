import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';
import { filterPublishedModule } from '../scripts/content-publication-modules.mjs';

const asModule = (source) => `data:text/javascript;base64,${Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64')}`;

test('search consumes filtered public catalogues while keeping held subjects discoverable as directories', async () => {
  const file = resolve('src/lib/globalSearchIndex.ts');
  const source = await readFile(file, 'utf8');
  const parsed = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  const edits = [];
  for (const statement of parsed.statements) {
    if (!ts.isImportDeclaration(statement)) continue;
    const specifier = statement.moduleSpecifier;
    const target = resolve(dirname(file), specifier.text);
    const relativePath = target.slice(resolve('.').length + 1);
    const content = await readFile(target, 'utf8');
    const filtered = await filterPublishedModule(content, relativePath, { approvals: [], allowedStatic: new Set() });
    edits.push({ start: specifier.getStart(parsed), end: specifier.end, value: JSON.stringify(filtered === null ? pathToFileURL(target).href : asModule(filtered)) });
  }
  let transformed = source;
  for (const edit of edits.reverse()) transformed = transformed.slice(0, edit.start) + edit.value + transformed.slice(edit.end);
  const { GLOBAL_SEARCH_INDEX, searchVertex } = await import(asModule(transformed));
  const myp = GLOBAL_SEARCH_INDEX.filter((entry) => entry.to.startsWith('/myp/subjects/'));
  assert.equal(myp.length, 17);
  assert.ok(myp.every((entry) => entry.area === 'Subject' && /awaiting subject review/.test(entry.description)));
  assert.ok(myp.every((entry) => entry.to.split('/').length === 4));
  assert.ok(searchVertex('forces', { limit: 100 }).some((entry) => entry.to === '/myp/subjects/physics'));
  const ap = GLOBAL_SEARCH_INDEX.filter((entry) => entry.to.startsWith('/ap/'));
  assert.equal(ap.length, 42);
  assert.ok(ap.every((entry) => /awaiting subject review/.test(entry.description)));
  assert.ok(ap.every((entry) => entry.area === 'Course'));
  assert.equal(GLOBAL_SEARCH_INDEX.filter((entry) => entry.to.startsWith('/resources/')).length, 0);
  assert.equal(GLOBAL_SEARCH_INDEX.filter((entry) => /^\/archives[-/]/.test(entry.to)).length, 0);
});
