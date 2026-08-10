# Master Portfolio Status

Updated: 10 August 2026

This status is evidence-limited. It records only repositories and artifacts visible to the connected GitHub installation or explicitly preserved in the control repository. It does not promote inaccessible source, proposal registries, deployment statuses, or research roadmaps into completed work.

| Project | Canonical repo/source | State | Tests/evidence | Main blocker | Best next artifact | Priority | Owner |
|---|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / RELEASE-CANDIDATE SOURCE | Canonical CI has passed on the merged source fixes; both Vercel commit-status contexts were green on pre-execution main. Four source fixes were merged during this execution window. | Exact immutable revision serving `www.vertexed.app` is still not proven; authenticated production certification remains open. | Exact live revision proof + authenticated disposable-account certification | P0 | VertexED |
| Project 2424 | canonical local/Inkling source tracked in control issue #20; source repo not exposed to this GitHub App | BLOCKED / RECOVERABLE | Historical evidence exists but must be rerun. First-100 evidence queue is staged in PR #155. | Canonical Project 2424 Git source is not available through the connected GitHub installation and cloud restore is unresolved. | Restore canonical Git repo, rerun smallest baseline, then execute First-100 entries against real source | P0 | Project 2424 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / ACTIVE | ARC repaired-v5 validation infrastructure and independent QA exist; retained scientific verdict remains negative/inconclusive and confirmatory test access remains locked. | Externally grounded benchmark + strong baselines and publication provenance are incomplete. | Freeze/execute externally grounded >=5-seed benchmark package without weakening claim boundary | P0 research | LAM-JEPA |
| Notes-to-Video | `vertex-studyAI/Text-To-Video` | SHIPPABLE LOCAL PROTOTYPE | Repository documents strict workspace CI, real local MP4 smoke encoding, ffprobe verification, and external render-job provenance. | No production rendering/hosting, durable queue/storage lifecycle, or real narration pipeline. | Production-grade render queue/storage boundary or keep as polished local demo | P1 | Text-To-Video |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` (tracked in control issue #19) | BLOCKED | Certified hardening overlay exists in the control repo; target mutation is not verified. | Target GitHub/Supabase access is not exposed to this connected session. | Apply certified patch to exact target base and run real target release gate | P0/P1 | FinanceMeta |
| The Bu1LD | `ryangomez010/bu1ld-landing` (tracked in control issues #16/#84) | BLOCKED | Prior source-only certification exists. | Target GitHub/Supabase/Cloudflare access is not exposed; live hydration/deployment skew remains unresolved. | Apply target fixes, atomically deploy one immutable commit, then run seven role journeys | P0/P1 | The Bu1LD |
| Atlas | prior canonical reference `build-the-future-11/Atlas`; not exposed to this GitHub installation | BLOCKED | No current connector-visible source evidence in this execution window. | Repository is not available to the connected GitHub App. | Expose canonical Atlas repo, then inspect orchestration/runtime state | P1 | Atlas |
| Percy | local control-plane source tracked by issue #95; no connector-visible canonical repo | BLOCKED / RECOVERABLE | Reproduced snapshot schema failure is documented in control issue #95. | Local SQLite/runtime source is not available through this GitHub connector. | Repair schema compatibility and prove real worker liveness from local source | P0 | Percy |

## Changes merged during this execution window

1. `f5e7d1f3631f718e89bafaa539ec65516786c53a` — bind password-recovery authorization to the verified Supabase recovery session/account.
2. `6961002e3fa6a311a25d16d23f4b8ff742b02a0d` — prevent stale profile responses from crossing auth sessions.
3. `02f16b8b89daabf27a99cab405a39de481c19d2f` — clear transient Study Zone drafts/captions across account changes.
4. `4e8648d6f453d1342b132703c52daac3c4e512df` — stop duplicating the current Apex prompt in model context.

## Claim boundary

- No production deployment was performed.
- No Project 2424 source restoration was claimed.
- No research result was invented.
- No inaccessible repository was counted as inspected source.
- Green Vercel commit statuses are not treated as proof of the immutable revision serving the public production domain.
