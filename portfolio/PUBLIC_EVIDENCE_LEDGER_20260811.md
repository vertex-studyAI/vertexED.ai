# Public Evidence Ledger — 11 August 2026

This file is a compact, evidence-first portfolio layer. It is intentionally stricter than project names, plans, prompts, or historical claims.

## Status vocabulary

- **Concept** — named idea/specification; no verified runnable implementation.
- **Prototype** — implementation exists, but release/research gates remain open.
- **Tested** — implementation has retained reproducible test/CI evidence.
- **Released** — public deployment/release is verified for the claimed artifact and scope.
- **Preprint** — a real preprint artifact exists and is linkable.
- **Published** — an external publication record is verified.

A build passing is not a release. A named architecture is not a trained model. A synthetic experiment is not a research-complete result. Manual/draft PRs are not counted as merged.

## Curated flagship set

| Project | Category | Evidence-backed status | What is verifiably built | Strongest evidence | Missing proof before stronger wording | Safe public wording |
|---|---|---|---|---|---|---|
| VertexED.ai | Product / EdTech | **Prototype / source release candidate; live public shell** | React/Vite education product, protected user flows, planner persistence, AI feature APIs, privacy-safe activation analytics, CI/eval/build gates | `package.json`; `docs/ANALYTICS_EVENTS.md`; `MASTER_PORTFOLIO_STATUS.md`; GitHub Actions; public site | Exact currently served production SHA; disposable authenticated golden journey; owner-controlled production security verification | “Built VertexED, an education platform connecting planning, practice, rubric feedback, and retrieval; source release gates are automated while production identity/auth certification remains open.” |
| The Bu1LD | Product / research community | **Tested source release candidate** | TanStack Start member/research platform with projects, labs, programs, evidence pages, applications, auth and release tooling | `ryangomez010/bu1ld-landing`; `landing-sites-release/final-release-report.md`; release scripts/tests | Live DB migration/role smoke, current deployment identity, production secrets/config | “Built a research/member platform with evidence-gated public claims, project applications, programs and labs; repository release checks pass, with production certification still gated.” |
| FinanceMeta | Product / education | **Prototype / recoverable; target write-blocked** | React/Vite/Supabase portal plus a separately tested landing recovery and authorization-hardening overlays | `build-the-future-11/finance4all-global-reach`; `portfolio/FINANCEMETA_LANDING_RECOVERY.md`; latest FinanceMeta control-plane PR evidence | Apply reviewed patches to canonical target; production Supabase denial-path tests; deployed user journey | “Developing FinanceMeta’s education/community portal; release and authorization recoveries are tested in the control plane but not yet applied to production.” |
| Project 2424 | Research portfolio / tooling | **12 merged tested implementations; 0 Certified Complete; 0 Research Complete** | Frozen First-100 registry, evidence ledger, runnable/tested packages, manual exact-head-green research candidates, identity controls | `MASTER_PORTFOLIO_STATUS.md`; `portfolio/project2424/FIRST_100_QUEUE.ndjson`; `portfolio/project2424/PROJECT_IDENTITY_AUDIT_20260811.md` | Resolve registry collision(s), restore/reproduce canonical baselines where required, independent reproduction for research-complete claims | “Maintaining an evidence-gated ML research portfolio with 100 frozen priority entries; 12 queue-consistent implementations are merged/tested, while certification and research-complete counts remain zero.” |
| LAM-JEPA | Research | **Tested negative/inconclusive research line** | Reproducible research scaffold and fail-closed negative-result slicing/claim enforcement | `vertex-studyAI/LAM-JEPA`; `MASTER_PORTFOLIO_STATUS.md` | Publication provenance/license/authorship gates; no hypothesis rescue via locked confirmatory data | “Ran a JEPA research line whose retained result is negative/inconclusive; preserved the failure boundary rather than relabeling it as positive.” |
| Notes-to-Video / Text-To-Video | Infrastructure / product prototype | **Shippable local prototype** | Durable local queue, bounded retries, verified encoder handoff, deterministic MP4 promotion | `vertex-studyAI/Text-To-Video`; `MASTER_PORTFOLIO_STATUS.md` | Production object storage/hosting, distributed worker semantics, narration and remote finalization | “Built a durable local text-to-video job pipeline with queue ownership, retries, verified encoding and deterministic artifact promotion.” |
| Percy | Agent/runtime infrastructure | **Concept / blocked source-runtime verification** | Historical orchestration/control-plane designs only on the connected evidence surface | `portfolio/checkpoints/2026-08-11-final-execution.json`; `MASTER_PORTFOLIO_STATUS.md` | Canonical source, preserved DB, schema compatibility, live process + heartbeat/lease evidence, persisted task progression | Do **not** claim a live autonomous agent fleet. Safe wording: “Designed Percy orchestration/runtime workflows; current runtime liveness is not verified on the connected evidence surface.” |
| Hercules | Model research | **Concept / architecture-to-surrogate queue item** | A frozen Project 2424 identity and architectural planning references; no verified trained/released model on the connected surface | `portfolio/project2424/FIRST_100_QUEUE.ndjson`; `portfolio/PORTFOLIO.md` | Canonical model source, runnable H0 baseline, forward/backward tests, tiny overfit, checkpoint roundtrip, measured experiment and independent reproduction | Do **not** claim an 8–12B model exists. Safe wording: “Hercules is a local-model architecture research concept awaiting a verified runnable baseline and ablation evidence.” |
| Olympus / Hermes and larger named variants | Model roadmap | **Concept only** | Roadmap/name evidence only on connected sources; Hermes appears as an architecture-to-surrogate queue item | `portfolio/PORTFOLIO.md`; `portfolio/project2424/FIRST_100_QUEUE.ndjson` | Canonical implementation, training logs/checkpoints, evaluations, resource justification | Do **not** imply parameter-scale models were trained. Safe wording: “Olympus is a staged model-research roadmap; named scale variants remain concepts until implementation and evaluation evidence exists.” |
| Portfolio evidence/control plane | Infrastructure | **Tested documentation/control layer** | Current status dashboard, checkpoints, exact-head CI references, Project 2424 identity accounting and recovery overlays | `MASTER_PORTFOLIO_STATUS.md`; `portfolio/checkpoints/`; `portfolio/project2424/` | Dedicated canonical control repository and broader connector coverage | “Built an evidence-control layer that separates source, CI, deployment, experimental and certification states across active projects.” |

