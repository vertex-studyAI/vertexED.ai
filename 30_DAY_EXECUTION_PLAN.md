# 30-DAY EXECUTION PLAN

**Window:** 2026-08-14 → 2026-09-12  
**Objective:** maximum defensible closure, not maximum activity.

Hard concurrency limits:

- **3** major scientific experiments running at once
- **2** major paper conversions at once
- **2** major product validation programmes at once
- no Tier B compute while a runnable Tier S/A decisive gate is idle

## Week 1 — 14–20 August: recover, compress, verify

### Portfolio control

1. Review/merge the `portfolio/closure-20260814` evidence branch only after confirming it changed status/governance artifacts, not scientific raw results.
2. Treat `PORTFOLIO_SNAPSHOT_20260814.md` as the immutable dated recovery; `PORTFOLIO_SNAPSHOT.md` remains a pointer.
3. Complete missing provenance fields in `EXPERIMENT_REGISTRY.json` **from verified source only**: exact command, artifact path/hash, config, code SHA, environment where currently `UNKNOWN`.
4. Deduplicate Project 2424 identities against canonical source once the real source is available. No new project names.

### Percy P0

On the **existing real Mac host**, read-only first:

- locate `/Volumes/PRO-BLADE/Atlas/Percy/control-plane/memory/percy.db` and WAL/SHM;
- SQLite integrity check and online backup before migration;
- inspect schema version/migration log;
- reconcile task states against leases, PIDs, meaningful process commands, heartbeats and worktree activity;
- classify shell-only panes as non-running;
- preserve dirty/stale worktrees;
- measure actual READY/CLAIMED/RUNNING/VERIFYING/COMPLETE/FAILED/BLOCKED/STALE/CANCELLED counts;
- measure unique dispatched workers and real physical peak if history supports it;
- record provider/CPU/RAM/storage bottlenecks;
- **do not reset/re-register/requeue blindly**.

If the Mac host is unavailable, Percy remains `F — EXTERNALLY BLOCKED`; do not substitute historical counts.

### Product P0

**VertexED only** until its production boundary is resolved:

- inspect incident `#137` and latest Production Health artifact;
- identify why public smoke passes while the workflow still marks production unhealthy;
- verify `/api/health` serves the exact intended revision;
- only then run the authenticated golden journey;
- freeze source GREEN separately from production GREEN;
- do not add broad features.

FinanceMeta/Bu1LD remain blocked until exact canonical target access exists.

### Tier-S closure work

Run **paper/evidence work, not rescue compute**:

- LAM-JEPA: complete provenance chain + figure/table regeneration + failure chronology.
- NGMT v0.1: recover exact artifact/command + concise B0–B3 failure analysis.
- Eigen-JEPA: resolve/document `14,895` vs `14,899` row provenance without editing data to fit prose.
- IRIS v0.2: convert common-adaptation negative gate into a frozen results/failure section; confirm reserved seeds remain untouched.

### Week-1 exit gate

Week 1 is complete when:

- real Percy state is measured **or explicitly still external-blocked**;
- VertexED production incident has a precise root-cause class or a named external dependency;
- all Tier-S claims map to experiment-registry entries;
- no active project has ambiguous identity/status;
- kill list is enforced.

## Week 2 — 21–27 August: dangerous baselines, ablations, clean reproduction

Only three major scientific experiments may run concurrently.

### Experiment slot 1 — NeuroCAD

Freeze before execution:

- same provider/model/version
- same system information
- same temperature/sampling
- same token budget
- same retry budget
- same seed/request set
- structured IR vs direct generation
- constrained direct generation if feasible
- retrieval/template baseline if feasible

Dataset buckets:

- deterministic existing cases
- paraphrases
- unseen construction patterns
- ambiguous requests
- constraint-heavy requests
- multi-operation requests
- invalid/impossible requests

Primary outcomes: syntax validity, executable success, geometry validity, dimension/constraint accuracy, retry rate, latency/tokens/cost.

**Kill criterion:** if a matched direct/constrained baseline closes the material advantage, narrow to software usefulness or negative scientific result.

### Experiment slot 2 — APEN

Freeze one same-information learned-memory comparison:

- no memory
- fixed/uniform memory
- matched recurrent memory
- matched attention memory or retrieval control where fair
- APEN true salience
- shuffled salience
- distribution-matched random salience
- salience corruption levels chosen before evaluation

Use a non-toy/naturalistic task only if licensing/data provenance is clear.

