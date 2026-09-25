import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Library, PenLine } from "lucide-react";

import ContinueSessionBanner from "@/components/ContinueSessionBanner";
import LiquidGlass from "@/components/LiquidGlass";
import SavedWorkList from "@/components/SavedWorkList";
import StudyToolbox from "@/components/dashboard/StudyToolbox";
import "@/styles/study-desk.css";
import LearningToday from "@/components/dashboard/LearningToday";
import TodayPlanPanel from "@/components/dashboard/TodayPlanPanel";
import LearningCommandCenter from "@/components/dashboard/LearningCommandCenter";
import { useAuth } from "@/contexts/AuthContext";
import { buildEcosystemBrief, type EcosystemBrief } from "@/lib/studyEcosystem";
import { buildTodayPlanItems } from "@/lib/todayPlan";
import {
  getLocalArtifactCount,
  listStudyArtifactsDetailed,
  syncLocalStudyArtifacts,
  type StudyArtifact,
} from "@/lib/userContent";
import { getPendingMockReview, type PendingMockReview } from "@/lib/examFlow";
import { getDueRetries, getRetryQueue, retryTargetRoute, type RetryItem } from "@/lib/retryQueue";
import { getWeaknessHeatmap, type TopicHeat } from "@/lib/weaknessTracker";
import { getPendingLearnerStateCount, hydrateLearnerState, syncLearnerState } from "@/lib/learnerStateSync";

