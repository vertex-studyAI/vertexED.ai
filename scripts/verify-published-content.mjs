import { readFile, readdir } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { ADAPTIVE_QUESTION_BANK } from '../src/content/adaptiveQuestionBank.mjs';
import { COMPLEX_DEFINITIONS } from '../src/content/complexNumbersPractice.mjs';
import { hasExactContentApproval } from '../contracts/contentPublication.js';
import { approvedStaticPaths, contentHash, readPublicationApprovals } from './content-publication.mjs';
import { moduleContentPath } from './content-publication-modules.mjs';
import { readLegacyPublication } from './legacy-content-publication.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const key = (node) => node && (ts.isIdentifier(node) || ts.isStringLiteral(node)) ? node.text : null;

/** Inspect actual emitted JavaScript, static files and service-worker URLs; never mutates output. */
export async function verifyPublishedContent(directory, { root = projectRoot, approvals } = {}) {
  const output = resolve(directory);
  approvals ??= await readPublicationApprovals(root);
  const approved = new Map(approvals.map((entry) => [entry.path, entry]));
  const allowedStatic = await approvedStaticPaths({ root, approvals });
  const held = ADAPTIVE_QUESTION_BANK.filter((item) => !hasExactContentApproval(approved.get(moduleContentPath('src/content/adaptiveQuestionBank.mjs', item.id)), contentHash(JSON.stringify(item))));
  const heldIds = new Set(held.map((item) => item.id));
  const forbiddenStrings = new Set(held.flatMap((item) => [item.prompt, ...item.solution]));
  const legacy = await readLegacyPublication({ root, approvals });
  const normalize = (value) => value.replace(/\s+/g, ' ').trim();
  const legacyStrings = new Set();
  for (const item of legacy.modules.filter((entry) => !entry.approved)) {
    const source = ts.createSourceFile(item.file, item.source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    function visitBody(node) {
      if ((ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node)) && normalize(node.text).length >= 80) legacyStrings.add(normalize(node.text));
      ts.forEachChild(node, visitBody);
    }
    visitBody(source);
  }
  function collectSection(value) {
    if (typeof value === 'string' && value.length >= 40) legacyStrings.add(normalize(value));
    else if (Array.isArray(value)) value.forEach(collectSection);
    // Route identifiers may still occur in the router and saved workflow metadata.
    // They are not teaching bodies. Discovery is checked separately; prose is never excluded by its value.
    else if (value && typeof value === 'object') for (const [key, child] of Object.entries(value)) {
      if (!['to', 'href'].includes(key)) collectSection(child);
    }
  }
  for (const item of legacy.sections.filter((entry) => !entry.approved)) {
    if (item.name === 'learningStages') for (const stage of item.value) legacyStrings.add(normalize(stage.sample[1]));
    else if (item.kind === 'revision-trace-examples') for (const stage of item.value) for (const key of ['title', 'text', 'annotation']) legacyStrings.add(normalize(stage[key]));
    else if (item.replacement) {
      const parsed = ts.createSourceFile(item.file, item.value, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      function visitFunction(node) {
        if (ts.isJsxText(node) && normalize(node.text).length >= 20) legacyStrings.add(normalize(node.text));
        ts.forEachChild(node, visitFunction);
      }
      visitFunction(parsed);
    }
    else if (item.name === 'COMMAND_TERM_DEFINITIONS') for (const definition of Object.values(item.value)) legacyStrings.add(normalize(definition));
    else collectSection(item.value);
  }
  if (!hasExactContentApproval(approved.get(moduleContentPath('src/content/complexNumbersPractice.mjs', 'complex-definitions')), contentHash(JSON.stringify(COMPLEX_DEFINITIONS)))) {
    for (const definition of Object.values(COMPLEX_DEFINITIONS)) forbiddenStrings.add(definition);
  }
  const files = [];
  async function walk(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      const file = resolve(folder, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) files.push(file);
    }
  }
  await walk(output);
  const violations = [];
  let javaScriptFiles = 0;
  let checkedStrings = 0;
  for (const file of files) {
    const path = `/${relative(output, file).replaceAll('\\', '/')}`;
    if (path === '/sitemap.xml') {
      const sitemap = await readFile(file, 'utf8');
      for (const route of legacy.heldRoutes) if (sitemap.includes(`${route}</loc>`)) violations.push({ file: path, reason: 'held-legacy-sitemap-route', route });
    }
    if (/^\/(?:study-guides\/myp|ap-content|myp5-content)\//.test(path) && !/\/(?:manifest|provenance-ledger)\.json$/.test(path) && !allowedStatic.has(path)) {
      violations.push({ file: path, reason: 'held-static-asset' });
    }
    if (!file.endsWith('.js')) continue;
    javaScriptFiles += 1;
    const parsed = ts.createSourceFile(path, await readFile(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        checkedStrings += 1;
        if (forbiddenStrings.has(node.text)) violations.push({ file: path, reason: 'held-adaptive-body-or-definition', line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1 });
        if (legacyStrings.has(normalize(node.text))) violations.push({ file: path, reason: 'held-legacy-teaching-body', line: parsed.getLineAndCharacterOfPosition(node.getStart(parsed)).line + 1 });
        if (path === '/sw.js' && /^\/(?:study-guides\/myp|ap-content|myp5-content)\//.test(node.text) && !/\/(?:manifest|provenance-ledger)\.json$/.test(node.text) && !allowedStatic.has(node.text)) {
          violations.push({ file: path, reason: 'held-offline-url', url: node.text });
        }
      }
      if (ts.isObjectLiteralExpression(node)) {
        const properties = node.properties.filter(ts.isPropertyAssignment);
        const id = properties.find((property) => key(property.name) === 'id')?.initializer;
        if (id && ts.isStringLiteral(id) && heldIds.has(id.text) && properties.some((property) => ['prompt', 'answer', 'choices', 'solution', 'mistakes'].includes(key(property.name)))) {
          violations.push({ file: path, reason: 'held-adaptive-answer-object', id: id.text });
        }
      }
      ts.forEachChild(node, visit);
    }
    visit(parsed);
  }
  if (!javaScriptFiles) throw new Error('No emitted JavaScript was found; a build is required.');
  return { status: violations.length ? 'FAIL' : 'PASS', javaScriptFiles, checkedStrings, heldAdaptiveQuestions: held.length, approvedStaticAssets: allowedStatic.size,
    heldLegacyModules: legacy.modules.filter((item) => !item.approved).length, heldTeachingSections: legacy.sections.filter((item) => !item.approved).length,
    checkedLegacyBodyStrings: legacyStrings.size, violations };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await verifyPublishedContent(process.argv[2] ?? resolve(projectRoot, 'dist'));
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.status !== 'PASS') process.exitCode = 1;
}
