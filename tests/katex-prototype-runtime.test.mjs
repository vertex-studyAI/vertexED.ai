import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import katex from 'katex';
import * as jsx from 'react/jsx-runtime';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import * as markdownHref from '../src/lib/markdownHref.mjs';

const window = new JSDOM('').window;
const imports = {
  'react/jsx-runtime': jsx,
  'react-markdown': { default: ReactMarkdown }, 'remark-math': { default: remarkMath },
  'remark-gfm': { default: remarkGfm }, 'rehype-katex': { default: rehypeKatex },
  'dompurify': { default: DOMPurify(window) }, 'katex/dist/katex.min.css': {},
  '@/lib/markdownHref.mjs': markdownHref,
  '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
};
function load(path) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(key => { assert.ok(Object.hasOwn(imports, key), `Unmapped runtime import ${key}`); return imports[key]; }, exports);
  return exports;
}
imports['@/lib/sanitize'] = load('src/lib/sanitize.ts');
imports['@/lib/mathText'] = load('src/lib/mathText.ts');
imports['@/lib/mathRendering'] = load('src/lib/mathRendering.ts');
imports['@/components/markdown/MarkdownLink'] = load('src/components/markdown/MarkdownLink.tsx');
const components = [load('src/components/RichMarkdown.tsx').default, load('src/components/chat/ChatMarkdown.tsx').default];
const render = (component, text) => renderToStaticMarkup(React.createElement(component, null, text));
function withPollution(values, operation) {
  const originals = Object.fromEntries(Object.keys(values).map(key => [key, Object.getOwnPropertyDescriptor(Object.prototype, key)]));
  try {
    for (const [key, value] of Object.entries(values)) Object.defineProperty(Object.prototype, key, { value, writable: true, configurable: true });
    return operation();
  } finally {
    for (const key of Object.keys(values)) {
      if (originals[key]) Object.defineProperty(Object.prototype, key, originals[key]);
      else delete Object.prototype[key];
    }
  }
}

test('every resolved KaTeX copy is the pinned advisory-fixed release', () => {
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  const versions = Object.entries(lock.packages).filter(([path]) => /(?:^|\/)node_modules\/katex$/.test(path)).map(([, pkg]) => pkg.version);
  assert.deepEqual(versions, ['0.18.2']);
  assert.equal(katex.version, '0.18.2');
});

test('actual RichMarkdown and ChatMarkdown still render fraction, powers and accessible MathML', () => {
  for (const component of components) {
    const output = render(component, '$\\frac{a^2+b^2}{c}$');
    assert.match(output, /class="katex"/); assert.match(output, /<mfrac>/); assert.match(output, /<msup>/); assert.match(output, /application\/x-tex/);
    assert.doesNotMatch(output, /katex-error/);
  }
});

test('preexisting prototype trust cannot enable images or script links through actual markdown components', () => {
  const resource = '$\\includegraphics{https://example.invalid/conditional-resource.png}$';
  for (const component of components) {
    assert.doesNotMatch(render(component, resource), /<(?:img|mglyph)\b/);
    const output = withPollution({ trust: true }, () => render(component, resource + '\n\n$\\href{javascript:alert(1)}{click}$'));
    assert.doesNotMatch(output, /<(?:img|mglyph)\b/);
    assert.doesNotMatch(output, /(?:href|src)="javascript:/i);
  }
  assert.equal(Object.hasOwn(Object.prototype, 'trust'), false);
});

test('inherited setting metadata and namespaces cannot change normal KaTeX output', () => {
  const input = '\\frac{x^2}{2}';
  const baseline = katex.renderToString(input);
  for (const values of [{ default: true }, { processor: () => true }, { '\\prototypeMacro': 'untrusted' }]) {
    assert.equal(withPollution(values, () => katex.renderToString(input)), baseline);
  }
  for (const key of ['default', 'processor', '\\prototypeMacro']) assert.equal(Object.hasOwn(Object.prototype, key), false);
});

test.after(() => window.close());
