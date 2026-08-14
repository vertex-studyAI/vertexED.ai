# NEXT TASK QUEUE

**Rescored:** 2026-08-14 22:04 IST after independent LAM verification/external-packet closure, Darcy v2 protocol-freeze reconciliation, latest VertexED production-monitor/access evidence, and bounded IRIS source recovery  
**Rule:** information gain × closure probability × evidence value ÷ cost. Dependencies are hard.

## 1 — PERCY-STATE-001 — P0 / BLOCKED_EXTERNAL_MAC
- Recover the existing Percy host state **without reset**.
- Deliver: checksummed SQLite+WAL+checkpoint snapshot, integrity/schema result, queue counters, leases/heartbeats/stale workers, dirty worktree state.
- Verify independently against the preserved snapshot.
- Failure: remain blocked; never create a replacement DB to make counters look clean.

## 2 — P2424-CANON-001 — P0 / BLOCKED_EXTERNAL_SOURCE
- Re-establish the preserved canonical Project 2424 source/overlay and reconcile count/status contradictions.
- Deliver: verified HEAD/ancestry, dirty-overlay manifest/hashes, smallest baseline rerun, canonical child map.
- Failure: block source-dependent new experiments; preserve bounded existing reproductions.

## 3 — LAM-RELEASE-METADATA-003 — P0 / BLOCKED_OWNER
- Internal numerical/asset provenance is now closed.
- Deliver only owner-controlled release metadata: license decision/compatibility review, approved author list/order, `CITATION.cff`, redistribution boundary and immutable release revision.
- Do not infer these fields from repository history, commit authorship or prior drafts.

## 4 — VERTEX-PROD-001 — P0 PRODUCT / BLOCKED_EXTERNAL_DEPLOYMENT_IDENTITY_AND_CAPACITY
- Establish exact served revision and authenticated golden-journey truth.
- Latest verified scheduled production-health run `31817794439` at 2026-08-14 21:37 IST failed all three bounded attempts because `/api/health` returned healthy but **omitted revision identity**.
- That run's deploy-path contract expected runtime revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin and untrusted-origin smoke boundaries all passed.
- Retained evidence artifact: `production-health-31817794439`, artifact ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.
- On verified control head `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d`, both Vercel status contexts reported `build-rate-limit` failures. Do not infer that the control head is serving production.
- Live connected Supabase security advisors still report leaked-password protection disabled and security patches available for `supabase-postgres-17.4.1.074`; those are separate owner/platform hardening gates, not proof of an outage.
- Deliver: canonical Vercel project identity, exact intended/served source identity, deployment ID, `/api/health` revision proof matching the intended deploy-relevant SHA, production monitor PASS, disposable-account core workflow + cleanup record.
- Do not add product features or weaken the monitor to work around deployment identity/capacity uncertainty.

## 5 — EXTVAL-LAM-001 — P1 / READY_EXTERNAL_PACKET
- Immutable independent reproduction/review packet is merged to `LAM-JEPA/main` as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.
- Send that exact package to a genuinely independent validator for reproduction + skeptical review, not endorsement.
- Retain validator identity/date, exact artifact revision, observed hashes/numbers, discrepancies, source-method critique and success/failure interpretation.
- External validation stays **RED/PENDING** until returned outside evidence exists. Packet readiness or outreach is not validation.

## 6 — IRIS-FRONTIER-SOURCE-001 — P1 / PROTOCOL_BLOCKED_AFTER_PARTIAL_SOURCE_RECOVERY
- Frozen protocol remains `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md`; confirmatory seeds `1000–1029` remain untouched/forbidden.
- Authentic retained archives were recovered and byte-checked in `portfolio/research/evidence/IRIS_FRONTIER_SOURCE_RECOVERY_20260814.json`:
  - `IRIS_v0.2_repro_addendum_20260813.zip`: observed SHA-256 `7653c87d5effb08da9068630259802d77b34b930083dd160ccea4ce23311175b`, exactly matching the recorded expected digest; internal listed file hashes pass.
  - `IRIS_common_adaptation_harness_v1_negative_20260813.zip`: observed SHA-256 `5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90`; deterministic common generator, development seeds `0–9`, method implementations/parameters, metric rows, verifier and retained negative verdict recovered.
- Recovered methods include Huber cap-4, confirmed-change/streak Huber family, robust CUSUM switch, dual-timescale Huber, PABIM and oracle-reset Huber. Retained development verdict remains `NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE` / `FALSIFIED_FOR_ADVANCEMENT`.
- Execution still stops: the separately frozen 2026-08-14 frontier protocol requires the canonical generated development trajectory arrays, or a pre-existing authoritative equivalence declaration tying deterministic regeneration to those arrays. Neither has been recovered. A frontier-specific immutable environment/source manifest is also still required.
- Next gate: recover that canonical raw trajectory artifact or an already-retained equivalence record. If neither exists, preserve `PROTOCOL_BLOCKED`; do **not** regenerate ambiguously, execute the frontier, or touch seeds `1000–1029`.

## 7 — DARCY-EXEC-FREEZE-002 — P1 / WAITING_EXECUTABLE_MODEL_CONFIG_AND_SOURCE
- `DARCY-FREEZE-001 / darcy-operator-ood-v2` is **CLOSED AS A SCIENTIFIC PROTOCOL FREEZE** on canonical main via `6fbd9c4ba73a460f5abbe6a6f4c478b6bc50e389` and `portfolio/project2424/projects/T2424-0050/LEARNED_OPERATOR_OOD_PROTOCOL_V2.md`.
- Do **not** execute v2 yet. The protocol itself requires the following before the first learned training run: exact library versions; FNO/DeepONet implementation/revision; parameter-count target/range; optimizer; learning-rate grid/schedule; batch size; epoch/step cap; early-stop rule if any; training-only normalization; validation-selection rule; seeds; hardware identity; compute/time cap.
- Recover or implement these prerequisites on a canonical source path, commit them before training, hash the generator/split manifest, and independently check protocol conformity.
- Only after that pre-run executable freeze passes may the already-preregistered v2 training/evaluation execute. No post-test retuning; a material change creates v3.

