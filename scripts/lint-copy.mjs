import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contract = fs.readFileSync(path.join(root, 'brand/COPY.md'), 'utf8');
const phraseBlock = contract.split('<!-- copy-lint:phrases:start -->')[1]?.split('<!-- copy-lint:phrases:end -->')[0];
if (!phraseBlock) throw new Error('COPY.md is missing its banned-phrase block');
const phrases = phraseBlock.split('\n').filter((line) => line.startsWith('- ')).map((line) => line.slice(2).trim());
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function inspectCopy(text) {
  text = text.replace(/&mdash;|&#8212;|&#x2014;/gi, '\u2014');
  const rules = [];
  if (text.includes('\u2014')) rules.push('em-dash');
  for (const phrase of phrases) if (new RegExp(`\\b${escape(phrase)}\\b`, 'i').test(text)) rules.push(`marketing: ${phrase}`);
  if (/lorem\s+ipsum/i.test(text)) rules.push('placeholder-text');
  if (/testimonial\s*(goes here|placeholder)|["“]?(this product changed my life|best app ever)|(?:John|Jane) Doe/i.test(text)) rules.push('suspect-testimonial');
  if (/\b(?:10,?000\+?|[xX]{2,}|[0-9]+[kKmM]\+)\s+(?:happy|satisfied|active|trusted|students|users|customers)|\b99\.9%|\b(?:trusted|loved) by\s+[\dXx]/i.test(text)) rules.push('suspect-metric');
  if (/\bwhere .{1,60} meets .{1,60}|\bnot just .{1,80},? but |\bwhether you['’]re /i.test(text)) rules.push('generic-construction');
  return rules;
}

export function lintSource(source, filename = 'copy.tsx') {
  const tree = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
  const findings = [];
  const headings = new Map();
  function visit(node) {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node) || ts.isJsxText(node) || ts.isTemplateHead(node) || ts.isTemplateMiddle(node) || ts.isTemplateTail(node)) {
      const text = node.text.replace(/\s+/g, ' ').trim();
      const line = tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
      for (const rule of inspectCopy(text)) findings.push({ file: filename, line, rule, text: text.slice(0, 140) });
    }
    if (ts.isJsxElement(node) && /^h[1-6]$/.test(node.openingElement.tagName.getText(tree))) {
      const heading = node.children.filter(ts.isJsxText).map((child) => child.text.trim()).join(' ').toLowerCase();
      if (/^(get started|learn more|our features|why choose us|how it works|everything you need)$/.test(heading)) {
        const line = tree.getLineAndCharacterOfPosition(node.getStart(tree)).line + 1;
        if (headings.has(heading)) findings.push({ file: filename, line, rule: 'repeated-generic-heading', text: heading });
        headings.set(heading, line);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return findings;
}

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(name) : /\.(?:tsx?|m?js|jsx)$/.test(name) ? [name] : [];
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const files = args[0] === '--files' ? args.slice(1).map((file) => path.resolve(root, file)) : filesIn(path.join(root, 'src'));
  if (!files.length) throw new Error('No copy files selected');
  const findings = files.flatMap((file) => lintSource(fs.readFileSync(file, 'utf8'), path.relative(root, file)));
  for (const finding of findings) console.log(`${finding.file}:${finding.line} [${finding.rule}] ${finding.text}`);
  console.log(`[copy] ${files.length} files scanned; ${findings.length} findings. Review claims manually; no text was rewritten.`);
  process.exitCode = findings.length ? 1 : 0;
}
