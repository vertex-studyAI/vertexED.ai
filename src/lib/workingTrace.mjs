// Working Trace v1. Exact rational polynomial arithmetic; no eval and no model verdicts.
// Deliberately bounded: one variable, degree <= 6, constant divisors, linear equations.
export const TRACE_VERSION = 'working-trace/1';
const fail = (message) => { throw new Error(message); };
const gcd = (a, b) => { while (b) { const remainder = a % b; a = b; b = remainder; } return a < 0n ? -a : a; };
function rational(n, d = 1n) {
  if (!d) fail('Division by zero is undefined.');
  if (n.toString().length > 2048 || d.toString().length > 2048) fail('This calculation exceeds the exact-number size limit. Use a smaller expression.');
  const g = gcd(n, d); const sign = d < 0n ? -1n : 1n;
  return [n / g * sign, d / g * sign];
}
const add = (a, b) => rational(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => rational(a[0] * b[0], a[1] * b[1]);
const neg = (a) => [-a[0], a[1]];
const div = (a, b) => rational(a[0] * b[1], a[1] * b[0]);
const zero = () => [0n, 1n];
const equal = (a, b) => a[0] === b[0] && a[1] === b[1];
const format = (a) => a[1] === 1n ? String(a[0]) : `${a[0]}/${a[1]}`;
function trim(p) { while (p.length > 1 && !p.at(-1)[0]) p.pop(); return p; }
function plus(a, b) { return trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => add(a[i] ?? zero(), b[i] ?? zero()))); }
function times(a, b) {
  if (a.length + b.length > 8) fail('This expression exceeds the degree-six limit.');
  const out = Array.from({ length: a.length + b.length - 1 }, zero);
  a.forEach((v, i) => b.forEach((w, j) => { out[i + j] = add(out[i + j], mul(v, w)); }));
  return trim(out);
}

export function parseExpression(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 240) fail('Enter an expression of 1 to 240 characters.');
  const source = raw.replaceAll('−', '-').replace(/[×·]/g, '*').replaceAll('÷', '/').replaceAll('²', '^2').replaceAll('³', '^3');
  const tokens = source.match(/\d+(?:\.\d+)?|[a-zA-Z]|[()+*/^-]/g) ?? [];
  if (tokens.join('') !== source.replace(/\s/g, '')) fail('Use numbers, one letter, parentheses and + - * / ^. Functions and symbolic fractions are not supported yet.');
  if (tokens.length > 100) fail('Use a shorter expression.');
  if (/[a-zA-Z]{2,}/.test(source)) fail('Use a single letter for the variable. Functions are not supported yet.');
  const vars = [...new Set(tokens.filter(t => /^[a-zA-Z]$/.test(t)))];
  if (vars.length > 1) fail('Use one variable per trace.');
  let i = 0;
  const node = (kind, value, children = []) => ({ kind, value, children });
  const atom = () => {
    const t = tokens[i++];
    if (t === '(') { const value = sum(); if (tokens[i++] !== ')') fail('Close each parenthesis.'); return value; }
    if (/^\d/.test(t ?? '')) {
      const [whole, fractional = ''] = t.split('.');
      return { p: [rational(BigInt(whole + fractional), 10n ** BigInt(fractional.length))], ast: node('number', t) };
    }
    if (/^[a-zA-Z]$/.test(t ?? '')) return { p: [zero(), [1n, 1n]], ast: node('variable', t) };
    fail('An expression is incomplete or uses unsupported notation.');
  };
  const power = () => {
    let a = atom();
    if (tokens[i] === '^') {
      i++; const exponent = tokens[i++];
      if (!/^[0-6]$/.test(exponent ?? '')) fail('Use whole-number powers from 0 to 6.');
      if (exponent === '0' && (a.p.length !== 1 || a.p[0][0] === 0n)) fail('A zero power may include 0^0. This version cannot verify that domain.');
      let p = [[1n, 1n]];
      for (let j = 0; j < Number(exponent); j++) p = times(p, a.p);
      a = { p, ast: node('power', Number(exponent), [a.ast]) };
    }
    return a;
  };
  const unary = () => {
    if (tokens[i] === '-' || tokens[i] === '+') {
      const sign = tokens[i++]; const a = unary();
      return { p: sign === '-' ? a.p.map(neg) : a.p, ast: node('unary', sign, [a.ast]) };
    }
    return power();
  };
  const product = () => {
    let a = unary();
    while (i < tokens.length) {
      let op = tokens[i];
      if (op === '*' || op === '/') i++;
      else if (op === '(' || /^[a-zA-Z]$/.test(op)) op = '*';
      else break;
      const b = unary();
      if (op === '/' && b.p.length !== 1) fail('Variable denominators need domain checks. This version cannot verify that step.');
      a = { p: op === '*' ? times(a.p, b.p) : a.p.map(v => div(v, b.p[0])), ast: node('binary', op, [a.ast, b.ast]) };
    }
    return a;
  };
  const sum = () => {
    let a = product();
    while (tokens[i] === '+' || tokens[i] === '-') {
      const op = tokens[i++]; const b = product();
      a = { p: plus(a.p, op === '-' ? b.p.map(neg) : b.p), ast: node('binary', op, [a.ast, b.ast]) };
    }
    return a;
  };
  const result = sum();
  if (i !== tokens.length) fail('Unsupported or incomplete expression.');
  return { ...result, variable: vars[0] ?? null };
}

