const functions = Object.freeze({
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: Math.sqrt,
  abs: Math.abs,
  ln: Math.log,
  log: Math.log10,
  log10: Math.log10,
});

function tokenize(raw) {
  if (typeof raw !== 'string' || !raw.trim() || raw.length > 256) throw new Error('Invalid expression');
  const tokens = [];
  let index = 0;
  while (index < raw.length) {
    const char = raw[index];
    if (/\s/.test(char)) {
      index += 1;
      continue;
    }
    if (/[0-9.]/.test(char)) {
      const start = index;
      while (index < raw.length && /[0-9.]/.test(raw[index])) index += 1;
      const value = raw.slice(start, index);
      if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value)) throw new Error('Invalid number');
      tokens.push({ kind: 'number', value });
      continue;
    }
    if (/[a-z]/i.test(char)) {
      const start = index;
      while (index < raw.length && /[a-z0-9]/i.test(raw[index])) index += 1;
      tokens.push({ kind: 'identifier', value: raw.slice(start, index).toLowerCase() });
      continue;
    }
    if ('+-*/^()'.includes(char)) {
      tokens.push({ kind: 'symbol', value: char });
      index += 1;
      continue;
    }
    throw new Error('Invalid character');
  }
  tokens.push({ kind: 'eof', value: '' });
  return tokens;
}

function parseExpressionTokens(tokens) {
  let index = 0;
  const current = () => tokens[index];
  const consume = (value) => {
    const token = current();
    if (value && token.value !== value) throw new Error('Unexpected token');
    index += 1;
    return token;
  };
  const expression = () => {
    let value = term();
    while (['+', '-'].includes(current().value)) {
      const operator = consume().value;
      const right = term();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  };
  const term = () => {
    let value = unary();
    while (['*', '/'].includes(current().value)) {
      const operator = consume().value;
      const right = unary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  };
  const unary = () => {
    if (current().value === '+') {
      consume('+');
      return unary();
    }
    if (current().value === '-') {
      consume('-');
      return -unary();
    }
    return power();
  };
  const power = () => {
    const base = primary();
    if (current().value !== '^') return base;
    consume('^');
    return base ** unary();
  };
  const primary = () => {
    const token = current();
    if (token.kind === 'number') return Number(consume().value);
    if (token.value === '(') {
      consume('(');
      const value = expression();
      consume(')');
      return value;
    }
    if (token.kind === 'identifier') {
      const identifier = consume().value;
      if (identifier === 'pi') return Math.PI;
      if (identifier === 'e') return Math.E;
      const fn = functions[identifier];
      if (!fn) throw new Error('Unknown function');
      consume('(');
      const value = expression();
      consume(')');
      return fn(value);
    }
    throw new Error('Expected a number');
  };

  const result = expression();
  if (current().kind !== 'eof') throw new Error('Unexpected trailing input');
  return result;
}

export function evaluateExpression(raw) {
  const result = parseExpressionTokens(tokenize(raw));
  if (typeof result !== 'number' || Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error('Invalid result');
  }
  return result;
}
