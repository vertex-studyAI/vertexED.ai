import { ArrowRight, BookOpenCheck, Database, ShieldCheck, UserRound } from 'lucide-react';
import { Link } from 'react-router';

import BoardBadge from '@/components/curriculum/BoardBadge';
import type { EcosystemBrief } from '@/lib/studyEcosystem';
import { getProfileCompleteness, studyGoalLabel } from '@/lib/learnerProfile';

type Props = {
  brief: EcosystemBrief;
  accountEmail?: string | null;
};

export default function MemberAccountPanel({ brief, accountEmail }: Props) {
  const profile = brief.profile;
  const completeness = getProfileCompleteness(profile);
  const goal = studyGoalLabel(profile.studyGoal);

  return (
    <section id="account-data" className="member-account-panel" aria-labelledby="account-data-heading">
      <div className="dashboard-section-heading">
        <div>
          <p className="dashboard-kicker">Account &amp; data</p>
          <h2 id="account-data-heading">Your member space, under your control.</h2>
        </div>
        <Link to="/user-settings" className="text-link">
          Open all account controls <ArrowRight aria-hidden />
        </Link>
      </div>

      <div className="member-account-grid">
        <article>
          <span className="member-account-icon"><ShieldCheck aria-hidden /></span>
          <p className="dashboard-kicker">Access</p>
          <h3>Private beta member</h3>
          <p>This signed-in account passed the current access check.</p>
          {accountEmail && <small>{accountEmail}</small>}
        </article>

        <article>
          <span className="member-account-icon"><UserRound aria-hidden /></span>
          <p className="dashboard-kicker">Study profile</p>
          <h3>{completeness.score}% set up</h3>
          <div className="member-account-meta">
            {profile.curriculum.board && <BoardBadge board={profile.curriculum.board} />}
            {goal && <span>{goal}</span>}
            <span>{profile.curriculum.subjects.length} subject{profile.curriculum.subjects.length === 1 ? '' : 's'}</span>
          </div>
          <Link to="/user-settings">Review profile <ArrowRight aria-hidden /></Link>
        </article>

        <article>
          <span className="member-account-icon"><Database aria-hidden /></span>
          <p className="dashboard-kicker">Portability</p>
          <h3>Export or remove your data</h3>
          <p>Account settings include cloud plus device export, a device-only backup, and account deletion.</p>
          <div className="member-account-links">
            <Link to="/saved-work"><BookOpenCheck aria-hidden /> Saved work</Link>
            <Link to="/user-settings">Data controls <ArrowRight aria-hidden /></Link>
          </div>
        </article>
      </div>
    </section>
  );
}
