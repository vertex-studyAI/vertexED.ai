# BLOCKERS

**As of:** 2026-08-14 after LAM internal evidence closure and VertexED production monitor run `31777345899`. Only blockers that prevent a stronger evidence claim are listed. Closed gates are not retained as blockers.

## P0 — Percy authoritative live state
Existing Mac SQLite/WAL/process/worktree state is not visible from this execution surface. Run `PERCY-STATE-001` non-destructively: snapshot/hash SQLite + WAL + checkpoint state, run integrity/schema checks, reconcile queue counters, leases, heartbeats and stale workers, record dirty worktrees, then independently recount. Do not reset or reconstruct the DB to make counters clean.

## P0 — VertexED exact production revision + authenticated golden journey
Latest verified scheduled production-health run `31777345899` failed all three bounded attempts because live `/api/health` returned healthy but omitted revision identity; expected deploy-relevant revision was `8272b8cba0dab6e9a07ee6aa4f927ad9374de534`. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin protection and untrusted-origin rejection passed. Evidence artifact: `9210378746`; artifact SHA-256: `0ac55469c423b845db9c6ba3f6bb412990c53be4e4d1929bc258d5cd1ca10924`.

Required closure: prove exact intended and served source revision, deployment ID, `/api/health` revision matching the deploy-relevant SHA, production monitor PASS, then execute a disposable-account authenticated core journey with cleanup evidence. Do not add product features to work around deployment-identity uncertainty.

## P0 — Project 2424 canonical source recovery
Selected child evidence remains preserved, but umbrella canonical source / dirty-overlay recovery depends on preserved local or Inkling state. Recover verified HEAD/ancestry, overlay manifest + hashes, smallest authorized baseline rerun and canonical child map before source-dependent new experiments. Registry count is not research completion.

## P0 — LAM-JEPA owner-controlled release metadata + outside validation
LAM's negative scientific result, source/method reconciliation, raw-artifact provenance, deterministic paper assets and internal skeptical-review package are closed on canonical `LAM-JEPA/main`. Numeric-basis guard is `bf8311e1a4d240e2891e51af38eaf7754944e300`; immutable external reproduction/review packet is `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.

Remaining blockers are intentionally human/external only:
- owner-approved license / redistribution compatibility decision;
- approved author list and order;
- owner-approved `CITATION.cff` / immutable release revision;
- genuinely independent outside reproduction and skeptical review.

Do not infer authorship, licensing or external validation from repository history or packet readiness. Superiority/planner/target claims remain unsupported.

## P1 — IRIS exact retained source for frozen baseline-frontier protocol
The current successor search is closed and no new architecture is authorized. `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is frozen; execution is blocked on exact retained development trajectories, implementations/parameters and metric code. If exact source cannot be recovered, record `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data. Confirmatory seeds `1000–1029` remain quarantined.

## P1 — NPMS canonical source identity
Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment. Deliver canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict. Preserve known negative spectral/switching/truncation cases; do not invent a replacement implementation.

## P1 — Darcy learned/OOD freeze
The bounded aligned synthetic result is preserved, but the dangerous matched learned-operator / OOD comparison is not executable until canonical source and protocol details are frozen: data/version, systems, equal budget, metric, seeds, uncertainty, misaligned/correlation-length/held-out regimes, success criterion and falsifier. No run before freeze.

## P1 — APEN / Eigen-JEPA
Secondary research lines remain behind their predeclared stronger learned/statistical controls and natural/OOD gates. Existing mixed/negative evidence remains visible; no in-place rescue.

## P1 — NeuroCAD new scientific claim
The old typed-parser causal interpretation is falsified by the component-v2 diagnostic and is not an open blocker to be rescued. Any new paper-level claim requires a genuinely fresh broader benchmark and competent contemporary direct/program-generation baseline. Do not tune the old 20 cases.

## P1 — Hercules / Olympus
No significant compute until decisive matched protocols are frozen. Architecture names, parameter targets and runtime/governance demos are not trained-model capability evidence.

## P1 — FinanceMeta / The Bu1LD target access
Canonical writable target/runtime surfaces remain unavailable from this execution surface. Production authorization, RLS/role boundaries, deployment identity and authenticated golden-journey evidence therefore remain externally blocked. Do not substitute control-repo activity for production evidence.

## Scheduling guard
Zero new major scientific experiment runs are authorized while these higher-information source/live-state gates remain open. Unused compute stays unused rather than becoming low-information work.
