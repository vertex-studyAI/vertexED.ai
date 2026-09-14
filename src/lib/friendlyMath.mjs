const SUPERSCRIPTS = Object.freeze({ 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' });

export function formatFriendlyMath(input) {
  return String(input)
    .replace(/\b([a-z0-9)]+)\s+(?:square|squared)\b/gi, '$1²')
    .replace(/\b([a-z0-9)]+)\s+(?:cube|cubed)\b/gi, '$1³')
    .replace(/\b([a-z0-9)]+)\s+to the power of\s+([0-9]+)\b/gi, (_match, base, power) => {
      const superscript = [...power].map((digit) => SUPERSCRIPTS[digit] || digit).join('');
      return `${base}${superscript}`;
    })
    .replace(/\bsquare root of\s+([a-z0-9().+-]+)/gi, '√($1)')
    .replace(/\bmultiplied by\b|\btimes\b/gi, '×')
    .replace(/\bdivided by\b/gi, '÷');
}
