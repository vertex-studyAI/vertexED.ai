import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import postcss from 'postcss';
import * as markdownHref from '../src/lib/markdownHref.mjs';

const window = new JSDOM('').window;
const imports = {
  'react/jsx-runtime': jsx,
  'react-markdown': { default: ReactMarkdown },
  'remark-math': { default: remarkMath },
  'remark-gfm': { default: remarkGfm },
  'rehype-katex': { default: rehypeKatex },
  'dompurify': { default: DOMPurify(window) },
  'katex/dist/katex.min.css': {},
  '@/lib/markdownHref.mjs': markdownHref,
  '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
};
function evaluate(source) {
  const code = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  new Function('require', 'exports', code)(key => {
    assert.ok(Object.hasOwn(imports, key), `Unmapped runtime import ${key}`);
    return imports[key];
  }, exports);
  return exports;
}
function load(path) { return evaluate(fs.readFileSync(path, 'utf8')); }
imports['@/lib/sanitize'] = load('src/lib/sanitize.ts');
imports['@/lib/mathText'] = load('src/lib/mathText.ts');
imports['@/components/markdown/MarkdownLink'] = load('src/components/markdown/MarkdownLink.tsx');
imports['@/lib/mathRendering'] = load('src/lib/mathRendering.ts');

// Render the exact page JSX, sanitisation and plugin bindings without mounting
// unrelated account, network and editor state from the surrounding page.
function pageMarkdown(path, inputName) {
  const source = fs.readFileSync(path, 'utf8');
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const elements = [];
  const visit = node => {
    if (ts.isJsxElement(node) && node.openingElement.tagName.getText(ast) === 'ReactMarkdown') elements.push(node);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.equal(elements.length, 1, `${path} has one markdown renderer`);
  const dependencies = ast.statements.filter(statement =>
    (ts.isImportDeclaration(statement) && Object.hasOwn(imports, statement.moduleSpecifier.text)) ||
    (ts.isVariableStatement(statement) && statement.declarationList.declarations.some(declaration => declaration.name.getText(ast) === 'markdownComponents')),
  ).map(statement => statement.getText(ast)).join('\n');
  return evaluate(`${dependencies}\nexport default function PageMarkdown({ children: ${inputName} }) { return (${elements[0].getText(ast)}); }`).default;
}

const renderers = [
  ['RichMarkdown', load('src/components/RichMarkdown.tsx').default],
  ['ChatMarkdown', load('src/components/chat/ChatMarkdown.tsx').default],
  ['AnswerReviewer', pageMarkdown('src/pages/AnswerReviewer.tsx', 'response')],
  ['NotetakerQuiz', pageMarkdown('src/pages/NotetakerQuiz.tsx', 'notes')],
];
const render = (component, input) => renderToStaticMarkup(React.createElement(component, null, input));

for (const [name, component] of renderers) {
  test(`${name}: rejected resource commands keep the theme error colour and never create resources`, () => {
    const output = render(component, '$\\includegraphics{https://example.invalid/blocked.png}$');
    assert.match(output, /style="[^"]*color:var\(--math-error-color\)/);
    assert.doesNotMatch(output, /<(?:img|mglyph)\b/);
    assert.doesNotMatch(output, /(?:href|src)="https:\/\/example\.invalid/i);
    assert.doesNotMatch(output, /#cc0000/i);
  });

  test(`${name}: malformed TeX uses the same readable fallback without raw HTML`, () => {
    const output = render(component, '$\\frac{1}{$\n\n<script>alert(1)</script>');
    assert.match(output, /class="katex-error"/);
    assert.match(output, /style="[^"]*color:var\(--math-error-color\)/);
    assert.doesNotMatch(output, /<script\b|#cc0000/i);
  });

  test(`${name}: supported math still renders accessible MathML`, () => {
    const output = render(component, '$\\frac{x^2}{2}$');
    assert.match(output, /<mfrac>/);
    assert.match(output, /<msup>/);
    assert.doesNotMatch(output, /katex-error/);
  });
}

function luminance(rgb) {
  const linear = rgb.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}
function rgbFromHsl(colour) {
  const match = /^hsl\(([\d.]+) ([\d.]+)% ([\d.]+)%\)$/.exec(colour);
  assert.ok(match, `Expected an HSL theme token, received ${colour}`);
  const hue = Number(match[1]);
  const saturation = Number(match[2]) / 100;
  const lightness = Number(match[3]) / 100;
  const amplitude = saturation * Math.min(lightness, 1 - lightness);
  return [0, 8, 4].map(offset => {
    const k = (offset + hue / 30) % 12;
    return lightness - amplitude * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  });
}
function rgbFromHex(hex) { return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16) / 255); }

test('light, dark and default math error tokens meet normal-text contrast on reading surfaces', () => {
  const stylesheet = postcss.parse(fs.readFileSync('src/index.css', 'utf8'));
  const colours = new Map();
  stylesheet.walkRules(rule => rule.walkDecls('--math-error-color', declaration => colours.set(rule.selector, declaration.value)));
  for (const [theme, backgrounds] of [
    [':root', ['#ffffff', '#f0f3f6']],
    ['.light', ['#ffffff', '#f0f3f6']],
    ['.dark', ['#171b21', '#22272f']],
  ]) {
    assert.ok(colours.has(theme), `Missing ${theme} math error colour`);
    const foreground = luminance(rgbFromHsl(colours.get(theme)));
    for (const background of backgrounds) {
      const surface = luminance(rgbFromHex(background));
      const contrast = (Math.max(foreground, surface) + 0.05) / (Math.min(foreground, surface) + 0.05);
      assert.ok(contrast >= 4.5, `${theme} against ${background}: ${contrast.toFixed(3)}:1`);
    }
  }
});

test.after(() => window.close());
