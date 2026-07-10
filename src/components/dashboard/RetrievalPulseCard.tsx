import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Zap } from 'lucide-react';
import type { RetrievalPulse } from '@/lib/retrievalPulse';
import LiquidGlass from '@/components/LiquidGlass';
import ExamReadinessRing from '@/components/dashboard/ExamReadinessRing';
import StudyLoopRing from '@/components/dashboard/StudyLoopRing';
import ApexPromptChips from '@/components/chat/ApexPromptChips';
import { getStudyContext } from '@/lib/studyContext';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { LOOP_STEPS } from '@/lib/studyLoopTracker';

type Props = {
  pulse: RetrievalPulse;
  className?: string;
};

const URGENCY_STYLES = {
  low: 'border-border/50 bg-foreground/[0.02]',
  medium: 'border-amber-400/25 bg-amber-500/8',
  high: 'border-rose-400/30 bg-rose-500/10',
};

export default function RetrievalPulseCard({ pulse, className }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const context = getStudyContext('/main', user);

  const askApex = () => {
    sessionStorage.setItem('vertex_apex_prefill', pulse.apexPrompt);
    navigate('/chatbot');
  };

  return (
    <LiquidGlass as="section" variant="panel" className={cn('retrieval-pulse-card rounded-2xl', className)}>
      <div className="retrieval-pulse-glow" aria-hidden />

      <div className="relative p-5 md:p-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-primary" aria-hidden />
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium">Retrieval Pulse</p>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-foreground leading-tight mb-2">
            {pulse.headline}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xl">
            {pulse.narrative}
          </p>

          {pulse.loopGap && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
              Loop gap: missing <span className="font-semibold">{LOOP_STEPS.find((s) => s.id === pulse.loopGap)?.label ?? pulse.loopGap}</span> this week
            </p>
          )}

          <div className="flex flex-wrap gap-2 mb-5">
            {pulse.signals.map((s) => (
              <span
                key={`${s.label}-${s.value}`}
                className={cn('pulse-signal-chip', URGENCY_STYLES[s.urgency])}
              >
                <span className="text-muted-foreground">{s.label}</span>
                <span className="text-foreground font-medium ml-1">{s.value}</span>
              </span>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
            <p className="text-xs uppercase tracking-widest text-primary mb-1">Next best move</p>
            <p className="font-semibold text-foreground">{pulse.nextAction.label}</p>
            <p className="text-sm text-muted-foreground mt-1">{pulse.nextAction.reason}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link to={pulse.nextAction.href} className="btn-solid text-sm inline-flex items-center gap-1.5">
                Go
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button type="button" onClick={askApex} className="btn-glass text-sm inline-flex items-center gap-1.5">
                <Bot className="h-3.5 w-3.5" />
                Ask Apex why
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-foreground/[0.02] p-4">
            <ExamReadinessRing readiness={pulse.readiness} showFactors />
          </div>
          <StudyLoopRing />
        </div>
      </div>

      <div className="relative border-t border-border/40 px-5 py-4 md:px-6 bg-foreground/[0.02]">
        <p className="text-xs text-muted-foreground mb-2">Quick asks for Apex</p>
        <ApexPromptChips
          context={context}
          compact
          onSelect={(text) => {
            sessionStorage.setItem('vertex_apex_prefill', text);
            navigate('/chatbot');
          }}
        />
      </div>
    </LiquidGlass>
  );
}
