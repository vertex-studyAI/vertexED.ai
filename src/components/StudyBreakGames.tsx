import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { addTile, shuffle, slideTiles } from '@/lib/breakGames.mjs';
const RevisionStack = lazy(() => import('@/components/RevisionStack'));
const names = ['Number tiles', 'Memory pairs', 'Sequence recall', 'Reaction check', 'Revision Stack'];
export default function StudyBreakGames() {
  const [game, setGame] = useState(() => Math.floor(Math.random() * names.length));
  const [paused, setPaused] = useState(false);
  const [round, setRound] = useState(0);
  useEffect(() => { const hide = () => { if (document.hidden) setPaused(true); }; window.addEventListener('blur', hide); document.addEventListener('visibilitychange', hide); return () => { window.removeEventListener('blur', hide); document.removeEventListener('visibilitychange', hide); }; }, []);
  return <section className="learning-paper study-break-games" aria-label="Optional study break">
    <h2>A short study break</h2><p>No audio, rewards or study-progress claims. Your study tools remain mounted while you play.</p>
    <label htmlFor="study-break-game">Game</label><select id="study-break-game" value={game} onChange={e => { setGame(Number(e.target.value)); setRound(n => n + 1); setPaused(false); }}>{names.map((name, i) => <option key={name} value={i}>{name}</option>)}</select>
    <div className="learning-actions"><button onClick={() => setPaused(v => !v)}>{paused ? 'Resume game' : 'Pause game'}</button><button onClick={() => { setGame((game + 1 + Math.floor(Math.random() * 4)) % 5); setRound(n => n + 1); }}>Rotate game</button><button onClick={() => setRound(n => n + 1)}>Restart game</button></div>
    <div key={`${game}-${round}`} hidden={paused} inert={paused}>
      {game === 0 && <Tiles paused={paused} />}{game === 1 && <Memory />}{game === 2 && <Sequence />}{game === 3 && <Reaction paused={paused} />}
      {game === 4 && (paused ? <p>Stack paused. Resume to start a new stack.</p> : <Suspense fallback={<p>Loading block game…</p>}><RevisionStack /></Suspense>)}
    </div>{paused && <p role="status">Game paused. Resume when ready.</p>}
  </section>;
}
function Tiles({ paused }: { paused: boolean }) {
  const [board, setBoard] = useState<number[]>(() => addTile(addTile(Array(16).fill(0))));
  const [score, setScore] = useState(0);
  const move = (direction: string) => { if (paused) return; const result = slideTiles(board, direction); if (result.moved) { setBoard(addTile(result.board)); setScore(n => n + result.score); } };
  const ended = ['left','right','up','down'].every(d => !slideTiles(board,d).moved);
  return <div tabIndex={0} aria-label="Number tiles. Use arrow keys to move." onKeyDown={e => { const direction = ({ ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down' } as Record<string,string>)[e.key]; if (direction) { e.preventDefault(); move(direction); } }}>
    <p>Join equal tiles. Each pair merges once per move. Score {score}.{ended ? ' No moves left. Restart to play again.' : ''}</p>
    <div className="break-grid" role="grid" aria-label="Number board">{board.map((n,i) => <div role="gridcell" key={i} aria-label={`Row ${Math.floor(i/4)+1}, column ${i%4+1}: ${n || 'empty'}`}>{n || '·'}</div>)}</div>
    <div className="learning-actions">{['left','up','down','right'].map(d => <button key={d} onClick={() => move(d)}>{d}</button>)}</div>
  </div>;
}
function Memory() {
  const [cards] = useState<string[]>(() => shuffle(['A','B','C','D','E','F','A','B','C','D','E','F']));
  const [open, setOpen] = useState<number[]>([]); const [matched, setMatched] = useState<number[]>([]);
  const pick = (i: number) => { if (open.includes(i) || matched.includes(i) || open.length === 2) return; const next = [...open,i]; if (next.length === 2 && cards[next[0]] === cards[next[1]]) { setMatched([...matched,...next]); setOpen([]); } else setOpen(next); };
  return <><p>Find six pairs. {matched.length / 2} pairs matched.</p><div className="break-grid">{cards.map((c,i) => <button key={i} disabled={matched.includes(i)} aria-label={`Card ${i+1}: ${matched.includes(i) ? `matched ${c}` : open.includes(i) ? c : 'hidden'}`} onClick={() => pick(i)}>{matched.includes(i) || open.includes(i) ? c : '?'}</button>)}</div>{open.length === 2 && <button onClick={() => setOpen([])}>Hide these cards</button>}{matched.length === cards.length && <p role="status">All pairs found.</p>}</>;
}
function Sequence() {
  const [sequence, setSequence] = useState<number[]>(() => [Math.ceil(Math.random()*4)]); const [show, setShow] = useState(true); const [index, setIndex] = useState(0); const [message, setMessage] = useState('');
  return <><p>Remember the sequence, then hide it and repeat using the numbered buttons.</p><p aria-live="polite">{show ? sequence.join(' → ') : message || `Step ${index+1} of ${sequence.length}`}</p>
    {show ? <button onClick={() => { setShow(false); setIndex(0); setMessage(''); }}>Hide and try</button> : <div className="learning-actions">{[1,2,3,4].map(n => <button key={n} onClick={() => { if (sequence[index] !== n) { setShow(true); setMessage('Try that sequence again.'); } else if (index+1 === sequence.length) { setSequence([...sequence,Math.ceil(Math.random()*4)]); setShow(true); setMessage('Sequence recalled.'); } else setIndex(index+1); }}>{n}</button>)}</div>}
  </>;
}
function Reaction({ paused }: { paused: boolean }) {
  const [phase, setPhase] = useState('idle'); const [message, setMessage] = useState('Wait for “Go”, then press the button.'); const started = useRef(0); const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => { if (paused) { clearTimeout(timeout.current); setPhase('idle'); setMessage('Paused. Start a new round when ready.'); } return () => clearTimeout(timeout.current); }, [paused]);
  const act = () => { if (phase === 'idle') { setPhase('waiting'); setMessage('Wait…'); timeout.current = setTimeout(() => { started.current=performance.now(); setPhase('go'); setMessage('Go'); }, 1500+Math.random()*2000); } else if (phase === 'waiting') { clearTimeout(timeout.current); setPhase('idle'); setMessage('Too early. Try again.'); } else { setPhase('idle'); setMessage(`${Math.round(performance.now()-started.current)} ms. Browser and device timing affect this result.`); } };
  return <><p role="status">{message}</p><button className="learning-primary" onClick={act}>{phase === 'idle' ? 'Start reaction round' : phase === 'go' ? 'Go' : 'Wait'}</button></>;
}
