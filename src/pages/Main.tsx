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
import { buildTodayPlanItems, getTodayPlanDoneIds, toggleTodayPlanDone } from "@/lib/todayPlan";
import { dashboardNextAction } from "@/lib/dashboardNextAction.mjs";
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
  const [todayCompletion, setTodayCompletion] = useState(() => ({
    owner: user?.id ?? null,
    ids: getTodayPlanDoneIds(),
  }));
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
      setTodayCompletion({ owner: user?.id ?? null, ids: getTodayPlanDoneIds() });
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
  const doneToday = todayCompletion.owner === (user?.id ?? null)
    ? todayCompletion.ids
    : getTodayPlanDoneIds();
  const primaryTodayItem = todayItems.find(item => !doneToday.has(item.id)) ?? null;
  const toggleTodayItem = (id: string) => {
    // The persistence helper retains the previous set if browser storage fails.
    // Keep the checklist and the primary action on that same truthful result.
    setTodayCompletion({ owner: user?.id ?? null, ids: toggleTodayPlanDone(id) });
  };
  const nextRetry = getDueRetries()[0];
  const nextAction = dashboardNextAction({
    todayItem: primaryTodayItem,
    pendingMock,
    retry: nextRetry ? { href: retryTargetRoute(nextRetry), topic: nextRetry.topic } : null,
    recentId: recentArtifacts[0]?.id,
    loading: workLoading,
  });
  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || user?.email?.split("@")[0];

  return (
    <>
      <Helmet>
        <title>Study dashboard | VertexED</title>
        <meta name="description" content="Choose a study task: plan, focus, make notes, practise, get feedback, or ask for help." />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="dashboard-shell study-desk mx-auto w-full max-w-7xl space-y-7 pb-6">
        <header className="learning-heading desk-today-header">
          <div><p className="dashboard-kicker">{firstName ? `Welcome back, ${firstName}` : "Welcome back"}</p><h1>Today</h1><p>Make an attempt. Find the gap. Come back to it.</p></div>
          <div className="learning-actions">
            <Link to={nextAction.to}>{nextAction.label}</Link>
            <Link to="/planner">Open planner</Link>

          </div>
        </header>

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
            <details id="today-plan"><summary className="cursor-pointer p-3 font-medium">More planner and revision actions</summary><TodayPlanPanel items={todayItems} done={doneToday} onToggle={toggleTodayItem} /></details>
          </section>
        )}

        <details className="learning-paper"><summary>Study tools and resources</summary><StudyToolbox key={user?.id || "signed-out"} accountId={user?.id} /></details>

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
