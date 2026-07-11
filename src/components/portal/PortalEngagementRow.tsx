import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, MessageSquarePlus, RefreshCw, Settings } from 'lucide-react';
import { getCommandTermsForBoard } from '@/lib/commandTerms';
import { getConfidenceRatings, setConfidenceRating } from '@/lib/portalFeatures';
import type { LearnerProfile } from '@/lib/learnerProfile';
import PortalWidget from '@/components/portal/PortalWidget';

type Props = {
  profile: LearnerProfile;
};

const CONFIDENCE_LABELS = ['Panicking', 'Shaky', 'Okay', 'Solid', 'Exam-ready'] as const;

export default function PortalEngagementRow({ profile }: Props) {
  const navigate = useNavigate();
  const hasSubjects = profile.curriculum.subjects.length > 0;
  const subjects = hasSubjects ? profile.curriculum.subjects.slice(0, 4) : [];
  const [confidence, setConfidence] = useState(() => getConfidenceRatings(subjects));
  const [capture, setCapture] = useState('');
  const terms = getCommandTermsForBoard(profile.curriculum.board);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillRevealed, setDrillRevealed] = useState(false);
  const term = terms[drillIndex % terms.length];

  const sendToApex = () => {
    const text = capture.trim();
    if (!text) return;
    sessionStorage.setItem('vertex_apex_prefill', text);
    navigate('/chatbot');
  };

  const nextDrill = () => {
    setDrillRevealed(false);
    setDrillIndex((i) => (i + 1) % terms.length);
  };

  return (
    <div className="portal-engagement-row portal-rise portal-stagger-2">
      <PortalWidget id="quick-capture" span={1}>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquarePlus className="h-4 w-4 text-primary" aria-hidden />
          <p className="text-sm font-semibold">Quick Capture</p>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Jot a doubt mid-session — Apex opens with your question ready.
        </p>
        <textarea
          value={capture}
          onChange={(e) => setCapture(e.target.value)}
          placeholder="What's confusing you right now?"
          className="portal-capture-input w-full min-h-[4.5rem] resize-none"
          rows={3}
        />
        <button
          type="button"
          onClick={sendToApex}
          disabled={!capture.trim()}
          className="btn-solid text-sm mt-3 w-full inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Bot className="h-3.5 w-3.5" />
          Send to Apex
        </button>
      </PortalWidget>

      <PortalWidget id="confidence-checkin" span={1}>
        <p className="text-sm font-semibold mb-1">Confidence Check-in</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          How exam-ready does each subject feel?
        </p>
        <p className="text-[10px] text-muted-foreground mb-3 flex flex-wrap gap-x-2 gap-y-0.5">
          {CONFIDENCE_LABELS.map((label, i) => (
            <span key={label}>
              <span className="text-primary font-medium">{i + 1}</span> {label}
            </span>
          ))}
        </p>
        {hasSubjects ? (
          <div className="space-y-3">
            {confidence.map((row) => (
              <div key={row.subject}>
                <p className="text-xs text-muted-foreground mb-1.5 truncate">{row.subject}</p>
                <div className="flex gap-1">
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${row.subject} confidence ${n} of 5 — ${CONFIDENCE_LABELS[n - 1]}`}
                      onClick={() => {
                        setConfidenceRating(row.subject, n);
                        setConfidence(getConfidenceRatings(subjects));
                      }}
                      className={`portal-confidence-dot ${row.rating >= n ? 'portal-confidence-dot-active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-4 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Add your subjects in settings to rate confidence per subject — we use this in your adaptive plan.
            </p>
            <Link to="/user-settings" className="btn-glass text-xs inline-flex items-center gap-1.5">
              <Settings className="h-3 w-3" />
              Add subjects
            </Link>
          </div>
        )}
      </PortalWidget>

      <PortalWidget id="command-drill" span={1}>
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="text-sm font-semibold">Command Word Drill</p>
          <button
            type="button"
            onClick={nextDrill}
            className="text-muted-foreground hover:text-primary transition"
            aria-label="Next term"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {profile.curriculum.board
            ? 'Mark-scheme verbs for your board — tap to reveal, then try using it in an answer.'
            : 'Set your exam board in settings for board-specific command terms.'}
        </p>
        <button
          type="button"
          onClick={() => setDrillRevealed((r) => !r)}
          className="w-full text-left portal-drill-card"
        >
          <p className="text-lg font-bold text-primary">{term.term}</p>
          {drillRevealed ? (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{term.definition}</p>
          ) : (
            <p className="text-xs text-muted-foreground mt-2 italic">Tap to reveal mark-scheme meaning</p>
          )}
        </button>
      </PortalWidget>
    </div>
  );
}