export default function Main() {
  const { user } = useAuth();
  const [brief, setBrief] = useState<EcosystemBrief | null>(null);
  const [recentArtifacts, setRecentArtifacts] = useState<StudyArtifact[]>([]);
  const [retries, setRetries] = useState<RetryItem[]>([]);
  const [weaknesses, setWeaknesses] = useState<TopicHeat[]>([]);
  const [pendingMock, setPendingMock] = useState<PendingMockReview | null>(null);
  const [localSaveCount, setLocalSaveCount] = useState(0);
  const [cloudUnavailable, setCloudUnavailable] = useState(false);
  const [workLoading, setWorkLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    let request = 0;
    setRecentArtifacts([]);
    setWorkLoading(true);
    const refresh = () => {
      setBrief(buildEcosystemBrief(user));
      setRetries(getRetryQueue());
      setWeaknesses(getWeaknessHeatmap(6));
      setPendingMock(getPendingMockReview());
      setLocalSaveCount(getLocalArtifactCount() + getPendingLearnerStateCount());
    };
    const refreshArtifacts = async () => {
      const ticket = ++request;
      try {
        const result = await listStudyArtifactsDetailed();
        if (cancelled || ticket !== request) return;
        setRecentArtifacts(result.items.slice(0, 4));
        setCloudUnavailable(result.cloudUnavailable === true || !result.ok);
        setLocalSaveCount(getLocalArtifactCount() + getPendingLearnerStateCount());
      } catch {
        if (!cancelled && ticket === request) setCloudUnavailable(true);
      } finally {
        if (!cancelled && ticket === request) setWorkLoading(false);
      }
    };
    refresh();
    void refreshArtifacts();
    const onFocus = () => {
      refresh();
      void refreshArtifacts();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("vertexed:learner-state-changed", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("vertexed:learner-state-changed", onFocus);
    };
  }, [user]);

  const todayItems = brief ? buildTodayPlanItems(brief.todayTasks, brief.adaptivePlan.recommendations) : [];
  const dueFlashcards = brief?.dueFlashcards ?? 0;
  const dueRetries = getDueRetries().length;
  const nextRetry = getDueRetries()[0];
  const nextAction = pendingMock
    ? { to: pendingMock.status === 'in_progress' ? '/paper-maker?resumeMock=1' : '/answer-reviewer', label: pendingMock.status === 'in_progress' ? 'Resume your mock' : 'Review your mock' }
    : nextRetry ? { to: retryTargetRoute(nextRetry), label: `Retry ${nextRetry.topic}` }
    : recentArtifacts.length ? { to: `/saved-work?item=${encodeURIComponent(recentArtifacts[0].id)}`, label: 'Continue your latest work' }
    : { to: '/study-notebook?start=1', label: 'Start your first study session' };
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <>
      <Helmet>
        <title>Study dashboard | VertexED</title>
        <meta name="description" content="Choose a study task: plan, focus, make notes, practise, get feedback, or ask for help." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="dashboard-shell study-desk mx-auto w-full max-w-7xl space-y-7 pb-6">
        <section className="desk-header">
          <div className="desk-header-layout">
          <div className="dashboard-hero-copy">
            <p className="dashboard-kicker">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p>
            <h1>Your study desk<span className="desk-title-dot" aria-hidden>.</span></h1>
            <p className="dashboard-hero-text">A little focus. A useful attempt. Pick up where you left off.</p>
            <div className="dashboard-hero-actions">
              <Link to={workLoading ? "/study-notebook" : nextAction.to} className="dashboard-primary-action">
                {workLoading ? "Open your study notebook" : nextAction.label} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link to="/planner" className="dashboard-secondary-action">Open planner</Link>
            </div>
          </div>
          <aside className="desk-review-note" aria-label="Your revision queue">
            <span className="dashboard-kicker">Keep the thread</span>
            <p>Come back to<br /><em>what you missed.</em></p>
            <Link to="/learn?tab=mistakes">Open your mistake notebook <ArrowRight size={16} aria-hidden /></Link>
            <div className="desk-queue-counts"><span><strong>{todayItems.length}</strong> next steps</span><Link to="/notetaker"><strong>{dueFlashcards}</strong> cards due</Link><Link to="/exam-prep"><strong>{dueRetries}</strong> retries due</Link></div>
          </aside>
          </div>
        </section>

        <LearningToday key={user?.id} />

        <ContinueSessionBanner />

        {!workLoading && Boolean(retries.length || weaknesses.length || pendingMock || localSaveCount || cloudUnavailable || syncMessage) && <LearningCommandCenter
          retries={retries}
          weaknesses={weaknesses}
          pendingMock={pendingMock}
          localSaveCount={localSaveCount}
          cloudUnavailable={cloudUnavailable}
          syncing={syncing}
          syncMessage={syncMessage}
          onRetrySync={() => {
            setSyncing(true);
            setSyncMessage(undefined);
            void Promise.all([syncLocalStudyArtifacts(), syncLearnerState()])
              .then(async ([artifactResult, stateResult]) => {
                await hydrateLearnerState();
                const refreshed = await listStudyArtifactsDetailed();
                setRecentArtifacts(refreshed.items.slice(0, 4));
                setCloudUnavailable(refreshed.cloudUnavailable === true);
                const synced = artifactResult.synced + stateResult.synced;
                const remaining = artifactResult.remaining + stateResult.remaining;
                setLocalSaveCount(remaining);
                setSyncMessage(remaining === 0
                  ? `${synced} device save${synced === 1 ? '' : 's'} synced.`
                  : `${synced} synced; ${remaining} still safe on this device.`);
              })
              .catch(() => setSyncMessage("Sync could not finish. Your device copies are preserved; try again."))
              .finally(() => setSyncing(false));
          }}
        />}

        <section className="desk-recent" aria-labelledby="recent-work-heading">
          <div className="dashboard-section-heading">
            <h2 id="recent-work-heading">Continue studying</h2>
            <Link to="/saved-work" className="text-link">View all saved work</Link>

          </div>
          {workLoading ? <p role="status">Loading your saved work…</p> : recentArtifacts.length > 0 ? (
            <SavedWorkList
              items={recentArtifacts}
              compact
              variant="dashboard"
              onChanged={() => void listStudyArtifactsDetailed().then(({ items }) => setRecentArtifacts(items.slice(0, 4)))}
            />
          ) : (
            <div className="desk-first-session">
              <div><h3>{cloudUnavailable ? "Your cloud work is unavailable" : "One topic. One saved attempt."}</h3><p>{cloudUnavailable ? "Your existing work has not been changed. Retry sync below, or continue with a notebook on this device." : "Add a source, answer a practice question, review your working and plan a retry."}</p></div>
              <Link to="/study-notebook?start=1" className="btn-glass">Start with your notes <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </div>
          )}
        </section>

        {todayItems.length > 0 && (
          <section className="dashboard-today-wrap" aria-label="Your next study steps">
            <details id="today-plan"><summary className="cursor-pointer p-3 font-medium">More planner and revision actions</summary><TodayPlanPanel items={todayItems} /></details>
          </section>
        )}

        <StudyToolbox key={user?.id || "signed-out"} accountId={user?.id} />

        <section className="dashboard-support-grid" aria-label="Additional study resources">
          <LiquidGlass as="article" variant="card" className="dashboard-support-card">
            <Library className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="dashboard-kicker">Reference</p>
              <h2>Board resources</h2>
              <p>Board guides, command terms, formulas, and study articles when you need a fast answer.</p>
            </div>
            <div className="dashboard-support-links">
              <Link to="/resource-library">Board guides</Link>
              <Link to="/study-tools">Formula reference</Link>
              <Link to="/resources">Study articles</Link>
            </div>
          </LiquidGlass>

          <LiquidGlass as="article" variant="card" className="dashboard-support-card">
            <PenLine className="h-5 w-5 text-primary" aria-hidden />
            <div>
              <p className="dashboard-kicker">Personalise</p>
              <h2>Set up your study space</h2>
              <p>Update your board, subjects, goals, and preferences so the tools stay relevant to you.</p>
            </div>
            <Link to="/user-settings" className="dashboard-due-link">Open settings <ArrowRight className="h-4 w-4" aria-hidden /></Link>
          </LiquidGlass>
        </section>

      </div>
    </>
  );
}
