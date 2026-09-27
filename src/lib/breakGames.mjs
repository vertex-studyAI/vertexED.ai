export function slideTiles(board, direction) {
  const next = Array(16).fill(0); let score = 0;
  for (let line = 0; line < 4; line++) {
    const ids = Array.from({ length: 4 }, (_, n) => direction === 'left' ? line * 4 + n : direction === 'right' ? line * 4 + 3 - n : direction === 'up' ? n * 4 + line : (3 - n) * 4 + line);
    const values = ids.map(id => board[id]).filter(Boolean), merged = [];
    for (let i = 0; i < values.length; i++) {
      if (values[i] === values[i + 1]) { merged.push(values[i] * 2); score += values[i] * 2; i++; } else merged.push(values[i]);
    }
    ids.forEach((id, i) => { next[id] = merged[i] || 0; });
  }
  return { board: next, score, moved: next.some((v, i) => v !== board[i]) };
}
export function addTile(board, random = Math.random) {
  const free = board.flatMap((n, i) => n ? [] : [i]);
  if (!free.length) return board;
  const next = [...board]; next[free[Math.floor(random() * free.length)]] = 2; return next;
}
export function shuffle(values, random = Math.random) {
  const next = [...values]; for (let i = next.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [next[i], next[j]] = [next[j], next[i]]; } return next;
}
