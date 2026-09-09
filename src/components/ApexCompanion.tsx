import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Link } from 'react-router';
import { createPortal } from 'react-dom';
import { ArrowUpRight, X } from 'lucide-react';
import AccessibleModal from '@/components/AccessibleModal';
import { useAppPreferences } from '@/contexts/AppPreferencesContext';
import '@/styles/vee.css';

type ApexCompanionProps = {
  suspended: boolean;
  onOpenTutor?: () => void;
};

const shortcuts = [
  { to: '/planner', stage: 'Plan', detail: 'Make time for a topic.' },
  { to: '/study-zone', stage: 'Focus', detail: 'Start a study session.' },
  { to: '/exam-prep', stage: 'Practise', detail: 'Prepare for an exam.' },
];

const reactions = [
  { name: 'hop', label: 'Hop' },
  { name: 'wiggle', label: 'Wiggle' },
  { name: 'spin', label: 'Spin' },
  { name: 'blink', label: 'Blink' },
  { name: 'page-turn', label: 'Turn page' },
] as const;
type Reaction = 'rest' | 'greeting' | typeof reactions[number]['name'];
type PixelPosition = { left: number; top: number };

const EDGE_GAP = 8;

function isSavedPosition(value: unknown): value is { x: number; y: number } {
  if (!value || typeof value !== 'object') return false;
  const position = value as { x?: unknown; y?: unknown };
  return typeof position.x === 'number' && Number.isFinite(position.x) && position.x >= 0 && position.x <= 1
    && typeof position.y === 'number' && Number.isFinite(position.y) && position.y >= 0 && position.y <= 1;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

/** Apex is navigation, not an AI persona or a source of learning claims. */
export default function ApexCompanion({ suspended, onOpenTutor }: ApexCompanionProps) {
  const { settings, update } = useAppPreferences();
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [reaction, setReaction] = useState<{ name: Reaction; take: number }>({ name: 'greeting', take: 0 });
  const [pixelPosition, setPixelPosition] = useState<PixelPosition | null>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);
  const visible = settings.studyCompanion && !settings.simpleMode;
  const restSpriteSrc = settings.apexAppearance === 'ink'
    ? '/companions/apex-ink-v3.png'
    : '/companions/apex-paper-v3.png';
  const reactionSpriteSrc = reaction.name === 'blink'
    ? `/companions/apex-${settings.apexAppearance}-blink-v4.png`
    : reaction.name === 'page-turn'
      ? `/companions/apex-${settings.apexAppearance}-page-turn-v4.png`
      : restSpriteSrc;

  const getBounds = () => {
    const rect = launcherRef.current?.getBoundingClientRect();
    return {
      width: rect?.width ?? (window.innerWidth < 640 ? 72 : 96),
      height: rect?.height ?? (window.innerWidth < 640 ? 102 : 126),
    };
  };

  const positionFromSettings = () => {
    if (!isSavedPosition(settings.apexPosition)) return null;
    const { width, height } = getBounds();
    return {
      left: EDGE_GAP + settings.apexPosition.x * Math.max(0, window.innerWidth - width - EDGE_GAP * 2),
      top: EDGE_GAP + settings.apexPosition.y * Math.max(0, window.innerHeight - height - EDGE_GAP * 2),
    };
  };

  const savePosition = (position: PixelPosition) => {
    const { width, height } = getBounds();
    const availableX = Math.max(1, window.innerWidth - width - EDGE_GAP * 2);
    const availableY = Math.max(1, window.innerHeight - height - EDGE_GAP * 2);
    update({ apexPosition: {
      x: clamp((position.left - EDGE_GAP) / availableX, 0, 1),
      y: clamp((position.top - EDGE_GAP) / availableY, 0, 1),
    } });
  };

  useEffect(() => {
    if (settings.reducedMotion) setReaction(previous => ({ name: 'rest', take: previous.take + 1 }));
  }, [settings.reducedMotion]);

  useEffect(() => {
    if (reaction.name !== 'blink' && reaction.name !== 'page-turn') return;
    const timer = window.setTimeout(
      () => setReaction(previous => ({ name: 'rest', take: previous.take + 1 })),
      reaction.name === 'blink' ? 420 : 820,
    );
    return () => window.clearTimeout(timer);
  }, [reaction.name, reaction.take]);

  useEffect(() => {
    const reposition = () => setPixelPosition(positionFromSettings());
    reposition();
    window.addEventListener('resize', reposition);
    return () => window.removeEventListener('resize', reposition);
  // The measured artwork bounds can change with its appearance.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.apexPosition, settings.apexAppearance]);

  const play = (name: Reaction) => {
    if (settings.reducedMotion) return;
    setReaction(previous => ({ name, take: previous.take + 1 }));
  };

  useEffect(() => {
    if (!open || !visible || suspended) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open, visible, suspended]);

  const hide = () => {
    setOpen(false);
    update({ studyCompanion: false });
    window.requestAnimationFrame(() => document.getElementById('vee-visibility')?.focus({ preventScroll: true }));
  };

  const dragStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const dragMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) >= 5) drag.moved = true;
    if (!drag.moved) return;
    event.preventDefault();
    const { width, height } = getBounds();
    setPixelPosition({
      left: clamp(event.clientX - drag.offsetX, EDGE_GAP, window.innerWidth - width - EDGE_GAP),
      top: clamp(event.clientY - drag.offsetY, EDGE_GAP, window.innerHeight - height - EDGE_GAP),
    });
  };

  const dragEnd = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    if (!drag.moved) return;
    suppressClickRef.current = true;
    window.setTimeout(() => { suppressClickRef.current = false; }, 0);
    setPixelPosition(current => {
      if (current) savePosition(current);
      return current;
    });
  };

  const moveWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = offsets[event.key];
    if (!direction) return;
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const step = event.shiftKey ? 48 : 16;
    const next = {
      left: clamp(rect.left + direction[0] * step, EDGE_GAP, window.innerWidth - rect.width - EDGE_GAP),
      top: clamp(rect.top + direction[1] * step, EDGE_GAP, window.innerHeight - rect.height - EDGE_GAP),
    };
    setPixelPosition(next);
    savePosition(next);
  };

  const launcherStyle: CSSProperties | undefined = pixelPosition
    ? { left: pixelPosition.left, top: pixelPosition.top, right: 'auto', bottom: 'auto' }
    : undefined;

  return (
    <>
      <button id="vee-visibility" type="button" className="vee-visibility" disabled={settings.simpleMode} onClick={() => {
        if (visible) hide();
        else update({ studyCompanion: true });
      }}>
        {settings.simpleMode ? 'Apex is off in Simple Mode' : visible ? 'Hide Apex' : 'Show Apex'}
      </button>
      {visible && !suspended && createPortal(
        <button ref={launcherRef} id="vee-launcher" type="button"
          className={`vee-launcher ${settings.reducedMotion ? 'vee-still' : ''}`}
          style={launcherStyle}
          aria-label="Open Apex study shortcuts"
          aria-describedby="vee-drag-instructions"
          aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
          aria-haspopup="dialog"
          aria-expanded={open}
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
          onKeyDown={moveWithKeyboard}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            play('greeting');
            setOpen(true);
          }}>
          {!imageFailed && <img className="vee-sprite" src={restSpriteSrc} alt="" width="96" height="96"
            decoding="async" fetchPriority="low" draggable={false} onError={() => setImageFailed(true)} />}
          <span className="vee-name">Apex <span aria-hidden="true">↗</span></span>
          <span id="vee-drag-instructions" className="vee-sr-only">Drag to move Apex, or use the arrow keys while focused.</span>
        </button>, document.body,
      )}
      {open && visible && !suspended && (
        <AccessibleModal titleId="vee-title" descriptionId="vee-description" onClose={() => setOpen(false)}
          overlayClassName="vee-overlay" className={`vee-sheet ${settings.reducedMotion ? 'vee-still' : ''}`}>
          <button className="vee-close" type="button" aria-label="Close Apex study shortcuts" onClick={() => setOpen(false)}>
            <X size={18} aria-hidden="true" />
          </button>
          <div className="vee-intro">
            {!imageFailed && <img key={reaction.take} data-reaction={reaction.name} className="vee-reaction-sprite"
              src={reactionSpriteSrc} alt="" width="112" height="112" draggable={false} />}
            <div><p className="vee-eyebrow">YOUR STUDY COMPANION</p><h2 id="vee-title">Meet Apex.</h2></div>
          </div>
          {!imageFailed && <fieldset className="vee-appearance">
            <legend>Appearance</legend>
            <label><input type="radio" name="apex-appearance" value="paper" checked={settings.apexAppearance === 'paper'} onChange={() => update({ apexAppearance: 'paper' })} /> Paper</label>
            <label><input type="radio" name="apex-appearance" value="ink" checked={settings.apexAppearance === 'ink'} onChange={() => update({ apexAppearance: 'ink' })} /> Ink</label>
          </fieldset>}
          {!imageFailed && <div className="vee-play" role="group" aria-label="Play with Apex">
            {reactions.map(({ name, label }) => <button key={name} type="button" aria-disabled={settings.reducedMotion}
              aria-label={`Apex: ${name}`} onClick={() => play(name)}>{label}</button>)}
            {settings.reducedMotion && <p>Animations are off with reduced motion.</p>}
          </div>}
          <div className="vee-position">
            <p>Drag Apex anywhere on screen. Arrow keys move him when the launcher is focused.</p>
            <button type="button" disabled={!isSavedPosition(settings.apexPosition)} onClick={() => {
              setPixelPosition(null);
              update({ apexPosition: null });
            }}>Reset position</button>
          </div>
          <p id="vee-description">The book in your corner. Pick a place to start.</p>
          <nav className="vee-shortcuts" aria-label="Apex study shortcuts">
            {shortcuts.map(({ to, stage, detail }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}>
                <span><strong>{stage}</strong><span>{detail}</span></span><ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </nav>
          {onOpenTutor ? (
            <button type="button" className="vee-tutor" onClick={() => { setOpen(false); onOpenTutor(); }}>Ask the AI tutor <ArrowUpRight size={16} aria-hidden="true" /></button>
          ) : (
            <Link to="/chatbot" className="vee-tutor" onClick={() => setOpen(false)}>Ask the AI tutor <ArrowUpRight size={16} aria-hidden="true" /></Link>
          )}
          <div className="vee-sheet-footer"><span>No nudges. No streaks to keep.</span><button type="button" onClick={hide}>Hide Apex</button></div>
        </AccessibleModal>
      )}
    </>
  );
}
