import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Download,
  Gauge,
  Layers,
  Moon,
  Radar,
  Shuffle,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import type { PortalIntelligence } from '@/lib/portalFeatures';
import { exportLearnerSnapshot, getExamNightDone, toggleExamNightItem } from '@/lib/portalFeatures';
import type { LearnerProfile } from '@/lib/learnerProfile';
import type { StudyStats } from '@/lib/studyStats';
import PortalWidget from '@/components/portal/PortalWidget';

type Props = {
  intel: PortalIntelligence;
  profile: LearnerProfile;
  stats: StudyStats;
};

export default function PortalIntelligenceGrid({ intel, profile, stats }: Props) {
  const [examNightDone, setExamNightDone] = useState(() => getExamNightDone());

  const toggleExamItem = (id: string) => {
    setExamNightDone(toggleExamNightItem(id));
  };

  return (
    <div className="portal-bento-grid">
      <PortalWidget id="readiness-benchmark" span={1}>
        <WidgetHeader icon={<Target className="h-4 w-4" />} title="Readiness Index" subtitle="From your study signals" />
        {intel.readinessIndex != null ? (
          <>
            <p className="text-3xl font-bold mt-3 tabular-nums text-primary">{intel.readinessIndex}%</p>
            <p className="text-sm text-foreground/90 mt-1">{intel.readinessLabel}</p>
          </>
        ) : (
          <p className="text-2xl font-bold mt-3 tabular-nums text-muted-foreground">—</p>
        )}
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Built from due cards, loop completion, and recent review scores — your data, not a comparison to other users.
          Anything can happen on exam day; treat this as a study guide, not a prediction.
        </p>
      </PortalWidget>

      <PortalWidget id="memory-decay" span={1}>
        <WidgetHeader icon={<Radar className="h-4 w-4" />} title="Memory Decay Radar" subtitle="Topics going cold" />
        {intel.memoryDecay.length > 0 ? (
          <ul className="space-y-2 mt-3">
            {intel.memoryDecay.map((m) => (
              <li key={`${m.subject}-${m.topic}`} className="portal-mini-row">
                <Link
                  to={`/answer-reviewer?subject=${encodeURIComponent(m.subject)}&topic=${encodeURIComponent(m.topic)}`}
                  className="text-sm truncate flex-1 hover:text-primary transition-colors"
                >
                  {m.topic}
                </Link>
                <span className="text-xs text-rose-400 shrink-0">{m.daysSince}d</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">
            No fading topics yet — keep retrieving on schedule and this stays empty.
          </p>
        )}
        <Link to="/notetaker?mode=study" className="portal-widget-cta mt-3">Review flashcards →</Link>
      </PortalWidget>

      <PortalWidget id="marks-gap" span={1}>
        <WidgetHeader icon={<Gauge className="h-4 w-4" />} title="Marks Gap" subtitle="Distance to 80% target" />
        {intel.marksGaps.length > 0 ? (
          <ul className="space-y-2.5 mt-3">
            {intel.marksGaps.map((g) => (
              <li key={g.subject}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium truncate">{g.subject}</span>
                  <span className="text-muted-foreground tabular-nums">{g.current}% → {g.target}%</span>
                </div>
                <div className="portal-progress-track">
                  <div className="portal-progress-fill" style={{ width: `${g.current}%` }} />
                  <div className="portal-progress-target" style={{ left: `${g.target}%` }} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">
            Submit answer reviews to map how far each subject is from exam-ready marks.
          </p>
        )}
        <Link
          to={`/paper-maker${intel.marksGaps[0] ? `?subject=${encodeURIComponent(intel.marksGaps[0].subject)}` : ''}`}
          className="portal-widget-cta mt-3"
        >
          Practice weak subject →
        </Link>
      </PortalWidget>

      <PortalWidget id="revision-velocity" span={1}>
        <WidgetHeader icon={<TrendingUp className="h-4 w-4" />} title="Revision Velocity" subtitle="Mastery trend this week" />
        {intel.revisionVelocity.label.startsWith('Complete a few reviews') ? (
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{intel.revisionVelocity.label}</p>
        ) : (
          <>
            <p
              className={`text-2xl font-bold mt-3 tabular-nums ${
                intel.revisionVelocity.trend === 'up'
                  ? 'text-emerald-500'
                  : intel.revisionVelocity.trend === 'down'
                    ? 'text-rose-400'
                    : 'text-foreground'
              }`}
            >
              {intel.revisionVelocity.delta > 0 ? '+' : ''}
              {intel.revisionVelocity.delta}%
            </p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{intel.revisionVelocity.label}</p>
          </>
        )}
      </PortalWidget>

      <PortalWidget id="interleave-mixer" span={1}>
        <WidgetHeader icon={<Shuffle className="h-4 w-4" />} title="Interleave Mixer" subtitle="Two subjects tonight" />
        {intel.interleave.subjects.length >= 2 ? (
          <>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {intel.interleave.subjects.map((s, i) => (
                <span key={`${s}-${i}`} className="portal-chip">
                  {i > 0 && <span className="text-muted-foreground mr-1">↔</span>}
                  {s}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{intel.interleave.reason}</p>
            <Link to="/study-zone?focus=timer" className="portal-widget-cta mt-3">Start mixed session →</Link>
          </>
        ) : (
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{intel.interleave.reason}</p>
        )}
      </PortalWidget>

      {intel.weakSprint && (
        <PortalWidget id="weak-sprint" span={1}>
          <WidgetHeader
            icon={<Timer className="h-4 w-4" />}
            title="Weak Topic Sprint"
            subtitle={`${intel.weakSprint.minutes} min on weak topic`}
          />
          <p className="text-sm font-semibold text-foreground mt-3">{intel.weakSprint.topic}</p>
          <p className="text-xs text-muted-foreground">{intel.weakSprint.subject}</p>
          <Link to={intel.weakSprint.href} className="btn-solid text-sm mt-4 inline-flex items-center gap-1.5">
            Start sprint <Zap className="h-3.5 w-3.5" />
          </Link>
        </PortalWidget>
      )}

      <PortalWidget id="flashcard-heatmap" span={1}>
        <WidgetHeader icon={<Layers className="h-4 w-4" />} title="Flashcard Heatmap" subtitle={`${intel.dueFlashcards} due`} />
        {intel.flashcardHeatmap.length > 0 ? (
          <ul className="space-y-2 mt-3">
            {intel.flashcardHeatmap.map((b) => (
              <li key={b.label} className="portal-mini-row">
                <span className="text-sm truncate">{b.label}</span>
                <span className="text-xs font-medium text-primary">{b.due}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-3">No due cards — generate flashcards from your notes first.</p>
        )}
        <Link to="/notetaker?mode=study" className="portal-widget-cta mt-3">Open study deck →</Link>
      </PortalWidget>

      {intel.loopClosure && (
        <PortalWidget id="loop-closure" span={1}>
          <WidgetHeader icon={<AlertTriangle className="h-4 w-4 text-amber-400" />} title="Loop Closure" subtitle="Missing this week" />
          <p className="text-sm font-medium mt-3">
            You haven&apos;t <span className="text-primary">{intel.loopClosure.label}</span> yet this week.
          </p>
          <Link to={intel.loopClosure.href} className="portal-widget-cta mt-3">
            Close the loop <ArrowRight className="h-3 w-3 inline" />
          </Link>
        </PortalWidget>
      )}

      <PortalWidget id="board-tips" span={1}>
        <WidgetHeader icon={<Brain className="h-4 w-4" />} title="Board Mark Tip" subtitle="Examiner logic" />
        <p className="text-sm text-foreground/90 mt-3 leading-relaxed">{intel.boardTip}</p>
      </PortalWidget>

      {intel.examNight.active && (
        <PortalWidget id="exam-night" span={2}>
          <WidgetHeader icon={<Moon className="h-4 w-4" />} title="Exam Night Protocol" subtitle="72 hours or less" />
          <p className="text-xs text-muted-foreground mt-2 mb-3">
            Check items off as you go — your progress saves on this device.
          </p>
          <ul className="mt-2 space-y-2">
            {intel.examNight.items.map((item) => {
              const checked = examNightDone.has(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggleExamItem(item.id)}
                    className={`portal-exam-check w-full text-left ${checked ? 'portal-exam-check-done' : ''}`}
                  >
                    <span className="portal-exam-check-box" aria-hidden>
                      {checked ? '✓' : ''}
                    </span>
                    <span className={checked ? 'line-through text-muted-foreground' : 'text-foreground/90'}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </PortalWidget>
      )}

      <PortalWidget id="data-export" span={1}>
        <WidgetHeader icon={<Download className="h-4 w-4" />} title="Data Portability" subtitle="Your learner JSON" />
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Export weakness, progress, confidence ratings, and loop data — yours to keep or share with a tutor.
        </p>
        <button
          type="button"
          className="btn-glass text-sm mt-4"
          onClick={() => exportLearnerSnapshot(profile, stats)}
        >
          Download snapshot
        </button>
      </PortalWidget>
    </div>
  );
}

function WidgetHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="portal-widget-icon">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
