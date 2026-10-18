import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { MessageSquarePlus, RefreshCw, Settings } from 'lucide-react';
import { getCommandTermsForBoard } from '@/lib/commandTerms';
import { getConfidenceRatings, setConfidenceRating } from '@/lib/portalFeatures';
import type { LearnerProfile } from '@/lib/learnerProfile';
import { useAuth } from '@/contexts/AuthContext';
import ApexAvatar from '@/components/chat/ApexAvatar';
import { storeApexPrefill } from '@/lib/apexPrefillStorage.mjs';
import { toast } from '@/hooks/use-toast';
import PortalWidget from '@/components/portal/PortalWidget';

type Props = {
  profile: LearnerProfile;
};

const CONFIDENCE_LABELS = ['Very unsure', 'Unsure', 'Mixed', 'Confident', 'Very confident'] as const;

export default function PortalEngagementRow({ profile }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const hasSubjects = profile.curriculum.subjects.length > 0;
  const subjects = hasSubjects ? profile.curriculum.subjects.slice(0, 4) : [];
  const [confidence, setConfidence] = useState(() => getConfidenceRatings(subjects));
  const [capture, setCapture] = useState('');
  const terms = getCommandTermsForBoard(profile.curriculum.board);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillRevealed, setDrillRevealed] = useState(false);
  const term = terms.length ? terms[drillIndex % terms.length] : null;

  const sendToApex = () => {
    const text = capture.trim();
    if (!text) return;
    if (!storeApexPrefill(window, user?.id ?? null, text)) {
      toast({
        title: 'Could not carry this question into Apex',
        description: 'Temporary browser storage is unavailable. Open the AI Tutor and paste your question instead.',
        variant: 'destructive',
      });
      return;
    }
    navigate('/chatbot');
  };

  const nextDrill = () => {
    if (!terms.length) return;
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
          Keep a question beside your session. Apex opens with your draft ready.
        </p>
        <label htmlFor="member-quick-capture" className="sr-only">Question for Apex</label>
        <textarea
          id="member-quick-capture"
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
          <ApexAvatar className="apex-avatar-inline" />
          Send to Apex
        </button>
      </PortalWidget>

      <PortalWidget id="confidence-checkin" span={1}>
        <p className="text-sm font-semibold mb-1">Confidence check-in</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          How confident do you feel in each subject today?
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
                <div className="portal-confidence-heading">
                  <p>{row.subject}</p>
                  <span>{row.rating === null ? 'Not set' : CONFIDENCE_LABELS[row.rating - 1]}</span>
                </div>
                <div className="portal-confidence-scale" role="radiogroup" aria-label={`${row.subject} confidence`}>
                  {([1, 2, 3, 4, 5] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      role="radio"
                      aria-checked={row.rating === n}
                      aria-label={`${row.subject} confidence ${n} of 5 - ${CONFIDENCE_LABELS[n - 1]}`}
                      onClick={() => {
                        setConfidenceRating(row.subject, n);
                        setConfidence(getConfidenceRatings(subjects));
                      }}
                      className={`portal-confidence-dot ${row.rating === n ? 'portal-confidence-dot-active' : ''}`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/60 bg-foreground/[0.03] p-4 text-center">
            <p className="text-xs text-muted-foreground mb-3">
              Add subjects in settings to record a confidence check-in. Apex can use a saved low-confidence subject when you ask for help.
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
          <p className="text-sm font-semibold">Command word drill</p>
          {term && <button
            type="button"
            onClick={nextDrill}
            className="text-muted-foreground hover:text-primary transition"
            aria-label="Next term"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>}
        </div>
        {term ? (
          <>
            <p className="text-xs text-muted-foreground mb-3">
              {profile.curriculum.board
                ? 'Review a board command word, then try using it in an answer.'
                : 'Set your exam board in settings for board-specific command terms.'}
            </p>
            <button
              type="button"
              onClick={() => setDrillRevealed((r) => !r)}
              className="w-full text-left portal-drill-card"
              aria-expanded={drillRevealed}
            >
              <p className="text-lg font-bold text-primary">{term.term}</p>
              {drillRevealed ? (
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{term.definition}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-2">Show meaning</p>
              )}
            </button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Command term definitions are awaiting subject review. Check your course’s current official guidance.
          </p>
        )}
      </PortalWidget>
    </div>
  );
}
