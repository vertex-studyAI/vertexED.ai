# PRODUCT_STATUS

**As of:** 2026-08-14 convergence recovery

| Product/system | State | Evidence boundary | Next gate |
|---|---|---|---|
| VertexED source | **GREEN** | connected source head recovered as `f177d87c4ee3f8daeb04cbded6c5be299cde4bae`; source/repository checks exist | preserve source gates while production identity is repaired |
| VertexED production | **BLOCKED — REVISION IDENTITY** | production monitor run `31771831538` on 2026-08-14 passed homepage, API 404, malformed waitlist rejection, logged-out auth boundaries and untrusted-origin rejection, but `/api/health` did not expose the expected immutable revision after three bounded attempts; artifact `9208406163` | make exact served revision observable, then run authenticated golden journey on that revision |
| Percy Prime host | **BLOCKED_EXTERNAL_MAC for production qualification** | retained runtime/control artifacts exist, but `/Volumes/PRO-BLADE/Atlas/Percy` SQLite/WAL/process state is not observable here | host recovery first; then integrity + WAL + leases + heartbeats + stale recovery + provider + crash/restart + resource qualification |
| FinanceMeta | **BLOCKED_EXTERNAL** | recovery/hardening package retained; canonical target and live Supabase authorization unavailable from current connected surface | authorize exact target repo/Supabase, apply recovery in isolated branch, build/security/live-denial verify |
| The Bu1LD | **BLOCKED_EXTERNAL** | source/recovery/deployment evidence exists in control records, but current target-source write/deploy/runtime surface is unavailable | authorize correct target and verify build/hydration/role boundaries on exact production revision |
| Text-To-Video V6 | **GREEN LOCAL ENGINEERING / PRODUCTIZE** | connected head `5b9835a06f41f07f52029ee830b82565969c0965`; CI run `31609979616` succeeded; repository proves real local MP4 encoding, durable local queue and SHA-256-verified local artifact storage | hosted/object storage, deployed worker callback, auth/ownership, retention/cleanup, observability and real narration before production claim |

## VertexED production truth

The 2026-08-14 public monitor is a precise partial pass, not a production GREEN:

- homepage availability: pass;
- unknown API route 404: pass;
- malformed waitlist rejection: pass;
- logged-out `/api/ask`, user-content and admin boundaries: pass;
- untrusted cross-origin rejection: pass;
- `/api/health` availability: pass;
- immutable served revision identity: **fail — revision missing against the expected runtime revision**.

A green Vercel/GitHub commit context does not substitute for the live served-revision proof.

## Product validation contracts

### VertexED

- **USER:** an actual learner/tester using the production learner flow; do not invent user counts or traction.
- **JOB:** reach a useful study artifact/workflow and be able to return to it reliably.
- **CURRENT PAIN TO TEST:** whether deployment/auth/state reliability prevents reaching or returning to value.
- **MVP:** existing source functionality only; no new feature expansion until certification.
- **ACTIVATION:** one real user completes the intended authenticated first-value journey on the exact certified revision.
- **RETENTION:** the same account can later recover its saved state/artifact and continue without cross-account leakage.
- **SUCCESS METRIC:** journey-step success rate, error class, state persistence, account-isolation denial, exact served SHA.
- **RELIABILITY:** signup/login/onboarding/core study action/save/retrieve/password recovery/logout must not silently fail.
- **SECURITY:** no cross-account access; admin/user boundaries fail closed; untrusted origins remain denied.
- **EXTERNAL VALIDATION:** real authenticated user journey on the live revision.

**Two-week experiment:** certify revision identity first; then run a small bounded set of real/disposable test-account journeys with step-level telemetry already permitted by the system. Fix only reliability/security blockers discovered in those journeys. Do not add speculative features. At the end of two weeks, decide `PRODUCTION GREEN`, `CONTINUE RELIABILITY`, or `BLOCKED_EXTERNAL` from observed evidence.

### FinanceMeta

