# EXTERNAL VALIDATION QUEUE

**Date:** 2026-08-14  
**Rule:** no item becomes `GREEN — EXTERNAL VALIDATION` until outside evidence is actually received and retained.

| Priority | Project | Claim requiring outside evidence | Appropriate validator | Artifact to send / expose | Requested action | Minimum useful feedback | Success / failure interpretation |
|---:|---|---|---|---|---|---|---|
| 1 | LAM-JEPA | Negative ARC result is correctly scoped, reproducible, and scientifically useful | independent ML researcher / mentor not involved in implementation | manuscript draft, frozen protocol, artifact hashes, seedwise tables, reproduction command | reproduce one retained run or audit provenance and claim boundary | confirm result/provenance and identify strongest missing baseline/novelty concern | success strengthens paper package; failure reopens reproducibility/claim boundary, not the frozen raw result |
| 2 | NeuroCAD | Typed/validated IR provides a real correctness advantage beyond authored template artifacts | CAD/program-synthesis researcher or independent engineer | benchmark, direct baseline, typed-IR code, valid/invalid prompts, OpenSCAD outputs | run benchmark independently and review OOD set | reproduction plus concrete failure taxonomy | success supports controlled contribution; failure demotes to local engineering result |
| 3 | T2424-0027 | Synthetic leakage finding transfers to real multilingual encoders | representation-learning/NLP researcher or public pretrained encoder benchmark | preregistered real-encoder protocol, probes, controls, code | run/review real-encoder study | whether effect survives realistic encoder/data controls | success promotes standalone paper candidate; failure becomes informative negative transfer result |
| 4 | Darcy T2424-0050 | Synthetic mechanism remains useful against learned neural-operator baselines and held-out physics | scientific-ML/neural-operator researcher or independent benchmark runner | frozen synthetic package + learned-baseline harness + OOD regime definitions | reproduce matched-budget comparison | agreement on baseline fairness and OOD behavior | success promotes research story; failure limits result to analytic/synthetic mechanism |
| 5 | VertexED | Current production serves the intended immutable source and works through authenticated learner journey | real disposable test users + deployment owner | exact deployment ID/SHA, production URL, non-secret journey checklist | execute end-to-end journey and retain non-secret evidence | served revision identity plus successful create/save/fresh-session retrieve/logout denial | success permits production certification; failure stays BLOCKED/incident |
| 6 | The Bu1LD | Live deployment matches source and role boundaries hold | deployment owner + disposable role accounts | immutable deployment ID, release command, role-journey checklist | run seven-role production certification | no hydration errors, exact build identity, cross-role denials, core workflows | success permits production certification; failure keeps F state |
| 7 | FinanceMeta | Authorization hardening prevents role escalation and golden journey persists state | production Supabase owner + disposable member/admin | hardening migration/branch, RLS verification queries, product journey | apply in controlled production/preview and attempt escalation | member cannot write privileged role; normal profile update still works; admin boundary holds | success moves from security-blocked productization to validation; failure is P0 |
| 8 | APEN | Salience-dependent effect survives learned/naturalistic controls | external ML reviewer / independent runner | frozen controlled study + proposed natural task | review/run matched learned baseline and salience corruption | whether effect persists without privileged salience | success promotes; failure closes as controlled-only result |
| 9 | NPMS | Controlled memory result transfers to natural/OOD sequence tasks | external sequence-model reviewer | controlled package + frozen natural-task protocol | reproduce one OOD/natural comparison | matched learned-control result | success promotes; failure constrains claim |
| 10 | Percy | Evidence-native scheduling is reliable on the real persistent host | existing Mac host operator + independent verifier process | SQLite/WAL snapshot, process/lease inventory, scheduler metrics, crash-recovery logs | measure existing state, run bounded crash/recovery/duplicate-suppression qualification | measured throughput, duplicate rate, stale-task behavior, recovery success, cost/compute counters | success supports engineering release; failure triggers reliability fixes, never worker-count escalation |

## External-only blockers that Percy cannot self-certify

- Independent reproduction by a person/process not authoring the original implementation.
- Peer review and venue acceptance.
- Real-user usefulness/retention.
- Production deployment identity on accounts not exposed to this session.
- Human/domain-expert CAD validity beyond executable geometry.
- Real-world scientific generalization beyond synthetic/local benchmarks.

## Queue discipline

External requests must be narrow. Do not ask a reviewer to “review the whole portfolio.” Send one artifact, one claim boundary, and one requested action. Record negative outside feedback as evidence rather than repeatedly seeking a favorable reviewer.
