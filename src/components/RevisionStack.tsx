import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

const WIDTH = 10;
const HEIGHT = 16;
const SHAPES = [
  [[0, 0], [1, 0], [0, 1], [1, 1]],
  [[0, 0], [1, 0], [2, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 1], [2, 1]],
  [[2, 0], [0, 1], [1, 1], [2, 1]],
  [[0, 0], [1, 0], [1, 1], [2, 1]],
  [[1, 0], [2, 0], [0, 1], [1, 1]],
  [[0, 1], [1, 1], [2, 1], [3, 1]],
] as const;

type Cell = readonly [number, number];
type Piece = { cells: ReadonlyArray<Cell>; x: number; y: number; kind: number };

const emptyBoard = () => Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false) as boolean[]);
const nextPiece = (kind: number): Piece => ({ cells: SHAPES[kind % SHAPES.length], x: 3, y: 0, kind });

function collides(board: boolean[][], piece: Piece) {
  return piece.cells.some(([cx, cy]) => {
    const x = piece.x + cx;
    const y = piece.y + cy;
    return x < 0 || x >= WIDTH || y >= HEIGHT || (y >= 0 && board[y][x]);
  });
}

function rotated(piece: Piece): Piece {
  if (piece.kind % SHAPES.length === 0) return piece;
  const edge = piece.kind % SHAPES.length === 6 ? 3 : 2;
  const cells = piece.cells.map(([x, y]) => [edge - y, x] as const);
  return { ...piece, cells };
}

export default function RevisionStack() {
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(() => nextPiece(0));
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setPiece(nextPiece(0));
    setScore(0);
    setRunning(false);
    setGameOver(false);
  }, []);

  const settle = useCallback((current: Piece) => {
    const merged = board.map(row => [...row]);
    current.cells.forEach(([cx, cy]) => {
      const x = current.x + cx;
      const y = current.y + cy;
      if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) merged[y][x] = true;
    });
    const openRows = merged.filter(row => !row.every(Boolean));
    const cleared = HEIGHT - openRows.length;
    while (openRows.length < HEIGHT) openRows.unshift(Array(WIDTH).fill(false));
    setBoard(openRows);
    if (cleared) setScore(value => value + cleared * 100);
    setPiece(previous => nextPiece(previous.kind + 1));
  }, [board]);

  const move = useCallback((dx: number, dy: number) => {
    if (gameOver) return;
    const candidate = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (!collides(board, candidate)) setPiece(candidate);
    else if (dy > 0) settle(piece);
  }, [board, piece, settle, gameOver]);

  const turn = useCallback(() => {
    if (gameOver) return;
    const candidate = rotated(piece);
    if (!collides(board, candidate)) setPiece(candidate);
  }, [board, piece, gameOver]);

  const drop = useCallback(() => {
    if (gameOver) return;
    let candidate = piece;
    while (!collides(board, { ...candidate, y: candidate.y + 1 })) candidate = { ...candidate, y: candidate.y + 1 };
    settle(candidate);
  }, [board, piece, settle, gameOver]);

  useEffect(() => {
    if (!running || reducedMotion) return;
    const timer = window.setInterval(() => move(0, 1), 720);
    return () => window.clearInterval(timer);
  }, [move, reducedMotion, running]);

  useEffect(() => {
    if (collides(board, piece)) { setGameOver(true); setRunning(false); }
  }, [board, piece]);

  useEffect(() => {
    const pause = () => { if (document.hidden) setRunning(false); };
    document.addEventListener('visibilitychange', pause);
    return () => document.removeEventListener('visibilitychange', pause);
  }, []);

  const visible = useMemo(() => {
    const cells = board.map(row => [...row]);
    piece.cells.forEach(([cx, cy]) => {
      const x = piece.x + cx;
      const y = piece.y + cy;
      if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) cells[y][x] = true;
    });
    return cells;
  }, [board, piece]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.target !== event.currentTarget || gameOver) return;
    const actions: Record<string, () => void> = {
      ArrowLeft: () => move(-1, 0), ArrowRight: () => move(1, 0), ArrowDown: () => move(0, 1),
      ArrowUp: turn, ' ': drop,
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    setRunning(true);
    action();
  };

  return (
    <section className="vh-stack" aria-labelledby="revision-stack-title" data-reveal>
      <div className="vh-stack-copy">
        <p className="vh-kicker"><span className="vh-encrypted" aria-label="Revision signal" /> / 08 / Revision stack</p>
        <h2 id="revision-stack-title">Build the idea.<br /><em>Clear the gap.</em></h2>
        <p>Learning is more than the next paper. Make room to explore, connect ideas and try again. The blocks beside these notes are yours to play with whenever you want a short break.</p>
        <div className="vh-stack-status" aria-live="polite"><span>{gameOver ? 'Stack complete. Reset to play again.' : 'Break score'}</span><strong>{score}</strong></div>
        <div className="vh-stack-actions">
          <button type="button" disabled={gameOver} onClick={() => setRunning(value => !value)}>{running ? 'Pause blocks' : 'Play blocks'}</button>
          <button type="button" onClick={reset}>Reset</button>
        </div>
        {reducedMotion && <p className="vh-stack-note">Automatic movement is paused by your reduced-motion setting. Manual controls remain available.</p>}
      </div>
      <div className="vh-stack-game" tabIndex={0} onKeyDown={onKeyDown} aria-label="Revision Stack game. Use arrow keys to move, up arrow to rotate and Space to place a block.">
        <div className="vh-stack-board" aria-hidden="true">
          {visible.flatMap((row, y) => row.map((filled, x) => <i className={filled ? 'is-filled' : ''} key={`${x}-${y}`} />))}
        </div>
        <div className="vh-stack-controls" aria-label="Revision Stack controls">
          <button type="button" aria-label="Move left" onClick={() => move(-1, 0)}><ArrowLeft aria-hidden /></button>
          <button type="button" aria-label="Rotate" onClick={turn}><RotateCw aria-hidden /></button>
          <button type="button" aria-label="Move right" onClick={() => move(1, 0)}><ArrowRight aria-hidden /></button>
          <button type="button" aria-label="Move down" onClick={() => move(0, 1)}><ArrowDown aria-hidden /></button>
        </div>
      </div>
    </section>
  );
}
