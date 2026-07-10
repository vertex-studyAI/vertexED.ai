import type { ReactNode } from 'react';
import { useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  CheckCircle2,
  FileText,
  Flame,
  MessageCircle,
  Route,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';

import PageSection from '@/components/PageSection';
import NeumorphicCard from '@/components/NeumorphicCard';
import CramModePanel from '@/components/CramModePanel';
import AdaptiveLearningPanel from '@/components/AdaptiveLearningPanel';
import CommandTermsGlossary from '@/components/curriculum/CommandTermsGlossary';
import { useAuth } from '@/contexts/AuthContext';
import { buildEcosystemBrief } from '@/lib/studyEcosystem';
import {
  gradeLevelLabel,
  studyGoalLabel,
  type LearningPathStep,
} from '@/lib/learnerProfile';
import { getTracksForBoard } from '@/lib/curriculum';

const PHASE_STYLES: Record<LearningPathStep['phase'], string> = {
  learn: 'from-sky-500/20 to-blue-600/10 border-sky-400/25',
  practice: 'from-violet-500/20 to-purple-600/10 border-violet-400/25',
  review: 'from-amber-500/20 to-orange-600/10 border-amber-400/25',
  remember: 'from-emerald-500/20 to-teal-600/10 border-emerald-400/25',
};

export default function LearningHub() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const brief = useMemo(() => buildEcosystemBrief(user), [user]);
  const cramFromUrl = searchParams.get('mode') === 'cram';

  useEffect(() => {
    if (!cramFromUrl) return;
    document.getElementById('cram-mode')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [cramFromUrl]);

  const goalLabel = studyGoalLabel(brief.profile.studyGoal);
  const gradeLabel = gradeLevelLabel(brief.profile.gradeLevel);
  const board = brief.profile.curriculum.board;
  const subjectTracks = getTracksForBoard(board);

  return (
    <>
      <Helmet>
        <title>Learning Hub — VertexED</title>
        <meta
          name="description"
          content="Your connected study ecosystem — learning paths, subject tracks, and daily progress across Vertex tools."
        />
        <link rel="canonical" href="https://www.vertexed.app/learning-hub" />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <PageSection className="max-w-5xl space-y-8">
        <header className="glass-panel p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary/80 mb-2">Learning ecosystem</p>
              <h1 className="text-3xl md:text-4xl font-semibold brand-text-gradient">
                {brief.greeting}, {brief.profile.displayName}
              </h1>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                One connected journey across notes, practice, review, and memory — built around how you actually study.
              </p>
              {(goalLabel || gradeLabel || board) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {board && <BoardBadge board={board} />}
                  {goalLabel && (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs text-primary">
                      {goalLabel}
                    </span>
                  )}
                  {gradeLabel && (
                    <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                      {gradeLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-center shrink-0">
              <div
                className="relative mx-auto h-20 w-20 rounded-full border border-white/15 bg-white/5 flex items-center justify-center"
                style={{
                  background: `conic-gradient(hsl(var(--primary)) ${brief.dailyProgress}%, transparent ${brief.dailyProgress}%)`,
                }}
              >
                <div className="absolute inset-1.5 rounded-full bg-background/90 flex flex-col items-center justify-center">
                  <span className="text-lg font-semibold">{brief.dailyProgress}%</span>
                  <span className="text-[10px] text-muted-foreground">today</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <ExamCountdown examDate={brief.profile.curriculum.examDate} boardLabel={brief.boardLabel} />

        <div id="cram-mode">
          <CramModePanel board={board} examDaysLeft={brief.examDaysLeft} />
        </div>

        <AdaptiveLearningPanel
          recommendations={brief.adaptivePlan.recommendations}
          cramModeActive={brief.adaptivePlan.cramModeActive}
          estimatedMinutes={brief.adaptivePlan.estimatedMinutesToday}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <HubStat icon={<Flame className="h-4 w-4 text-orange-400" />} label="Streak" value={`${brief.stats.studyStreak}d`} />
          <HubStat icon={<Target className="h-4 w-4 text-primary" />} label="Habits" value={`${brief.stats.habitsDoneToday}/${brief.stats.habitCount}`} />
          <HubStat icon={<Brain className="h-4 w-4 text-violet-400" />} label="Due cards" value={String(brief.dueFlashcards)} />
          <HubStat icon={<Calendar className="h-4 w-4 text-emerald-400" />} label="Today" value={String(brief.todayTasks.length)} />
        </div>

        <NeumorphicCard className="p-6" title="Your learning path">
          <p className="text-sm text-muted-foreground mb-5">
            A recommended flow based on your goals — read, practice, review, and remember.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {brief.learningPath.map((step, index) => (
              <Link
                key={step.title}
                to={step.to}
                className={`group rounded-xl border bg-gradient-to-br p-4 transition hover:scale-[1.01] ${PHASE_STYLES[step.phase]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Step {index + 1} · {step.phase}
                    </p>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </NeumorphicCard>

        <NeumorphicCard className="p-6" title={board ? `${brief.boardLabel} subject tracks` : 'Subject tracks'}>
          <p className="text-sm text-muted-foreground mb-5">
            {board
              ? 'Paths tuned to your exam board — from content to practice.'
              : 'Set your board in settings for personalized subject tracks.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {subjectTracks.map((track) => (
              <div key={track.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <Link to={track.to} className="font-medium hover:text-primary transition">
                  {track.title}
                </Link>
                <div className="mt-3 flex flex-wrap gap-2">
                  {track.tools.map((tool) => (
                    <Link
                      key={tool.label}
                      to={tool.to}
                      className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition"
                    >
                      {tool.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </NeumorphicCard>

        <div className="grid md:grid-cols-2 gap-6">
          <NeumorphicCard className="p-6" title="Ecosystem workflow">
            <div className="space-y-3 text-sm">
              {[
                { icon: BookOpen, label: 'Learn', detail: 'Archives, resources, and AI notes', to: '/archives' },
                { icon: FileText, label: 'Practice', detail: 'Mock papers and quizzes', to: '/paper-maker' },
                { icon: CheckCircle2, label: 'Review', detail: 'Rubric feedback and chat', to: '/answer-reviewer' },
                { icon: Sparkles, label: 'Remember', detail: 'Flashcards and spaced repetition', to: '/notetaker' },
              ].map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 hover:border-primary/25 transition"
                >
                  <item.icon className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                </Link>
              ))}
            </div>
          </NeumorphicCard>

          <NeumorphicCard className="p-6" title="Quick launch">
            <div className="grid gap-2">
              <HubAction to="/study-zone?focus=timer" icon={<Zap className="h-4 w-4" />} label="Focus session" />
              <HubAction to="/planner" icon={<Calendar className="h-4 w-4" />} label="Open planner" />
              <HubAction to="/chatbot" icon={<MessageCircle className="h-4 w-4" />} label="Ask AI tutor" />
              <HubAction to="/main" icon={<Route className="h-4 w-4" />} label="Back to dashboard" />
            </div>
            {brief.suggestions.length > 0 && (
              <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground border-t border-white/10 pt-4">
                {brief.suggestions.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            )}
          </NeumorphicCard>
        </div>
      </PageSection>
    </>
  );
}

function HubStat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon}
        {label}
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function HubAction({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm hover:border-primary/25 hover:bg-primary/5 transition"
    >
      {icon}
      {label}
      <ArrowRight className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
    </Link>
  );
}
