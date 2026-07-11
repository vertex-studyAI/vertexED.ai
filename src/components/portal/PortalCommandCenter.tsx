import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Flame, Sparkles, Target } from 'lucide-react';
import type { EcosystemBrief } from '@/lib/studyEcosystem';
import type { RetrievalPulse } from '@/lib/retrievalPulse';
import type { PortalIntelligence } from '@/lib/portalFeatures';
import ExamReadinessRing from '@/components/dashboard/ExamReadinessRing';
import ExamCountdown from '@/components/curriculum/ExamCountdown';
import BoardBadge from '@/components/curriculum/BoardBadge';
import LiquidGlass from '@/components/LiquidGlass';
import {
  getPersonalizedSubline,
  getProfileCompleteness,
  gradeLevelLabel,
  studyGoalLabel,
} from '@/lib/learnerProfile';

type Props = {
  brief: EcosystemBrief;
  pulse: RetrievalPulse;
  intel: PortalIntelligence;
};

export default function PortalCommandCenter({ brief, pulse, intel }: Props) {
  const goalLabel = studyGoalLabel(brief.profile.studyGoal);
  const gradeLabel = gradeLevelLabel(brief.profile.gradeLevel);
  const board = brief.profile.curriculum.board;
  const completeness = getProfileCompleteness(brief.profile);
  const subline = getPersonalizedSubline(brief.profile);

  return (
    <LiquidGlass
      id="retrieval-pulse"
      as="section"
      variant="hero"
      className="portal-command-center portal-rise px-6 md:px-10 py-10 md:py-14"
    >
      <div className="max-w-6xl mx-auto portal-command-inner">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          <div className="flex-1 min-w-0">
            <p className="portal-eyebrow mb-3">
              <Sparkles className="h-3.5 w-3.5 inline mr-1.5 -mt-0.5" aria-hidden />
              Your dashboard · {intel.readinessIndex}% · {intel.readinessLabel}
            </p>
            <h1 className="portal-hero-title">
              {brief.greeting}, {brief.profile.displayName}
            </h1>
            <p id="apex-brief" className="portal-hero-brief mt-3">{intel.apexBrief}</p>
            <p className="text-sm text-muted-foreground/90 mt-2 max-w-2xl leading-relaxed">{subline}</p>

            <div className="flex flex-wrap gap-2 mt-5">
              {board && <BoardBadge board={board} />}
              {goalLabel && <span className="portal-chip">{goalLabel}</span>}
              {gradeLabel && <span className="portal-chip-muted">{gradeLabel}</span>}
              <span className="portal-chip-muted inline-flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-400" aria-hidden />
                {brief.stats.studyStreak}d streak
              </span>
              <span id="focus-score" className="portal-chip-muted inline-flex items-center gap-1">
                <Target className="h-3 w-3 text-primary" aria-hidden />
                Focus {intel.focusScore}
              </span>
            </div>

            {completeness.score < 100 && completeness.nudge && (
              <div className="portal-profile-nudge mt-5">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-medium text-foreground">Profile {completeness.score}% complete</p>
                  <Link to="/user-settings" className="text-xs text-primary hover:underline">
                    Finish setup →
                  </Link>
                </div>
                <div className="portal-profile-bar" aria-hidden>
                  <div className="portal-profile-bar-fill" style={{ width: `${completeness.score}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2">{completeness.nudge}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to={pulse.nextAction.href} className="btn-solid inline-flex items-center gap-2">
                {pulse.nextAction.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="btn-glass inline-flex items-center gap-2"
                onClick={() => {
                  sessionStorage.setItem('vertex_apex_prefill', pulse.apexPrompt);
                  window.location.assign('/chatbot');
                }}
              >
                <Bot className="h-4 w-4" />
                Ask Apex
              </button>
              <Link to="/learning-hub" className="btn-glass text-sm">
                Learning Hub →
              </Link>
            </div>
          </div>

          <div className="portal-command-rings shrink-0 w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-4 items-center">
            <div className="portal-ring-card">
              <ExamReadinessRing readiness={pulse.readiness} size="md" ringOnly />
              <p className="text-xs text-muted-foreground mt-2 text-center">Exam readiness</p>
            </div>
            <div className="portal-ring-card">
              <div
                className="portal-daily-ring mx-auto"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${brief.dailyProgress}%, hsl(var(--foreground) / 0.08) ${brief.dailyProgress}%)`,
                }}
              >
                <div className="portal-daily-ring-inner">
                  <span className="text-2xl font-bold tabular-nums">{brief.dailyProgress}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">today</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Daily loop</p>
            </div>
            <ExamCountdown
              examDate={brief.profile.curriculum.examDate}
              boardLabel={brief.boardLabel}
            />
          </div>
        </div>

        <div className="portal-streak-row mt-8" aria-label="7-day study rhythm">
          {intel.streakCalendar.map((day) => (
            <div
              key={day.date}
              className={`portal-streak-day ${day.active ? 'portal-streak-day-active' : ''}`}
              title={day.date}
            />
          ))}
        </div>
      </div>
    </LiquidGlass>
  );
}
