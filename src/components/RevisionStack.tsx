import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const emptyBoard = () => Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(0) as number[]);
const nextPiece = (kind: number): Piece => ({ cells: SHAPES[kind % SHAPES.length], x: 3, y: 0, kind });

function collides(board: number[][], piece: Piece) {
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
  const section = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [board, setBoard] = useState(emptyBoard);
  const [piece, setPiece] = useState(() => nextPiece(0));
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(true);
  const [demo, setDemo] = useState(true);
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
      if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) merged[y][x] = current.kind % SHAPES.length + 1;
    });
    const openRows = merged.filter(row => !row.every(Boolean));
    const cleared = HEIGHT - openRows.length;
    while (openRows.length < HEIGHT) openRows.unshift(Array(WIDTH).fill(0));
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
    if (!running || reducedMotion || !inView || !pageVisible) return;
    const timer = window.setInterval(() => {
      // A quiet demo spreads pieces across the board. Input takes over instantly.
      const target = (piece.kind * 3) % 7;
      if (demo && piece.x !== target && !collides(board, { ...piece, x: piece.x + Math.sign(target - piece.x) })) move(Math.sign(target - piece.x), 0);
      else move(0, 1);
    }, demo ? 220 : 440);
    return () => window.clearInterval(timer);
  }, [move, reducedMotion, running, inView, pageVisible, demo, piece, board]);

  useEffect(() => {
    if (collides(board, piece)) {
      if (demo) { setBoard(emptyBoard()); setPiece(nextPiece(piece.kind + 1)); setScore(0); }
      else { setGameOver(true); setRunning(false); }
    }
  }, [board, piece, demo]);

  useEffect(() => {
    const pause = () => setPageVisible(!document.hidden);
    pause();
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 });
    if (section.current) observer.observe(section.current);
    document.addEventListener('visibilitychange', pause);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', pause); };
  }, []);

  const visible = useMemo(() => {
    const cells = board.map(row => [...row]);
    piece.cells.forEach(([cx, cy]) => {
      const x = piece.x + cx;
      const y = piece.y + cy;
      if (y >= 0 && y < HEIGHT && x >= 0 && x < WIDTH) cells[y][x] = piece.kind % SHAPES.length + 1;
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
    setDemo(false);
    setRunning(true);
    action();
  };

  return (
    <section ref={section} className="vh-stack" aria-labelledby="revision-stack-title" data-reveal>
      <div className="vh-stack-copy">
        <p className="vh-kicker"><span className="vh-encrypted" aria-label="Revision signal" /> / 08 / Revision stack</p>
        <h2 id="revision-stack-title">Build the idea.<br /><em>Clear the gap.</em></h2>
        <p>Practise for the paper. Keep the understanding for what comes after. Connect ideas, test an explanation and return to the gaps. When you need a moment, take over the blocks.</p>
        <div className="vh-stack-status"><span>{demo ? 'Automatic demo' : gameOver ? 'Stack complete. Reset to play again.' : 'Break score'}</span><strong>{demo ? '▶' : score}</strong></div>
        <div className="vh-stack-actions">
          <button type="button" disabled={gameOver} onClick={() => setRunning(value => !value)}>{running ? 'Pause blocks' : 'Play blocks'}</button>
          <button type="button" onClick={() => { reset(); setDemo(false); setRunning(true); }}>{demo ? 'Take over' : 'Reset'}</button>
        </div>
        {reducedMotion && <p className="vh-stack-note">Automatic movement is paused by your reduced-motion setting. Manual controls remain available.</p>}
      </div>
      <div className="vh-stack-game" tabIndex={0} onKeyDown={onKeyDown} aria-label="Revision Stack game. Use arrow keys to move, up arrow to rotate and Space to place a block.">
        <p className="vh-stack-instructions"><strong>How to play</strong><span>Move: ← → · Rotate: ↑ · Faster: ↓ · Place: Space</span></p>
        <div className="vh-stack-board" aria-hidden="true">
          {visible.flatMap((row, y) => row.map((filled, x) => <i className={filled ? 'is-filled' : ''} data-piece={filled || undefined} key={`${x}-${y}`} />))}
        </div>
        <div className="vh-stack-controls" aria-label="Revision Stack controls" onClick={() => { setDemo(false); setRunning(true); }}>
          <button type="button" aria-label="Move left" onClick={() => move(-1, 0)}><ArrowLeft aria-hidden /></button>
          <button type="button" aria-label="Rotate" onClick={turn}><RotateCw aria-hidden /></button>
          <button type="button" aria-label="Move right" onClick={() => move(1, 0)}><ArrowRight aria-hidden /></button>
          <button type="button" aria-label="Move down" onClick={() => move(0, 1)}><ArrowDown aria-hidden /></button>
          <button type="button" aria-label="Place block" onClick={drop}>Place</button>
        </div>
      </div>
    </section>
  );
}