- **USER:** an actual member and an actual authorized admin/test-admin in the canonical target; do not invent usage/traction.
- **JOB:** participate in programs/content while persistent member state and role boundaries hold.
- **CURRENT PAIN TO TEST:** authorization integrity, persistence and target/recovery mismatch.
- **MVP:** existing target flow after security hardening, not a feature expansion.
- **ACTIVATION:** member reaches the intended first member-only action without manual database intervention.
- **RETENTION:** saved member state persists across sessions.
- **SUCCESS METRIC:** successful journey rate + zero unauthorized self-promotion/cross-role access in denial tests.
- **RELIABILITY:** OAuth/auth/session/persistence flows must survive refresh/relogin.
- **SECURITY:** RLS and notification/profile policies must deny privilege escalation and cross-account mutation.
- **EXTERNAL VALIDATION:** exact target production/Supabase behavior.

**Two-week experiment:** once target access is restored, apply only the reviewed hardening package on an isolated exact-SHA branch, run member/admin denial-path tests, deploy intentionally, then execute repeated real/disposable member journeys. If access is not restored, remain blocked rather than generating replacement features or synthetic GREEN claims.

### The Bu1LD

- **USER:** real visitor/member/program/project/reviewer/admin role holders or disposable equivalents in the actual target.
- **JOB:** discover/apply/submit/review/manage work while role permissions and deployment identity stay correct.
- **CURRENT PAIN TO TEST:** production deployment/hydration mismatch and role-boundary reliability.
- **MVP:** current role-based portal flow; no broad new product surface.
- **ACTIVATION:** a valid non-admin user reaches their intended first role-specific value action.
- **RETENTION:** role/state persists correctly across sessions and deployment refreshes.
- **SUCCESS METRIC:** seven-role journey matrix with explicit allow/deny results and zero unauthorized boundary crossings.
- **RELIABILITY:** login, onboarding/application, project discovery/submission/review/approval and logout must work where role-appropriate.
- **SECURITY:** every cross-role denial must fail closed.
- **EXTERNAL VALIDATION:** real target repo/Supabase/deployment behavior.

**Two-week experiment:** after access restoration, freeze the role matrix, certify exact deployment identity, run one complete journey per role plus cross-role denial cases, repair only blocking defects, and rerun from clean sessions. If production remains inaccessible, keep the product `BLOCKED_EXTERNAL`.

### Text-To-Video V6

- **USER:** a learner/editor who needs a notes-to-video artifact, once a hosted product path exists.
- **JOB:** submit a bounded render request and receive a retrievable media artifact with clear failure/retry status.
- **CURRENT PAIN TO TEST:** local-only storage/worker lifecycle cannot yet provide a reliable hosted result.
- **MVP:** one authenticated hosted worker + object-store path using the existing durable lifecycle; real narration may remain a separately disclosed limitation unless intentionally integrated.
- **ACTIVATION:** one authenticated request reaches a verified hosted artifact URL.
- **RETENTION:** completed artifact remains retrievable according to a declared retention policy.
- **SUCCESS METRIC:** lifecycle completion rate, retry/failure correctness, ownership denial, artifact hash verification, latency/cost.
- **RELIABILITY:** no stale partial MP4 promoted as done; retries/cancellation remain bounded.
- **SECURITY:** output ownership and URL access must be scoped to the requesting account where product design requires it.
- **EXTERNAL VALIDATION:** hosted lifecycle under real failure/retry conditions.

**Two-week experiment:** only if this product receives the second active product-validation slot, deploy the smallest hosted worker/object-store path and test success/failure/retry/ownership/cleanup. Otherwise retain the local GREEN boundary and do not expand it.

## Percy accounting truth

Retained registry specification: 16,256 logical identities (`P00000..P16255`, 127 × 128). Live dispatch/process/task counters are `UNKNOWN` because the host DB is not accessible from this surface. Never report the logical registry count as physical workers or unique completed work.

## External-access rule

Do not repeatedly burn execution time retrying inaccessible FinanceMeta/Bu1LD/Percy mutations. Preserve exact blockers and continue only with connected work until authorization/host access changes.