function parseLine(line) {
  const parts = line.split('=');
  if (parts.length > 2) fail('Use one equation on each line.');
  const left = parseExpression(parts[0]);
  if (parts.length === 1) return { ...left, equation: false };
  const right = parseExpression(parts[1]);
  if (left.variable && right.variable && left.variable !== right.variable) fail('Use one variable per equation.');
  const p = plus(left.p, right.p.map(neg));
  if (p.length > 2) fail('Nonlinear equations need solution-set checks. This version verifies linear equations only.');
  return { p, variable: left.variable ?? right.variable, equation: true, ast: { kind: 'equation', children: [left.ast, right.ast] } };
}
function solution(line) {
  if (line.p.length === 1) return line.p[0][0] ? 'none' : 'all';
  return format(div(neg(line.p[0]), line.p[1]));
}

export function verifyTransition(before, after) {
  try {
    const a = parseLine(before); const b = parseLine(after);
    if (a.equation !== b.equation) fail('Keep both lines as expressions or both as equations.');
    if (a.variable && b.variable && a.variable !== b.variable) fail('The variable changed between lines.');
    const same = a.equation ? solution(a) === solution(b) : a.p.length === b.p.length && a.p.every((v, i) => equal(v, b.p[i]));
    return {
      status: same ? 'verified' : 'incorrect',
      category: same ? null : a.equation ? 'equation-balance' : 'algebraic-equivalence',
      explanation: same ? (a.equation ? 'Both linear equations have the same solution set.' : 'Both expressions have exactly the same polynomial coefficients.') : (a.equation ? 'The solution set changed. Check that you applied the same operation to both sides.' : 'The expressions are not equivalent. Check each sign, factor and constant term.'),
      evidence: a.equation ? { before: solution(a), after: solution(b) } : { before: a.p.map(format), after: b.p.map(format) },
    };
  } catch (error) { return { status: 'unverified', category: 'unsupported', explanation: error.message }; }
}

export function checkWorkingTrace(text) {
  const lines = String(text).split('\n').map(s => s.trim()).filter(Boolean);
  if (lines.length < 2 || lines.length > 20) return { version: TRACE_VERSION, steps: [], firstIncorrect: null, complete: false, message: 'Enter 2 to 20 lines, with one expression or equation per line.' };
  const steps = []; let uncertain = false; let firstIncorrect = null;
  for (let i = 1; i < lines.length; i++) {
    const result = verifyTransition(lines[i - 1], lines[i]);
    if (result.status === 'incorrect' && firstIncorrect === null && !uncertain) firstIncorrect = i + 1;
    if (result.status === 'unverified') uncertain = true;
    steps.push({ line: i + 1, before: lines[i - 1], after: lines[i], ...result });
  }
  return { version: TRACE_VERSION, steps, firstIncorrect, complete: steps.every(s => s.status === 'verified'), message: uncertain ? 'Some steps could not be verified. No claim is made about the first error across those steps.' : 'Every adjacent pair was checked. The initial equation or expression is supplied by you.' };
}

// SI dimension vectors: mass, length, time. This verifies dimensions only, not magnitudes.
const UNITS = { kg: [1,0,0], g: [1,0,0], m: [0,1,0], cm: [0,1,0], km: [0,1,0], s: [0,0,1], min: [0,0,1], h: [0,0,1], N: [1,1,-2], J: [1,2,-2], W: [1,2,-3], Pa: [1,-1,-2], Hz: [0,0,-1] };
export function checkDimensions(left, right) {
  const parse = (s) => {
    if (typeof s !== 'string' || !s.trim() || s.length > 100) fail('Enter a supported unit expression.');
    const pieces = s.replace(/\s+/g, '').split(/([*/])/); let sign = 1; const dim = [0,0,0];
    pieces.forEach((part, i) => {
      if (i % 2) { sign = part === '/' ? -1 : 1; return; }
      const match = /^(kg|cm|km|min|Pa|Hz|[gmsNhJW])(?:\^(-?[0-6]))?$/.exec(part);
      if (!match) fail('Use kg, g, m, cm, km, s, min, h, N, J, W, Pa or Hz, joined by * or /. Powers use ^.');
      const exponent = Number(match[2] ?? 1) * sign;
      UNITS[match[1]].forEach((n, j) => { dim[j] += n * exponent; });
    });
    return dim;
  };
  try { const a = parse(left); const b = parse(right); const same = a.every((n,i) => n === b[i]); return { status: same ? 'verified' : 'incorrect', explanation: same ? 'Dimensions agree. This does not check the numerical value, unit conversion, significant figures or physical model.' : 'Dimensions differ. Revisit the relationship between the quantities.', evidence: { left: a, right: b } }; }
  catch (error) { return { status: 'unverified', explanation: error.message }; }
}
