# NeuroCAD / T2424-0037 — Claim Audit

Audit state: **PASS FOR EVIDENCE-BOUNDED HISTORICAL/DIAGNOSTIC FRAMING / NOT A RELEASE PASS**

This audit is intentionally stricter than a marketing or product-readiness review. It binds manuscript language to the two retained scientific result generations and prevents product QA from being promoted into scientific validation.

## Result generations that must remain together

### Historical frozen v1 system result

- typed + validated: `19/20` (`0.95`);
- original direct baseline: `12/20` (`0.60`);
- valid held-out OpenSCAD execution: `12/12` non-empty STL on the retained valid cases;
- historical failure O018 remains part of the evidence.

### Later matched-validation component diagnostic

On the reused 20-case diagnostic:

- typed + validated: `1.00`;
- direct + matched fail-closed validation: `1.00`;
- original direct: `0.60`;
- `validation_recovery_fraction = 1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`.

The second result falsifies a typed-parser-specific causal explanation on that reused diagnostic. It does not erase the historical v1 system result.

## High-risk wording checks

| Candidate wording | Allowed? | Evidence-safe form |
|---|---|---|
| “NeuroCAD improved reliability from 60% to 95%” | **YES, HISTORICAL ONLY** | State that this is the frozen v1 system comparison against the original direct baseline and immediately disclose the later matched-validation diagnostic. |
| “Typed parsing caused the improvement” | **NO** | Later direct + matched validation reaches the same `1.00` as typed + validated on reused cases; typed-parser-specific causality is falsified there. |
| “Validation is the only mechanism that matters” | **TOO STRONG** | The reused diagnostic is validation-dominant; do not generalize that conclusion beyond the tested diagnostic. |
| “held-out component ablation” | **NO** | The 20 component cases are reused and must not be relabeled held-out/OOD. |
| “generalizes to new CAD tasks / OOD prompts” | **NO** | S3 confirmatory evaluation is not executed. |
| “manufacturing-correct” | **NO** | No completed confirmatory manufacturability study or external engineer validation supports that claim. |
| “externally validated” | **NO** | Outreach/pilot kit presence is not completed expert validation. |
| “publicly deployed” | **NO** | Artifact transport or hosting is not an accepted executable public-route/browser gate. |
| “125-case QA validates the research result” | **NO** | Product alpha QA is engineering evidence, not held-out scientific validation. |
| “state of the art” / “superior to modern CAD agents” | **NO** | No frozen matched contemporary provider/model benchmark supports this. |
| “T2424-0007 and T2424-0037 are the same project” | **NO pending provenance** | Count the evidence-bearing publication once under `T2424-0037`; keep `T2424-0007` identity-conflict blocked until an authoritative crosswalk exists. |
| “independently reproduced” | **ONLY WHERE THE EXACT RETAINED ARTIFACT CHAIN SUPPORTS IT** | Name exact source/workflow/artifact provenance rather than using a portfolio-wide reproduction claim. |

## Required main-text disclosures

A manuscript using NeuroCAD evidence must keep the following visible in the main body rather than hiding them in an appendix:

1. the historical v1 `19/20` versus `12/20` system result;
2. the later reused-case finding that direct + matched validation and typed + validation both score `1.00`;
3. the resulting `VALIDATION_DOMINANT` interpretation and typed-parser-specific causal falsification on those reused cases;
4. the fact that the later diagnostic is reused rather than newly held out/OOD;
5. historical failures such as O018;
6. the separation between scientific evidence and product/release QA;
7. the fact that S3 is a separate, unexecuted confirmatory successor.

## Product evidence boundary

The following may support engineering/reliability statements if cited accurately, but they must not count as external scientific validation or OOD research evidence:

- deterministic alpha QA;
- Chromium/WebGL or browser certification;
- OpenSCAD backend execution checks;
- stateful edit/regeneration behavior;
- release automation;
- artifact hosting/transport;
- outreach or pilot materials.

## S3 successor boundary

S3 may only change the scientific state after its own frozen identities, dataset revisions/hashes, provider/model comparators, criteria, seeds, authorization, raw artifacts, and independent verification exist. Until then, no manuscript sentence may imply that S3 confirmed generalization, contemporary-model superiority, manufacturability, or external validity.

## Identity accounting rule

Until an authoritative retained artifact resolves `T2424-0007` versus `T2424-0037`, publication accounting is fail-closed:

- count the evidence-bearing NeuroCAD scientific lineage once under `T2424-0037`;
- do not create a second publication/completion count for `T2424-0007`;
- do not infer aliasing from name similarity, numeric suffix, queue order, or memory.

## Release audit outcome

Current claim language can support a bounded historical-system plus causal-diagnostic technical report. It cannot support a typed-parser causal breakthrough, broad OOD/generalization claim, manufacturing-valid system, externally validated system, public deployment claim, or state-of-the-art comparison.
