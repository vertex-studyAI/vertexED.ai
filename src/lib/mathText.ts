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

  text = text.replace(/```[\s\S]*?```/g, stash);
  text = text.replace(/`[^`]+`/g, stash);

  text = text.replace(/∫\s*_?\{?([^}\n]+)\}?\^?\{?([^}\n]+)\}?/g, (_, a, b) => `$$\\int_{${a.trim()}}^{${b.trim()}}$$`);
  text = text.replace(/∫/g, '$\\int$');
  text = text.replace(/∑/g, '$\\sum$');
  text = text.replace(/√\(([^)]+)\)/g, (_, inner) => `$\\sqrt{${inner.trim()}}$`);
  text = text.replace(/√(\d+)/g, (_, n) => `$\\sqrt{${n}}$`);
  text = text.replace(/±/g, '$\\pm$');
  text = text.replace(/≤/g, '$\\leq$');
  text = text.replace(/≥/g, '$\\geq$');
  text = text.replace(/≠/g, '$\\neq$');
  text = text.replace(/∞/g, '$\\infty$');
  text = text.replace(/π/g, '$\\pi$');
  text = text.replace(/θ/g, '$\\theta$');
  text = text.replace(/α/g, '$\\alpha$');
  text = text.replace(/β/g, '$\\beta$');
  text = text.replace(/γ/g, '$\\gamma$');
  text = text.replace(/Δ/g, '$\\Delta$');
  text = text.replace(/→/g, '$\\rightarrow$');

  text = text.replace(/\bd([a-zA-Z])\s*\/\s*d([a-zA-Z])\b/g, (_, top, bottom) => `$$\\frac{d${top}}{d${bottom}}$$`);
  text = text.replace(/\b([a-zA-Z0-9]+)\s*\/\s*([a-zA-Z0-9]+)\b/g, (match, num, den) => {
    if (/^\d+$/.test(num) && /^\d+$/.test(den)) return `$$\\frac{${num}}{${den}}$$`;
    if (/^[a-zA-Z]$/.test(num) && /^[a-zA-Z]$/.test(den)) return `$$\\frac{${num}}{${den}}$$`;
    return match;
  });

  text = text.replace(/\b([a-zA-Z])\^(\d+)\b/g, (_, base, exp) => `$$${base}^{${exp}}$$`);
  text = text.replace(/\b([a-zA-Z])_(\d+)\b/g, (_, base, sub) => `$$${base}_{${sub}}$$`);
  text = text.replace(/\b([a-zA-Z])\^\{([^}]+)\}/g, (_, base, exp) => `$$${base}^{${exp}}$$`);

  block.forEach((value, i) => {
    text = text.replace(`@@MATH${i}@@`, value);
  });

  return text;
}
