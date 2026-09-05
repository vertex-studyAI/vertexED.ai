# NeuroCAD × COPES — Pressure-Test Brief

**Meeting:** 2026-09-01, 11:30 IST  
**Project:** T2424-0037 / NeuroCAD  
**Purpose:** obtain technically useful external pressure-test feedback without overstating the current evidence.

## 1. One-sentence project description

NeuroCAD tests whether a typed, validated intermediate CAD specification between natural-language intent and backend CAD code can improve executable semantic correctness and fail-closed safety relative to matched direct-generation systems.

## 2. Evidence that is safe to state

Historical evidence is narrow and must remain bounded:

- v1 held-out rectangular-plate benchmark: typed/validated compiler 19/20 versus original direct-flat extraction 12/20;
- a later matched-validation component diagnostic found the earlier gap to be **validation-dominant** on the reused 20-case diagnostic;
- therefore the typed-parser-specific causal interpretation is **falsified on that reused diagnostic**;
- the old 20 cases are not evidence for broader text-to-CAD novelty and must not be presented as held-out evidence for S3;
- S3 is a new, unexecuted confirmatory lineage and currently has **no authorized confirmatory result**.

## 3. Frozen S3 research question

Under matched model/provider/budget conditions, does generating a typed, validated intermediate CAD specification before backend code improve executable semantic correctness and fail-closed safety on broader text-to-CAD tasks compared with direct CAD program generation and execution-repair baselines?

## 4. Predeclared successor gates

The frozen successor targets a 150-case paired benchmark with these primary promotion requirements:

- **H1 semantic correctness:** typed-IR improves semantic test pass rate by at least +10 percentage points absolute over the strongest matched direct-generation baseline;
- **H2 safety:** correct reject/abstain improves by at least +15 points without reducing valid-case semantic pass rate by more than 5 points;
- **H3 editability:** reopen-and-edit success improves by at least +10 points where supported;
- matched validation must be isolated: if validation alone closes >=80% of the typed system's advantage, mechanism classification becomes `VALIDATION_DOMINANT_OR_NONUNIQUE`;
- no threshold movement, adverse-case deletion, baseline replacement, favorable-seed selection, or post-result rescue tuning is allowed.

## 5. Baselines COPES should challenge

- **M0:** typed IR -> schema/constraint validation -> deterministic backend emitter -> executable tests.
- **B0:** matched direct CAD program generation.
- **B1:** matched direct generation + one predeclared execution-repair attempt.
- **B2:** direct generation + matched deterministic fail-closed validation. This is the critical mechanism-control baseline.
- **B3:** constrained/template/retrieval baseline, with coverage reported explicitly.

Historical `direct_flat_extraction` is legacy-only and cannot serve as the strongest S3 baseline.

## 6. Current authorization blocker

Do **not** claim S3 has run. `EXECUTION_AUTHORIZATION.json` must remain absent/fail-closed until all identities are frozen.

Already frozen:

- CADTestBench upstream code revision: `e29283cc61db7329039d95b429766a50bfd37f89`;
- MUSE upstream code revision: `dcb1638f556e2821170891ccfe744cffc5ac21d1`.

Still required before confirmatory execution:

1. exact immutable dataset revisions for CADTestBench and MUSE;
2. consumed-file manifests and deterministic content hashes;
3. emitted benchmark-record manifest and SHA-256;
4. frozen development/confirmatory split manifest;
5. proof adapter validation uses development-only records;
6. exact provider/model/version identity;
7. M0 and B0-B3 implementation/config hashes;
8. prompt, token/call, retry, repair, and backend-execution budgets;
9. final repository commit containing all authorization inputs.

## 7. Questions to put to COPES

Use the meeting to attack the design, not to seek generic endorsement.

1. **Mechanism:** What control would most convincingly distinguish benefit from typed representation versus benefit from validation alone?
2. **Semantic evaluation:** Which executable geometric/topological tests would they consider strongest for real engineering usefulness rather than visual plausibility?
3. **Failure modes:** Which malformed, contradictory, or physically invalid prompts are most likely to expose a false sense of safety?
4. **Baseline strength:** Is B1/B2 sufficient, or would an engineer expect a stronger direct-generation + tool-feedback baseline?
5. **Manufacturability:** What minimum manufacturability or downstream-editability checks would make the benchmark meaningfully CAD-relevant?
6. **Distribution shift:** Which geometries/interfaces should be deliberately outside the historical plate grammar to prevent benchmark leakage?
7. **Abstention:** What should count as a correct reject versus an unnecessarily conservative failure?
8. **Reproduction:** What artifact bundle would an external engineer need to independently reproduce one case end-to-end?

## 8. Demo discipline

If demonstrating software, separate engineering behavior from scientific evidence:

- demo outputs are **product/engineering demonstrations**, not S3 results;
- retain every failed or malformed output shown during the session if later used as development feedback;
- do not edit the frozen confirmatory benchmark based on observed model performance;
- COPES suggestions may change a future protocol only through an explicit pre-execution amendment before confirmatory outputs are opened.

## 9. Best concrete outcome from the meeting

The strongest useful result is not an endorsement quote. It is one or more of:

- a specific missing control or baseline;
- a concrete engineering failure-case family;
- a reproducibility requirement;
- a manufacturability/editability criterion;
- willingness to review the frozen benchmark/protocol before execution;
- willingness to independently reproduce a small predeclared subset after execution.

Record feedback verbatim enough to distinguish external suggestions from decisions made internally.

## 10. Post-meeting evidence update

Immediately after the meeting create a dated feedback record containing:

- attendees/roles;
- exact technical critiques and suggested tests;
- which suggestions are accepted/rejected and why;
- whether any accepted change requires a protocol amendment;
- confirmation that no confirmatory S3 outputs had been opened before the amendment;
- any external reproduction commitment, clearly labeled as proposed until actually completed.

No meeting, affiliation, comment, or expression of interest is itself scientific validation.