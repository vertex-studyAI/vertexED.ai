import { useEffect, useState } from 'react';
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

const reactions = ['hop', 'wiggle', 'spin'] as const;
type Reaction = 'rest' | 'greeting' | typeof reactions[number];

/** Apex is navigation, not an AI persona or a source of learning claims. */
export default function ApexCompanion({ suspended, onOpenTutor }: ApexCompanionProps) {
  const { settings, update } = useAppPreferences();
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [reaction, setReaction] = useState<{ name: Reaction; take: number }>({ name: 'greeting', take: 0 });
  const visible = settings.studyCompanion && !settings.simpleMode;
  const spriteSrc = settings.apexAppearance === 'ink'
    ? '/companions/apex-ink-v3.png'
    : '/companions/apex-paper-v3.png';

  useEffect(() => {
    if (settings.reducedMotion) setReaction(previous => ({ name: 'rest', take: previous.take + 1 }));
  }, [settings.reducedMotion]);

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
    // The launcher unmounts when hidden. Return focus to its persistent control.
    window.requestAnimationFrame(() => document.getElementById('vee-visibility')?.focus({ preventScroll: true }));
  };

  return (
    <>
      <button id="vee-visibility" type="button" className="vee-visibility" disabled={settings.simpleMode} onClick={() => {
        if (visible) hide();
        else update({ studyCompanion: true });
      }}>
        {settings.simpleMode ? 'Apex is off in Simple Mode' : visible ? 'Hide Apex' : 'Show Apex'}
      </button>
      {visible && !suspended && createPortal(
        <button id="vee-launcher" type="button" className={`vee-launcher ${settings.reducedMotion ? 'vee-still' : ''}`}
          aria-label="Open Apex study shortcuts" aria-haspopup="dialog" aria-expanded={open}
          onClick={() => { play('greeting'); setOpen(true); }}>
          {!imageFailed && <img className="vee-sprite" src={spriteSrc} alt="" width="96" height="96"
            decoding="async" fetchPriority="low" draggable={false} onError={() => setImageFailed(true)} />}
          <span className="vee-name">Apex <span aria-hidden="true">↗</span></span>
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
              src={spriteSrc} alt="" width="112" height="112" draggable={false} />}
            <div><p className="vee-eyebrow">YOUR STUDY COMPANION</p><h2 id="vee-title">Meet Apex.</h2></div>
          </div>
          {!imageFailed && <fieldset className="vee-appearance">
            <legend>Appearance</legend>
            <label><input type="radio" name="apex-appearance" value="paper" checked={settings.apexAppearance === 'paper'} onChange={() => update({ apexAppearance: 'paper' })} /> Paper</label>
            <label><input type="radio" name="apex-appearance" value="ink" checked={settings.apexAppearance === 'ink'} onChange={() => update({ apexAppearance: 'ink' })} /> Ink</label>
          </fieldset>}
          {!imageFailed && <div className="vee-play" role="group" aria-label="Play with Apex">
            {reactions.map(name => <button key={name} type="button" aria-disabled={settings.reducedMotion}
              aria-label={`Apex: ${name}`} onClick={() => play(name)}>{name[0].toUpperCase() + name.slice(1)}</button>)}
            {settings.reducedMotion && <p>Animations are off with reduced motion.</p>}
          </div>}
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