## 8 — NPMS-SOURCE-001 — P1 / BLOCKED_SOURCE_IDENTITY
- Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment.
- Deliver: canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict.
- Preserve known negative spectral/switching/truncation cases.
- Failure: archive the line as bounded recovered evidence rather than inventing a replacement implementation.

## 9 — FINANCEMETA-HARDEN-001 — P1 PRODUCT / BLOCKED_EXTERNAL_GITHUB_WRITE_AND_SUPABASE
- Canonical target `build-the-future-11/finance4all-global-reach` is readable through the connected GitHub installation at `fbdd503223edc5b1780509720391083f485a4a85`, but a fresh isolated branch-creation attempt returned `403 Resource not accessible by integration`.
- Connected Supabase currently exposes only VertexED project `xwlrzgfuhfbckgvcmyoq`; FinanceMeta production Supabase is not available to the connector.
- Confirmed source defect remains: authenticated users can update their own `profiles` row while authorization helpers trust `profiles.role`; current policy lacks a `WITH CHECK` boundary on update, insert does not force role `member`, and public `SECURITY DEFINER` helpers lack a pinned search path/explicit execution boundary.
- Smallest unblock: grant GitHub contents/branch/PR write access for the target and connect the FinanceMeta Supabase project. Then create an isolated exact-base branch, generate the migration through the repository's Supabase migration workflow, add denial-path regression tests, and validate against current Supabase guidance before application.
- Do not apply a production migration, change secrets or claim closure until the FinanceMeta Supabase project is connected and tests prove a normal member cannot escalate role.

## 10 — JEPA-TS-FREEZE-001 — P2 / DORMANT_UNTIL_CAPACITY
- The canonical programme remains one question: causal future-latent predictive-state recovery under noise/missingness.
- Before any run, freeze one machine-readable cheap synthetic experiment with exact generator, objectives, TS-JEPA/data2vec/reconstruction/autoregressive/statistical baselines, corruption grid, paired seeds, 5pp falsifier, compute budget and verifier.
- No real-data expansion unless the synthetic gate survives. No run is currently authorized.

## 11 — PORTFOLIO-RESCORE-003 — P1 / WAITING_DECISIVE_EVIDENCE
- Re-score only after the tasks above produce material evidence.
- Maximum Tier S = 5; current Tier S = 3 and no replacement is required.
- Every promotion/demotion must cite an exact new artifact/gate.

## Closed this wave

- `LAM-PAPER-001` source/provenance/originality/reviewer closure — **CLOSED INTERNALLY:** canonical LAM paper/source work is on `LAM-JEPA/main`.
- `LAM-VERIFY-002` — **CLOSED INTERNALLY:** raw Actions artifacts `9162165932`, `9003785715`, and `9003740436` were independently downloaded; ZIP/raw JSON digests matched canonical provenance; five-seed full/matched/ablation values and bounded pretrained characterization were independently recomputed; deterministic CSV/Markdown/SVG assets regenerated. Verification record merged as `725ae2fb17de9c988938d4b03bd8a6be456b8e8b`; numeric-basis guard merged as `bf8311e1a4d240e2891e51af38eaf7754944e300` with no scientific outcome change.
- `EXTVAL-LAM-PACKET-001` — **CLOSED PACKAGING ONLY:** immutable external reproduction/review packet merged as `218ea1bea686cdf8c281520b2b636897bc8b8dd2`; no outside result exists yet.
- `IRIS-FRONTIER-FREEZE-001` — **CLOSED DESIGN:** development-only false-open constrained baseline-frontier protocol is frozen.
- `IRIS-FRONTIER-SOURCE-RECOVERY-20260814` — **PARTIAL RECOVERY / PROTOCOL_BLOCKED:** two authentic retained archives and substantial exact generator/method/metric evidence were recovered with hashes, but canonical raw frontier trajectories/equivalence record remain missing; no frontier execution is authorized.
- `DARCY-FREEZE-001` — **CLOSED PROTOCOL DESIGN ONLY:** v2 scientific question, data families/splits, systems, metrics, uncertainty, seeds and falsifiers are preregistered in `LEARNED_OPERATOR_OOD_PROTOCOL_V2.md`; executable learned-model/configuration/compute freeze remains open as `DARCY-EXEC-FREEZE-002`, and no v2 run has occurred.
- `JEPA-TS-PROGRAM-001` — **CLOSED DESIGN:** one literature-bounded JEPA-time-series programme exists; no experiment authorized.
- `IRIS-DECIDE-001` — **CLOSED:** no successor architecture authorized.
- NeuroCAD component-confound ablation — **CLOSED / FALSIFIED MECHANISM:** direct+matched validation equals current compiler; `VALIDATION_DOMINANT`.
- PR #319 stale closeout — **CLOSED UNMERGED**, history preserved.
- stale command-center issue #122 — **CLOSED SUPERSEDED**.

## Scheduling guard

**Zero new major scientific experiment runs are authorized right now.** Percy/Project 2424/NPMS are source or live-state recovery first; IRIS is now explicitly `PROTOCOL_BLOCKED` after partial exact source recovery; Darcy v2 is protocol-frozen but still blocked on its mandatory executable implementation/config/budget freeze; JEPA×time-series is dormant design; NeuroCAD research is deprioritized after its mechanism falsifier; LAM is owner metadata + external review only; VertexED is deployment certification only. Unused compute capacity should remain unused rather than generate low-information experiments.
