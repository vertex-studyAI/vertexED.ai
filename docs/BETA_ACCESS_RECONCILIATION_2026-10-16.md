# Beta access boundary and reconciliation

Prepared 16 October 2026. Local uncommitted candidate only. SQL replay, real Auth
journeys and production-equivalent legacy reconciliation are **not executed**.
Docker was unavailable in this session. Do not apply this document to a live
project without the owner's separate approval and an identified target.

## Current change and existing repair

The server route registry in this local candidate distinguishes public, authenticated-account,
approved-member and approved-admin routes. All 15 current product/admin routes
require a verified email and a server-owned approved VertexED waitlist record
before loading their handler. Export, account deletion, access status and admin
status remain authenticated-account routes. Admin mutations additionally require
the server admin allowlist. Profile metadata is not an authorization source.

`/api/waitlist-status` reports `verification_required`, `unregistered`, `pending`,
`approved`, `rejected` or `revoked` independently of transport/dependency failure.
The existing database represents withdrawn approval as `rejected`; the API also
denies a future explicit `revoked` value. Access outages return 503,
`ACCESS_UNAVAILABLE` and a 30-second retry delay. Responses are private/no-store.
This correction does not establish the cause of any production TLS or routing
failure, which must be diagnosed independently.

[Draft #1067](https://github.com/vertex-studyAI/vertexED.ai/pull/1067) was read on
16 October: open, Draft, unmerged, head
`0b15e4404b4177b04ec43d221cd0f6b8a8051c9b`. It is the existing review candidate
for [#1046](https://github.com/vertex-studyAI/vertexED.ai/issues/1046). This local
change adapts that boundary intent at the registry, includes the later
`import-source` route, and replaces static-only boundary checks with executed
mocked request cases. Unlike that draft, it requires approved membership for
allowlisted administrators, as required by the current implementation brief.
Do not merge both approaches independently or revive closed predecessor #1055.
Reconcile the chosen implementation in the existing security review.

[Draft #1138](https://github.com/vertex-studyAI/vertexED.ai/pull/1138), head
`3e58e30c6698cd94f2716c63178331c5e280cc04`, is the existing literal-email team
invitation repair. Its helper change and mocked SDK regression are adapted here:
case-insensitive email lookup uses an escaped, anchored `imatch` expression so
valid mailbox `_`, `%` and `*` characters cannot select a different account.
The imported regression failed 6 of 19 checks before the repair and passed all
19 afterward; with signup finalization, 30 checks passed. This is mocked SDK
evidence, not hosted PostgREST evidence. Do not create a duplicate repair PR.

## New migration

`supabase/migrations/20261016093000_artifacts_service_only_access.sql` removes
PUBLIC, anonymous and authenticated table/column privileges on
`public.user_study_artifacts`. The existing browser uses `/api/user-content`,
and the service role retains CRUD for that API and owner export/deletion.
Existing rows, owner RLS policies, forced RLS, foreign keys and migration history
are unchanged. Direct browser profile access is unchanged.

A fresh read-only catalog query on the connected shared Supabase project on
16 October found that production already has the desired table boundary:
`user_study_artifacts` and `learner_state_items` grant only `postgres` and
`service_role`, both enable/force RLS, and artifacts have no explicit column
grants. The existing owner policies remain. This is current metadata evidence,
not a real-token authorization test. The new migration corrects repository
empty-state replay to match that observed effect. **Do not apply an unnecessary
live change solely to make the migration ledger match**; first reconcile the
existing repair provenance under #913/#916. No live DDL ran in this session.

`artifact_access.test.sql` contains 31 executable pgTAP assertions for actual
migrated grants, column privileges, anonymous/approved A/approved B/pending/
withdrawn/shared-auth-only direct access, service operations and account-delete
cascades. The older RLS/conversation suites use transaction-only grants to retain
their original owner-policy assertions; those grants roll back and do not alter
the production boundary. These SQL assertions are prepared, **not passed**.

## Read-only preflight on the confirmed rehearsal target

Run as the rehearsal database owner, inside a read-only transaction. Keep only
aggregate output in release evidence. Individual identities, emails and invite
tokens do not belong in reports or command logs.

```sql
begin read only;
select current_database(), current_user, version();
select version, name from supabase_migrations.schema_migrations order by version;
select relrowsecurity, relforcerowsecurity, relacl
from pg_class where oid = 'public.user_study_artifacts'::regclass;
select attname, attacl from pg_attribute
where attrelid = 'public.user_study_artifacts'::regclass
  and attnum > 0 and not attisdropped order by attnum;
select policyname, roles, cmd, qual, with_check from pg_policies
where schemaname = 'public' and tablename = 'user_study_artifacts';

with account_access as (
  select u.id, u.email_confirmed_at, w.status,
    exists (
      select 1 from public.waitlist candidate
      where candidate.auth_user_id is null and candidate.status = 'approved'
        and lower(candidate.email) = lower(u.email)
    ) as matching_unlinked_approval
  from auth.users u
  left join public.waitlist w on w.auth_user_id = u.id
)
select count(*) as auth_identities,
  count(*) filter (where status = 'approved' and email_confirmed_at is not null) as linked_verified_approved,
  count(*) filter (where status = 'approved' and email_confirmed_at is null) as linked_unverified_approved,
  count(*) filter (where status = 'pending') as linked_pending,
  count(*) filter (where status = 'rejected') as linked_rejected,
  count(*) filter (where status is null) as no_linked_membership,
  count(*) filter (where matching_unlinked_approval) as unlinked_approval_candidates
from account_access;
select count(*) as approved_rows_without_auth_link
from public.waitlist where status = 'approved' and auth_user_id is null;
select count(*) as linked_email_mismatches
from public.waitlist w join auth.users u on u.id = w.auth_user_id
where lower(w.email) is distinct from lower(u.email);
rollback;
```

An unlinked candidate or matching email is not historical approval evidence.
For each legitimate historical learner/admin, the owner must establish the
original approval/invitation and verified identity in a private reconciliation
record. Classify ambiguous identities as unresolved; never promote all shared
Auth users, profile rows or old accounts. The API's one-time link repair applies
only to an existing access row and verified matching email, and uses an atomic
`auth_user_id IS NULL` claim. Rehearse that path with actual sanitized legacy
cases, wrong-owner rows, changed email, duplicate/concurrent claims and withdrawal
before enabling enforcement on the intended deployment. It never changes status
to approved. Missing legitimate approvals need an individually reviewed operator
decision; this runbook does not supply a bulk UPDATE.

## Rehearsal, promotion and rollback order

1. Read current [#913](https://github.com/vertex-studyAI/vertexED.ai/issues/913)
   and [#916](https://github.com/vertex-studyAI/vertexED.ai/issues/916), including
   successors #1070/#1071. Current schema cannot prove historical backfills ran.
   Preserve the old ledger and SQL bodies; do not replay ambiguous duplicate-date
   migrations into a shared target or repair the ledger for appearance.
2. Use `docs/DATABASE_REPLAY.md` to create a fresh disposable local project from
   this exact candidate, then run its guarded `db:test`. Also restore a sanitized
   production-shaped snapshot into a separate confirmed disposable target and
   rehearse this one new migration. Record before/after table and column ACLs,
   policy definitions, row counts and source hashes. Exercise pre-existing
   explicit column grants so their revocation is tested.
3. Reconcile legitimate legacy and operator access using the read-only aggregate
   checks and private per-account evidence. Test real approved A/B, nonmember,
   pending, withdrawn, unverified and non-admin/admin API requests, with zero paid
   provider/product-store work on denial. Test expired/deleted sessions, database
   outage, missing schema, access-status polling and stale-client recovery.
4. With the service-only ACL applied in rehearsal, verify actual artifact
   create/list/read/update/delete, fresh-login recovery, export and account-delete
   cascades through the API; denied users still retain export/delete rights.
   Request the independent security/DB review on the combined candidate.
5. Only after explicit production approval, identify the owning deployment and
   shared-project environment; preserve a restorable backup and the exact ACL
   snapshot. Deploy the reviewed API candidate in the agreed maintenance sequence.
   Apply schema changes only if the reconciled catalog/ledger provenance requires
   them; the observed live service-only ACL does not itself need alteration.
   Run the same post-deployment tests.
6. Rollback preserves rows: the new migration removes privileges only. Prefer
   fixing forward with product ingress held closed. If reverting is independently
   approved, restore the captured pre-change table/column ACLs in a new uniquely
   timestamped rollback migration; the repository baseline table grant is
   `GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_study_artifacts TO authenticated`.
   Restoring it reopens direct owner access, so it must not be mistaken for a safe
   membership boundary. Do not drop policies, remove this migration's ledger entry,
   or reset the database. Re-run isolation and lifecycle tests after restoration.

[FinanceMeta isolation #1040](https://github.com/vertex-studyAI/vertexED.ai/issues/1040)
remains a coordinated external dependency; its latest linked #1086 is explicitly
non-enforcing. This change does not alter FinanceMeta. [AI ceilings #1041](https://github.com/vertex-studyAI/vertexED.ai/issues/1041)
is also open: per-minute rate limits are not account/global spend reservations.
Neither issue is closed by the membership fix.

The initial read-only cost audit found only `consume_waitlist_rate_limit`, an
atomic single-key request-count contract, and no atomic spend ledger among the
29 open PR metadata entries inspected on 16 October. That baseline remains
historical evidence: separate account/global request counters cannot reserve
money atomically, deduplicate a paid operation or settle uncertain outcomes.

Later in this session the user authorized choosing reasonable limits. The local
successor now implements **USD $1 per account per UTC day, USD $10 per shared
project per UTC day, and at most 2 account / 8 project unresolved operations**.
Amounts use integer microUSD (1 USD = 1,000,000 microUSD). This is a local candidate;
no deployed ceiling, applied migration or live provider acceptance is claimed.

`api/_lib/aiUsagePolicy.js` pins supported OpenAI text requests to
`gpt-4.1-mini-2025-04-14` or `gpt-4o-mini-2024-07-18`, uses standard uncached rates,
forces the default service tier and `store:false`, rejects redirects and unknown
billable inputs, and explicitly bounds output to 16–4096 tokens. Reservation uses
the **full documented context window plus the requested output cap**, rather than
an assumed character-to-token estimate. At 1,200 output tokens the worst-case
reservations are 420,951 and 19,920 microUSD respectively. Source contracts are the
current official [GPT-4.1 mini model specification](https://developers.openai.com/api/docs/models/gpt-4.1-mini),
[GPT-4o mini model specification](https://developers.openai.com/api/docs/models/gpt-4o-mini),
[token counting guide](https://developers.openai.com/api/docs/guides/token-counting)
and [Chat Completions parameter contract](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create).
The reviewed price snapshot expires **2026-10-23 00:00 UTC**; admission and the
allowance UI fail closed after expiry until the model/rate contract is reviewed
again. Cached input is charged conservatively at the uncached rate.
Because admission reserves a complete possible call, a positive nominal balance
can still be smaller than the selected model's reservation; unresolved account
or shared capacity can also deny a call despite that displayed balance.

Unknown/fine-tuned models, Google/NVIDIA, tools, image and audio inputs are
explicitly unavailable under this bounded policy. Note and paper source defaults
now use `gpt-4.1-mini`, and `.env.example` agrees with that default. Explicit owner
overrides remain authoritative: an unsupported configured model or Gemini path
requires a separately audited cost contract; a policy denial does not silently
trigger another provider. Actual note/paper handler fixtures verify default text
generation and settlement without claiming independent educational quality. The image reviewer previously
used a separate raw SDK dispatch before grading. Both its handler and historical
helper now reject images before any SDK call. Text-only review can use the shared
guard. Restoring image/audio features requires proven billable-unit bounds,
output/usage contracts and admission through the same coordinator.

`api/_lib/aiUsage.js` binds server-verified identity and one bounded
`Idempotency-Key` to the ten paid POST routes in `api/_lib/routes.js`. The shared
client creates one UUID per deliberate action and preserves it through token
refresh; endpoint fallback reuses that key and is limited to 404/405. The server
hashes request/payload fingerprints and gives each paid child attempt a distinct
index. It reserves and marks dispatch before reaching `callChatProvider`,
`fetchProvider` or direct planner dispatch. The board-resource nested wrapper
uses the existing reservation once. Duplicate/conflicting keys return 409 without
redispatch. Quota denial returns 429 with a UTC reset; unresolved-capacity denial
returns 429; missing policy, price or RPC returns a typed 503. A handler catching
the exception cannot turn the denial into a successful fallback response.

`api/_lib/fetchWithTimeout.js` now bounds headers **and response consumption** for
paid providers, including injected fetch implementations. It races caller abort
and the deadline, caps buffered bytes at 8 MiB, checks abort after each read,
cancels without waiting on a possibly stalled cancellation promise, and removes
listeners/timers. Node connection closure propagates to this operation. Generic
non-provider callers retain their existing Response-at-headers contract. The
existing independently bounded agent-discovery reader is unchanged.
The post-settlement observability insert also now consumes its complete response
under a 3-second deadline and 64 KiB cap. A stalled telemetry body is cancelled;
the completed provider response returns without another paid attempt or refund.

The new, unapplied migration
`supabase/migrations/20261016123000_ai_usage_service_only.sql` creates the
service-only `ai_usage_reservations` ledger and `reserve_ai_usage`,
`mark_ai_usage_dispatched`, `settle_ai_usage`, `read_ai_usage` RPCs. Global then
account transaction locks protect integer budget sums and all-time unresolved
capacity. Unique account/operation hashes reject duplicate dispatch. Database
UTC time binds reservation and usage period. A 5-minute pre-dispatch lease and a
UTC-day transition prevent stale dispatch, but **never automatically refund** a
reservation. Unknown acknowledgements leave exposure intact.

Successful complete responses settle only against validated model identity,
finite token totals and actual cost within the reserved maximum. A fully observed
non-success provider response conservatively charges the entire reservation.
Known cancellation before dispatch can release a reserved row. After dispatch,
body timeout, cancellation, malformed/missing usage, settlement outage or process
loss retains full reserved exposure and capacity as dispatched/uncertain. There
is no optimistic timeout refund. Prior-day unresolved exposure stays visible
separately from today's balance and continues to block concurrency until a
confirmed outcome is reconciled.

`GET /api/ai-usage` is owner-authenticated and remains independent of beta
membership. It returns private/no-store finite account amounts, UTC period,
carried reserved amount, unresolved count/capacity and only a boolean shared
availability indicator. It exposes no other account's aggregate spend. Settings
renders that response with account-switch cancellation and explicit unavailable
states. Owner export paginates the account's ledger audit rows and adds a read-only
usage snapshot; missing ledger/RPC or row-limit truncation fails the complete
export. Pricing expiry alone does not block historical export: its snapshot
reports `pricingPolicyActive:false`.

On account deletion the ledger removes its direct user foreign key with
`ON DELETE SET NULL`, while retaining a SHA-256 account pseudonym and operation
fingerprints. This preserves shared spent/reserved exposure and stops recreation
of the same UUID from resetting its account allowance. These are pseudonymous
anti-reset tombstones, **not anonymous records**; no prompt, answer or provider
secret is stored. The account-data retention policy and operator reconciliation
of deleted-account uncertain rows need explicit review. There is no automatic
cleanup/refund or complete operator reconciliation UI in this candidate.

Local receipts: `ai-usage-final-telemetry-focused.log` under
`.tmp/product-verification-20261016/` records **113/113** focused API/auth/provider/
privacy-export tests. It covers zero-provider denial, duplicate concurrent RPC
replies, all ten registry paths, fallback suppression, nested dispatch, before/
after-dispatch cancellation, invalid usage/acknowledgements, body limits/deadlines,
nonmember usage/export, pricing expiry and failed export dependencies. The earlier
`provider-body-deadline-red.log` and `review-image-spend-red.log` preserve the
reproduced failures; `provider-telemetry-deadline-red.log` preserves the subsequent
post-settlement telemetry stall before its correction. `ai-usage-independent-review.log` records a separate 8,162-case
reservation bound check and image/expiry checks. The migration's schema contract
suite passes locally, and `supabase/tests/database/ai_usage.test.sql` is authored.
**Actual SQL replay, pgTAP, concurrent database execution, live provider calls,
shared-project migration and deployment are NOT_RUN.** Mocked RPC tests verify
coordinator behavior; they do not prove PostgreSQL locking or deployed ceilings.

Before release: rehearse the new migration against the reconciled shared schema
under #913/#916; execute pgTAP and independent parallel-reservation/duplicate/
settlement/deletion/UTC-rollover tests; verify account/export behavior against the
actual deployed RPC; review retention and a safe operator reconciliation path;
then run explicitly authorized paid contract probes for the exact model snapshots.
Retain the closed admission behavior if migration, credentials, model prices or
usage identity cannot be verified. Re-enable unsupported models/modalities only
with audited bounds and equivalent tests. #1041, AI-06, OPS-06 and EXT-05 therefore
remain **PARTIAL_LOCAL / open for release**, with engineering and execution gates
still outstanding; per-minute endpoint limits remain separate rate controls.

The final dependency review reproduced the conditional KaTeX trust gadget in the
actual RichMarkdown/ChatMarkdown runtime: synthetic preexisting prototype
pollution enabled external image markup in 0.16.22. No attacker-reachable
pollution primitive was established. The official
[GHSA-238p-pmpm-9mq7 advisory](https://github.com/advisories/GHSA-238p-pmpm-9mq7)
identifies 0.18.2 as fixed; its
[release](https://github.com/KaTeX/KaTeX/releases/tag/v0.18.2) contains the settings
own-property correction. The local dependency successor pins KaTeX **0.18.2** and
overrides transitive math-package resolutions to the same version. The pre-update
four-low audit remains preserved; `npm-audit-katex-corrected.json` reports **zero
production dependency findings** after the update. This does not establish a
general absence of vulnerabilities or deployed remediation.

`katex-default-model-red.log` preserves the pre-fix runtime failures.
`katex-rendering-green.log` records 21/21 focused math/sanitizer checks, including
actual markdown components under inherited trust and setting-metadata pollution;
`ai-default-model-green.log` records 27/27 default-model/usage/fallback checks.
`katex-installed-tree.json` verifies all dependency paths use 0.18.2.
`katex-lock-delta.json` compares against the preserved dirty pre-install lockfile:
no package entries were added or removed, KaTeX is the only version change, and
14 existing entries receive npm's `dev:true` classification metadata. The 0.18
internal CSS prefix change still requires the root's final built-asset/browser
receipt; normal equation/MathML runtime rendering passes. No forced audit fix,
math-plugin downgrade or unrelated dependency version upgrade was performed.

The Auth verification and email fields follow the official
[Supabase getUser contract](https://supabase.com/docs/reference/javascript/auth-getuser)
and [user object contract](https://supabase.com/docs/guides/auth/users).
The table/column ACL distinction follows [PostgreSQL REVOKE](https://www.postgresql.org/docs/current/sql-revoke.html).
Literal email filtering follows the official
[PostgREST operator contract](https://docs.postgrest.org/en/stable/references/api/tables_views.html#operators)
and [PostgreSQL pattern matching](https://www.postgresql.org/docs/current/functions-matching.html).
