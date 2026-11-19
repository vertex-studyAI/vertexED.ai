// Bounded exact-rational polynomial algebra. No eval, sampling, or model calls.
const abs = x => x < 0n ? -x : x;
function rational(n, d = 1n) {
  if (d === 0n) throw new Error('Division by zero is undefined.');
  if (d < 0n) { n = -n; d = -d; }
  let a = abs(n), b = d;
  while (b) [a, b] = [b, a % b];
  return [n / a, d / a];
}
const add = (a, b) => rational(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
const mul = (a, b) => rational(a[0] * b[0], a[1] * b[1]);
const zero = () => [0n, 1n];
const trim = p => { while (p.length > 1 && p.at(-1)[0] === 0n) p.pop(); return p; };
const sum = (a, b) => trim(Array.from({ length: Math.max(a.length, b.length) }, (_, i) => add(a[i] || zero(), b[i] || zero())));
function product(a, b) {
  if (a.length + b.length - 2 > 12) throw new Error('Use polynomials of degree at most 12.');
  const out = Array.from({ length: a.length + b.length - 1 }, zero);
  a.forEach((x, i) => b.forEach((y, j) => { out[i + j] = add(out[i + j], mul(x, y)); }));
  return trim(out);
}

export function parsePolynomial(input) {
  if (typeof input !== 'string' || input.length > 500 || !input.trim()) throw new Error('Enter a polynomial in x.');
  const source = input.replace(/−/g, '-');
  const tokens = source.match(/\d+(?:\.\d+)?|x|[()+\-*/^]|\S/g) || [];
  if (tokens.length > 160) throw new Error('This expression is too long for the local check.');
  let pos = 0, depth = 0;
  const peek = () => tokens[pos];
  function atom() {
    if (++depth > 20) throw new Error('Too many nested parentheses.');
    let result;
    const token = tokens[pos++];
    if (token === '(') {
      result = expression();
      if (tokens[pos++] !== ')') throw new Error('Close each parenthesis.');
    } else if (token === 'x') result = [zero(), [1n, 1n]];
    else if (/^\d+(?:\.\d+)?$/.test(token || '')) {
      if (token.replace('.', '').length > 12) throw new Error('Use numbers with at most 12 digits.');
      const digits = token.split('.');
      result = [rational(BigInt(digits.join('')), 10n ** BigInt(digits[1]?.length || 0))];
    } else throw new Error('Supported notation: numbers, x, +, -, *, / by a constant, parentheses and whole-number powers.');
    depth--;
    return result;
  }
  function power() {
    let out = atom();
    if (peek() === '^') {
      pos++;
      const exponent = tokens[pos++];
      if (!/^\d+$/.test(exponent || '') || Number(exponent) > 12) throw new Error('Use whole-number exponents from 0 to 12.');
      const base = out; out = [[1n, 1n]];
      for (let i = 0; i < Number(exponent); i++) out = product(out, base);
    }
    return out;
  }
  function unary() {
    if (peek() === '+' || peek() === '-') {
      const sign = tokens[pos++];
      // Bound unary recursion with the finite token limit.
      const out = unary();
      return sign === '-' ? out.map(([n, d]) => [-n, d]) : out;
    }
    return power();
  }
  function term() {
    let out = unary();
    while (peek() === '*' || peek() === '/' || peek() === '(' || peek() === 'x') {
      const operator = peek();
      if (operator === '*' || operator === '/') pos++;
      const right = unary();
      if (operator === '/') {
        if (right.length !== 1 || right[0][0] === 0n) throw new Error('Only division by a nonzero constant is supported; rational-function domains need separate review.');
        out = out.map(value => mul(value, rational(right[0][1], right[0][0])));
      } else out = product(out, right);
    }
    return out;
  }
  function expression() {
    let out = term();
    while (peek() === '+' || peek() === '-') {
      const operator = tokens[pos++]; const right = term();
      out = sum(out, operator === '-' ? right.map(([n, d]) => [-n, d]) : right);
    }
    return out;
  }
  const out = trim(expression());
  if (pos !== tokens.length) throw new Error('Unsupported notation. Enter only the expression, without y = or prose.');
  return out;
}

export function polynomialText(poly) {
  const terms = [];
  for (let i = poly.length - 1; i >= 0; i--) {
    const [n, d] = poly[i]; if (!n) continue;
    const magnitude = d === 1n ? String(abs(n)) : `${abs(n)}/${d}`;
    const coefficient = i && magnitude === '1' ? '' : magnitude;
    const variable = i ? (i === 1 ? 'x' : `x^${i}`) : '';
    terms.push(`${n < 0n ? '-' : '+'}${coefficient}${variable}`);
  }
  return terms.join(' ').replace(/^\+/, '') || '0';
}
const equal = (a, b) => a.length === b.length && a.every((r, i) => r[0] === b[i][0] && r[1] === b[i][1]);

export function reviewPolynomialDerivative(original, working) {
  try {
    const polynomial = parsePolynomial(original);
    const derivative = trim(polynomial.length === 1 ? [zero()] : polynomial.slice(1).map((r, i) => mul(r, [BigInt(i + 1), 1n])));
    const expected = polynomialText(derivative);
    const lines = typeof working === 'string' ? working.split('\n') : [];
    if (lines.length > 30) return { status: 'unsupported', message: 'Check at most 30 derivative lines at a time.' };
    const steps = lines.map((text, index) => ({ text: text.trim(), line: index + 1 })).filter(step => step.text);
    if (!steps.length) return { status: 'incomplete', message: 'Add at least one claimed derivative expression.' };
    let checked = 0;
    for (const step of steps) {
      let candidate;
      try { candidate = parsePolynomial(step.text); } catch (error) {
        return { status: 'unsupported', line: step.line, checked, message: `Line ${step.line} cannot be checked: ${error.message} No conclusion is made about later lines.` };
      }
      if (!equal(candidate, derivative)) {
        const exponentNotReduced = trim(polynomial.map((r, i) => mul(r, [BigInt(i), 1n])));
        const powerRule = equal(candidate, exponentNotReduced);
        return { status: 'different', line: step.line, checked, expected, submitted: step.text,
          category: powerRule ? 'power-rule' : 'expression-mismatch',
          message: powerRule ? 'The coefficients match multiplication by the exponent, but the powers were not reduced. Use d(x^n)/dx = n*x^(n-1).' : 'This is the first supplied derivative line that differs from the exact derivative. The expression alone does not establish why the mistake happened.',
          next: `Compare each term with ${expected}, then retry the next line. Constants differentiate to zero.` };
      }
      checked++;
    }
    return { status: 'verified', checked, expected, message: 'Every supplied derivative expression is algebraically equivalent to the exact derivative. This checks the expressions, not missing justifications or an exam mark.' };
  } catch (error) { return { status: 'unsupported', message: error.message }; }
}