## Strongest five portfolio items today

1. **VertexED.ai** — strongest product/system evidence: public product surface plus a substantial source release gate and analytics contract.
2. **The Bu1LD** — strong application/research-community system with retained release evidence; production certification remains separate.
3. **Project 2424** — strongest portfolio/research-operations story when stated precisely: 12 merged/tested implementations, zero certified/research-complete, and explicit identity accounting.
4. **Notes-to-Video / Text-To-Video** — strongest compact infrastructure artifact because the local queue→encoder lifecycle is concrete and testable.
5. **LAM-JEPA** — strongest scientific-integrity example because a negative/inconclusive result is retained rather than promoted beyond evidence.

FinanceMeta is important but currently weaker as a public flagship because its best recovery/security work is still control-plane/manual and target writes are blocked.

## Claims to remove or substantiate

- Any statement that Hercules is a trained 8–12B model or a released “local AGI.”
- Any statement that Hermes, Prometheus, Perseus, Atlas, Kronos, or another Olympus scale variant exists as a trained model solely because it has a name/parameter target.
- Any Project 2424 statement that treats 100 registry entries, 12 implementations, manual green PRs, Certified Complete, and Research Complete as interchangeable counts.
- Any FinanceMeta statement that implies the tested recovery overlays are already applied to the canonical repository or live Supabase.
- Any VertexED statement that equates source CI with the exact currently served production revision or an authenticated production golden journey.
- Any Percy/Atlas statement that implies live worker/runtime health without process plus heartbeat/lease/task-state evidence.
- Any “published research” wording unless a real externally verifiable publication/preprint record is linked.

## Application evidence ledger

| Item | Role/contribution evidence available | Artifact | External/independent evidence | Result that can be stated now | Best application use | Missing proof |
|---|---|---|---|---|---|---|
| VertexED.ai | Repository history/control repo; product source | Public site + repo + CI/eval artifacts | Public product surface; GitHub CI | Built/tested product system; public shell live | Technical entrepreneurship; product engineering | Exact prod SHA + authenticated golden journey + role attribution summary |
| The Bu1LD | Repository and release package | Platform repo + release reports | Public repository; release evidence | Tested source release candidate | Leadership + ML community infrastructure | Current production certification + concise contributor ledger |
| FinanceMeta | Portal repo + recovery artifacts | Portal + tested patches/control PRs | GitHub exact-head validation in control repo | Recoverable prototype, not production-certified | Entrepreneurship + finance education technology | Target integration, deployment and user-flow proof |
| Project 2424 | Frozen registry + control artifacts | Registry, packages, tests, PR evidence | Exact-head CI for manual candidates | 12 merged/tested; 0 Certified; 0 Research Complete | Research systems + methodological rigor | Independent reproduction and per-project author/contribution record |
| LAM-JEPA | Research repo | Code/results/claim boundary | Independent reproduction recorded in checkpoint | Negative/inconclusive retained result | Scientific maturity / research integrity | Publication/release provenance |
| Notes-to-Video | Engineering repo | Queue/worker/encoder code | CI and merged lifecycle work | Shippable local prototype | Systems engineering | Production/distributed validation |
| Hercules | Planning identity | Queue/roadmap references | None sufficient | Concept only | Future research direction only | H0 baseline + experiments |
| Olympus | Roadmap identity | Planning references | None sufficient | Concept only | Avoid as accomplishment; mention only as roadmap if needed | Implementation + training/eval evidence |

## Evidence requirements before promotion

### Model/research promotion

`Concept → Prototype` requires runnable source and a reproducible minimal command.  
`Prototype → Tested` requires deterministic tests plus retained outputs.  
`Tested → Experiment-run` requires frozen protocol, baseline, raw artifacts and seed/hardware metadata.  
`Experiment-run → Result-validated` requires predeclared metrics/gates and no post-hoc threshold rescue.  
`Result-validated → Research-complete` requires independent reproduction and a complete evidence package.  
`Research-complete → Preprint/Published` requires the actual manuscript/repository record and external bibliographic evidence.

### Product promotion

`Source release candidate → Released` requires exact deployed revision identity, a real production user journey, rollback/monitoring evidence, and the required backend/security denial-path checks for the product’s risk surface.

## Immediate portfolio next actions

1. Fix VertexED production identity first; do not substitute another feature PR for the live revision/golden-journey gate.
2. Restore effective GitHub target writes for FinanceMeta and The Bu1LD, then apply only already-reviewed recoveries on isolated branches and re-run their gates.
3. Keep Project 2424 counts frozen while resolving `T2424-0050` identity and independently reproducing the smallest high-value baselines.
4. Start Hercules at **H0**, not at a parameter-count claim: minimal reference transformer, forward/backward, tiny overfit, checkpoint roundtrip, inference smoke and measured memory/latency.
5. Keep Olympus at **O0 concept/toy-validation** until a distinct architecture hypothesis survives a small controlled ablation; do not schedule larger scale merely because a model name exists.
6. Add role/date/contribution evidence for leadership/community activities before using them as application claims; this connected repository does not currently verify those claims well enough to promote them here.
