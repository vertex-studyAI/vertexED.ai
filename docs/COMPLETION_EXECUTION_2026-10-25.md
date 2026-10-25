# VertexED completion execution, 25 October 2026

Decision: **NO-GO for full public release**. This is an engineering repair and verification receipt, not independent content approval or live-provider certification. Production remains at `200c0b17f61a53de0dff5ae62e088d274d4b9ac3` on `https://vertex-ed-ai.vercel.app` until a separately verified release.

Review: [draft PR #1146](https://github.com/vertex-studyAI/vertexED.ai/pull/1146). Local canonical CI is bound to implementation `9c29a2223f4e8f3822b4d411fb9ea4e70fe8750a`; subsequent commits contain this report and review bookkeeping. Hosted checks must certify the current PR head separately. The initial pushed review snapshot was `7f4b18c7431c4f7c21fdce374249246f5b49cede`. GitHub still reports advisories on the unchanged default branch; the zero-vulnerability audit applies to this candidate's lockfile.

## Repairs completed

- Revision events now enter an account-bound durable outbox before delivery. Reload, failed responses, wrong acknowledgements, concurrent sync, account switching, deletion and parent ordering have regression coverage. Failed uploads stay pending and exportable; volatile entries receive an explicit warning.
- A visible revision save-status notice supplies retry and JSON export. The dashboard's separate saved-work message now names notes, reviews and plans so it does not imply all revision events reached the account. Account export includes server revisions and pending device revisions; deletion forgets the revision queue.
- Revision-history loading binds its token and UI snapshot to one account. Stale responses cannot repopulate another account's page. Browser-submitted events cannot promote themselves to independently validated evidence.
- Hosted conversation, AI allowance, revision-history and practice-state schema gaps were repaired using tested migrations. Readiness checks now require these dependencies and fail closed when the old, incomplete readiness contract is returned.
- Hosted revision history permits service-role SELECT/INSERT only; UPDATE/DELETE grants were removed. Account deletion retains its tested foreign-key cascade. Browser roles have no direct revision or practice-RPC access.
- Rate-limit retention is scheduled daily at 03:17 UTC through `pg_cron`, preserving 30 days. The bounded prune function and exact scheduler configuration passed disposable SQL tests. The first automatic daily execution is still pending; configuration alone is not an execution receipt.
- The in-progress Boolean logic lesson was integrated without dropping its original questions. Its missing diagram and revision guide were added; manifests, pathway and coverage reports were regenerated. Coverage check mode is now included in `content:audit`. There are 91 shared lessons and 43 foundation lessons, all still held where independent approval is absent. The 53 legacy review flags remain visible.
- Official OpenAI prices/context bounds were rechecked on 25 October. The existing limits remain unchanged; policy `beta-usd-2026-10-25-v3` expires closed at 00:00 UTC on 1 November. See [pricing sources and deprecation boundaries](AI_USAGE_POLICY_2026-10-19.md).
- Vite 7.3.7, Undici 7.30.1 and PostCSS selector parser 7.1.6 clear the dependency advisories. All 20 built CSS assets remain byte-identical after the parser update. Account-only save notices load separately to preserve the frozen initial JavaScript budget.
- Broader browser checks exposed a transparent notebook reading surface that prevented reliable rejected-TeX contrast and a second settings sign-out navigation that could erase an immediately entered login. Notebook output now has an opaque themed surface; the existing route guard owns the single sign-out redirect. Mobile scroll clearance also keeps footer controls above the fixed navigation. These intentional visual corrections follow the unchanged-CSS dependency comparison above.

## Hosted migration receipt

Project: `xwlrzgfuhfbckgvcmyoq`. Each source was replayed and tested locally before hosted apply. The management API assigned the hosted versions below. Local historical filenames were preserved; this table records equivalence for these particular applications, not a claim that the entire shared historical ledger is identical.

| Hosted version | Canonical source |
| --- | --- |
| 20261025095123 | `20260927083605_apex_conversation_snapshot.sql` |
| 20261025095138 | `20261016123000_ai_usage_service_only.sql` |
| 20261025095141 | `20261019031851_verified_revision_graph.sql` |
| 20261025095146 | `20261025092940_revision_history_readiness.sql` |
| 20261025095343 | `20261025094027_scheduled_rate_limit_retention.sql` |
| 20261025100314 | `20260921141447_learning_practice_state.sql` |
| 20261025100333 | `20261025095740_practice_state_readiness.sql` |

Postflight: ten readiness capabilities true; all 34 public tables have RLS and FORCE RLS; no browser grants on the five service-only tables. Three saved study artifacts were preserved; zero practice-state rows and zero revision rows. Service-role revision UPDATE/DELETE and browser practice-RPC execution are false. One rate-limit row remains and none is older than 30 days. Preflight catalog snapshots are schema evidence, **not a data backup**. The isolated replay used PostgreSQL 17.6; the managed project remains on 17.4.1.074 and still needs its supported patch.

## Verification record

Local logs and failure history are retained under `.tmp/completion-20261025/`. Command summaries and hashes are recorded in [the evidence index](evidence/completion-20261025.json). The implementation is committed separately from this documentation so that test identity remains explicit.

- Disposable replay: 37 migrations, SQL lint with no errors, 198 pgTAP assertions across ten files passed.
- Canonical CI at `8812c9ff0b49641321542c8856b1adf788def74c`: 1,858 application tests and 25 evaluation unit tests passed, with content audit, copy lint (623 files, zero findings), type checking, synthetic evaluations, build and all bundle/route budgets. One React cleanup lint warning was corrected in `9716afbb030eba703746ef2abf78a11b10d176ff`; source lint was then corrected to exclude generated browser-build directories after a concurrent rebuild exposed a file-removal race. Final implementation `9c29a2223f4e8f3822b4d411fb9ea4e70fe8750a` passed the complete canonical CI gate without ESLint warnings; the evidence index records its log hash. Earlier bundle failures remain in the local log history; budgets were not raised.
- Revision recovery browser correction pass: nine scenarios passed across Chromium, Firefox and WebKit. Screenshots at 1440, 1024 and 390 pixels were inspected in Blue and Midnight; keyboard focus, reduced motion, JSON export, reload and retry were exercised.
- Full product matrix: 152 passed and ten failed initially. Corrections passed all 15 AI-content scenarios and all nine maths scenarios across the three engines. The intermediate correction run passed 22/24 and exposed the mobile footer issue, which the final maths pass resolved. These are a full baseline plus focused corrections, not a claim that one final 162-case run passed.
- Learner matrix with the required held-content build boundary: 69 passed, six failed on stale study-desk counts, and 39 intentionally skipped because the curriculum has no independent publication approvals. The corrected study-desk run passed all 18 scenarios across the three engines, including the Revision history link. An earlier run without the required boundary environment flag was stopped and retained as an invalid attempt.
- Local accessibility: 51 passed, one desktop-inapplicable mobile-navigation check skipped. Coverage included keyboard/dialog behaviour, reduced motion, themes and public authentication surfaces at 375, 390, 430, 768, 1024 and 1440 pixels. Final maths screenshots at 1440, 1024 and 390 pixels were inspected after the contrast and navigation corrections.
- Clean patched-lockfile install: 523 installed packages, zero audit vulnerabilities. npm's upstream `glob@10.5.0` deprecation warning remains in the log; it is not hidden or treated as a current audit finding.
- All third-party Actions in the remaining workflows use immutable commit SHAs. Dependency licence identifiers are present throughout the lockfile; licence identification does not replace legal review of distribution obligations.
- Production public smoke passed against the existing production SHA. It does not certify this candidate's authenticated workflows.

## Work requiring owner access, decisions or independent people

1. **Complete dashboard sign-in.** The supplied organisation URL redirects to an unauthenticated GitHub form in the accessible Chrome profile. GitHub sign-in is authorized; no active session is present. Then set the Site URL to `https://vertex-ed-ai.vercel.app` and allow `/auth/callback`, `/auth/callback?recovery=1` and `/auth/callback?invite=1` on that exact origin, remove the dead custom-domain callback, preserve trusted local callbacks and verify redirect probes. Enable [leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection), subject to the plan's availability.
2. **Provide controlled acceptance identities and inbox access.** Two approved test users, one denied user and a test admin are needed for real email/Google OAuth, invitation/recovery, cross-account export/delete and live provider journeys. Local browser fixtures and pgTAP prove their tested contracts, not real email delivery or provider quality. No email was sent to another person in this work.
3. **Choose the launch curriculum and appoint reviewers.** Independent subject, answer-key, rights and safeguarding review must name people and approve exact content hashes. Complete course denominators and remaining units must follow that scope; producing more unreviewed text cannot close these gates. No lesson approval was invented.
4. **Choose domain disposition.** Restore `vertexed.app` with the owning registrar/DNS account or explicitly retire it. The healthy Vercel origin is the current canonical fallback. A preview does not update the production domain.
5. **Name the operational owner and maintenance window.** Confirm backup/PITR availability, restore target, RPO/RTO, rollback owner and alert destination. Rehearse an actual backup restore, reconcile the shared database's older migration ownership, then apply the [managed Postgres patch](https://supabase.com/docs/guides/platform/upgrading). Schema-only catalog snapshots cannot satisfy this requirement. Verify the first scheduled retention run and alert delivery.
6. **Complete independent device and learner acceptance.** Real mobile microphone/permission and file-reader checks, the two-hour study journey, educational usefulness review and legal/privacy approval require the relevant devices and reviewers.
7. **Restore Vercel access and approve release only after the above evidence passes.** The existing CLI session reports `Not authorized`; production environment names and staging cannot currently be verified through it. The existing project link was preserved. Sign in to the account owning `vertex-ed-ai`, create/verify staging with the reviewed candidate, run bounded provider canaries and real-account isolation, then issue an explicit GO with rollback ownership. Keep production unchanged while these gates remain open.

## Extension decisions after the release blockers

Prioritise teacher confirmation with immutable evidence and revocation; private expiring/revocable sharing; invitation-based comments; and calendar-provider/background scheduling. Each needs a defined permission/retention model and acceptance scope before implementation. Revision history, quota visibility, privacy-gated feedback regression fixtures and route bundle budgets already have engineering implementations; their remaining live/reviewer gates are tracked separately. None establishes measured learning gains.

The full [completion checklist](NEXT_ACTIONS_CHECKLIST_2026-10-24.md) and [gate register](COMPLETION_GATE_REGISTER.json) remain the acceptance contract. Broad historical gates remain open until all their stated evidence is available; this receipt does not turn partial local results into release approval.
