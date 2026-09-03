/**
 * Converts common math notation in plain text to KaTeX-friendly delimiters
 * so ∫, fractions, and powers render without users typing LaTeX.
 */
export function enrichMathInText(input: string): string {
  if (!input?.trim()) return input;
  if (input.includes('$$') || /(?<!\$)\$(?!\$)/.test(input)) return input;

  let text = input;

  const block: string[] = [];
  const stash = (match: string) => {
    block.push(match);
    return `@@MATH${block.length - 1}@@`;
  };
  const math = (latex: string) => stash(`$${latex}$`);

  text = text.replace(/```[\s\S]*?```/g, stash);
  text = text.replace(/`[^`]+`/g, stash);

  text = text.replace(
    /∫\s*_?\{?([A-Za-z0-9.+-]+)\}?\s*\^\s*\{?([A-Za-z0-9.+-]+)\}?/g,
    (_, lower, upper) => math(`\\int_{${lower}}^{${upper}}`),
  );
  text = text.replace(/√\(([^)]+)\)/g, (_, inner) => math(`\\sqrt{${inner.trim()}}`));
  text = text.replace(/√(\d+)/g, (_, n) => math(`\\sqrt{${n}}`));
  text = text.replace(/\bd([a-zA-Z])\s*\/\s*d([a-zA-Z])\b/g, (_, top, bottom) => math(`\\frac{d${top}}{d${bottom}}`));
  text = text.replace(/\b([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g, (match, num, den) => {
    if (/^\d+$/.test(num) && /^\d+$/.test(den)) return math(`\\frac{${num}}{${den}}`);
    if (/^[a-zA-Z]$/.test(num) && /^[a-zA-Z]$/.test(den)) return math(`\\frac{${num}}{${den}}`);
    return match;
  });

  text = text.replace(/\b([a-zA-Z])\^(\d+)\b/g, (_, base, exp) => math(`${base}^{${exp}}`));
  text = text.replace(/\b([a-zA-Z])_(\d+)\b/g, (_, base, sub) => math(`${base}_{${sub}}`));
  text = text.replace(/\b([a-zA-Z])\^\{([^}]+)\}/g, (_, base, exp) => math(`${base}^{${exp}}`));

  const symbols: Record<string, string> = {
    '∫': '\\int', '∑': '\\sum', '±': '\\pm', '≤': '\\leq', '≥': '\\geq', '≠': '\\neq',
    '∞': '\\infty', 'π': '\\pi', 'θ': '\\theta', 'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma',
    'Δ': '\\Delta', '→': '\\rightarrow',
  };
  text = text.replace(/[∫∑±≤≥≠∞πθαβγΔ→]/g, (symbol) => math(symbols[symbol]));

  block.forEach((value, i) => {
    text = text.split(`@@MATH${i}@@`).join(value);
  });

  return text;
}