**Kill criterion:** if matched learned memory explains the effect or realistic salience corruption removes practical value, stop architecture-superiority work and preserve the bounded mechanism result.

### Experiment slot 3 — T2424-0027

Only if a real encoder/dataset can be frozen without leakage:

- frozen pretrained encoders
- centered representation control
- random-group control
- random-subspace control
- probe capacity matching
- seed policy
- primary statistic/falsifier

**Kill criterion:** if the effect disappears under nuisance controls, convert to a synthetic-audit result rather than retune.

### Reproduction slot — not counted as new science when no tuning occurs

Fresh worktree/environment reproduction for one Tier-S result, preferably LAM-JEPA or NGMT, with independent metric recomputation.

### Week-2 exit gate

Each experiment produces either:

- a verified result + raw/config/hash/verifier package;
- a fair negative result + failure analysis;
- or a precise external/compute blocker.

No “still investigating.”

## Week 3 — 28 August–3 September: manuscripts + external/product validation

### Paper conversion cap: 2

**Paper slot 1: LAM-JEPA negative result**

Required sections complete with no unsupported prose:

- precise question/hypothesis/falsifier
- closest related directions/originality boundary
- ARC protocol and controls
- five-seed results/uncertainty
- planner/target ablations
- prediction-collapse/failure analysis
- software defect and repair chronology
- locked-test non-use
- limitations
- reproducibility/provenance
- figures regenerated from retained data

**Paper slot 2:** choose exactly one of **IRIS v0.2, NGMT v0.1, Eigen-JEPA** based on the strongest reviewer-resistant lesson after Week 1. The other two get concise technical-result packages, not parallel full manuscripts.

### External validation

Start with the highest-value independent action from `EXTERNAL_VALIDATION_QUEUE.md`:

1. LAM independent rerun/review.
2. NeuroCAD external benchmark review if Week-2 gate survives.
3. VertexED real-user/production validation only after exact revision is healthy.

External validators receive frozen artifacts; feedback is retained even when negative.

### Product validation cap: 2

- **VertexED**: production + user activation validation.
- Second slot only if FinanceMeta or Bu1LD canonical target becomes accessible; choose **one**, not both by default.

Two-week product tests measure observed behavior; they do not invent traction.

## Week 4 — 4–12 September: release/submission candidates and portfolio re-kill

### Research release candidates

- LAM-JEPA: preprint/technical-report candidate only if provenance + originality + reviewer gates pass.
- Second negative paper/technical report: only if Week-3 package is coherent and reproducible.
- NeuroCAD/APEN/T2424-0027: manuscript skeleton only if Week-2 baseline gate survives; otherwise record negative/bounded result.

### Infrastructure release candidates

- Research Atlas V4: clean public-safe reproducibility example with a second-user rerun.
- Percy: release/technical-report candidate only if real-host reliability evidence and fault tests exist.

### Product release candidates

- VertexED: production GREEN only after exact-served revision + authenticated journey + security boundary + real workflow evidence.
- FinanceMeta/Bu1LD: remain blocked if canonical target or live authorization is missing.

### Re-rank and kill

On 12 September:

- rescore every active project;
- promote only on new evidence;
- archive baseline-dominated or low-information successors;
- keep negative results intact;
- reduce active queue again if necessary.

## Daily operating loop

Every day:

1. **Recover** current state; never assume yesterday's labels are current.
2. **Verify** changed commits/artifacts/results.
3. **Prioritize** by information gain × closure probability / remaining cost.
4. **Execute** smallest decisive work first.
5. **Verify again** independently where possible.
6. **Update evidence** with raw outputs/config/hashes.
7. **Update claims** only to the supported boundary.
8. **Kill or promote**; avoid indefinite “in progress.”
9. **Queue only dependency-ready tasks** with exact deliverables.

## 30-day success target

Success is not a project count. By 12 September aim for:

- one reviewer-resistant LAM-JEPA negative paper package;
- one additional strong negative/technical-report package from IRIS/NGMT/Eigen, not three weak papers;
- one decisive NeuroCAD matched-baseline result;
- at most one additional mechanism project promoted by real evidence;
- a truthful Percy host snapshot and reliability gate, or explicit external blockage;
- VertexED production either verified or reduced to one precise external/deployment blocker;
- a materially smaller active Project 2424 registry;
- documented external-validation attempts/results;
- no hidden failed runs and no unsupported GREEN states.