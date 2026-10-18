import { ArrowRight, BookOpenCheck, Cloud, CloudOff, Settings, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';

import BoardBadge from '@/components/curriculum/BoardBadge';
import type { EcosystemBrief } from '@/lib/studyEcosystem';
import {
  getProfileCompleteness,
  gradeLevelLabel,
  studyGoalLabel,
} from '@/lib/learnerProfile';

type Props = {
  brief: EcosystemBrief;
  nextAction: { to: string; label: string };
  dueReviewCount: number;
  cloudUnavailable: boolean;
  localSaveCount: number;
  workLoading: boolean;
};

export default function MemberPortalHeader({
  brief,
  nextAction,
  dueReviewCount,
  cloudUnavailable,
  localSaveCount,
  workLoading,
}: Props) {
  const profile = brief.profile;
  const completeness = getProfileCompleteness(profile);
  const firstName = profile.displayName.split(' ')[0] || 'Student';
  const goal = studyGoalLabel(profile.studyGoal);
  const level = gradeLevelLabel(profile.gradeLevel);

  const saveLabel = workLoading
    ? 'Checking saved work'
    : cloudUnavailable
      ? 'Cloud connection unavailable'
      : localSaveCount > 0
        ? `${localSaveCount} device save${localSaveCount === 1 ? '' : 's'} waiting to sync`
        : 'No pending device saves';

  return (
    <header className="member-portal-header" aria-labelledby="member-portal-title">
      <div className="member-portal-copy">
        <p className="member-access-line">
          <ShieldCheck aria-hidden />
          Approved private beta access
        </p>
        <p className="dashboard-kicker">{brief.greeting}, {firstName}</p>
        <h1 id="member-portal-title">Today</h1>
        <p className="member-portal-intro">
          Start with one useful task, keep your evidence attached, then return to the gap.
        </p>

        <div className="member-profile-chips" aria-label="Study profile summary">
          {profile.curriculum.board && <BoardBadge board={profile.curriculum.board} />}
          {goal && <span>{goal}</span>}
          {level && <span>{level}</span>}
          {!profile.curriculum.board && <Link to="/user-settings">Add exam board</Link>}
        </div>

        <div className="member-portal-actions">
          <Link to={nextAction.to} className="member-primary-action">
            {nextAction.label} <ArrowRight aria-hidden />
          </Link>
          <Link to="/saved-work" className="member-secondary-action">
            <BookOpenCheck aria-hidden /> View saved work
          </Link>
          <Link to="/user-settings" className="member-secondary-action">
            <Settings aria-hidden /> Account settings
          </Link>
        </div>

        <nav className="member-portal-jumps" aria-label="Member portal sections">
          <a href="#today-plan">Today&apos;s plan</a>
          <a href="#quick-capture">Check in</a>
          <a href="#continue-studying">Saved work</a>
          <a href="#member-tools">Tools</a>
          <a href="#account-data">Account &amp; data</a>
        </nav>
      </div>

      <aside className="member-summary-sheet" aria-label="Member workspace summary">
        <div className="member-summary-heading">
          <div>
            <p className="dashboard-kicker">Member workspace</p>
            <h2>Your revision trace</h2>
          </div>
          <span aria-hidden>V/ED</span>
        </div>

        <dl className="member-summary-grid">
          <div>
            <dt>Planner tasks today</dt>
            <dd>{brief.todayTasks.length}</dd>
          </div>
          <div>
            <dt>Reviews due</dt>
            <dd>{dueReviewCount}</dd>
          </div>
          <div>
            <dt>Profile set up</dt>
            <dd>{completeness.score}%</dd>
          </div>
        </dl>

        <div className={`member-save-state ${cloudUnavailable ? 'is-warning' : ''}`} role="status">
          {cloudUnavailable ? <CloudOff aria-hidden /> : <Cloud aria-hidden />}
          <div>
            <strong>{saveLabel}</strong>
            <span>
              {cloudUnavailable || localSaveCount > 0
                ? 'Device copies stay in place until account sync is confirmed.'
                : 'No device-only work is waiting to sync.'}
            </span>
          </div>
        </div>

        {completeness.nudge && (
          <div className="member-profile-progress">
            <div>
              <span>Profile</span>
              <strong>{completeness.score}%</strong>
            </div>
            <span className="member-profile-track" aria-hidden>
              <span style={{ width: `${completeness.score}%` }} />
            </span>
            <p>{completeness.nudge}</p>
            <Link to="/user-settings">Complete study profile</Link>
          </div>
        )}
      </aside>
    </header>
  );
}
