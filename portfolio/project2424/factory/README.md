# Project 2424 Research-to-Preprint Factory

This directory is the canonical execution contract for turning the 2,424 Project 2424 child identities into real, evidence-backed research projects and, where scientifically justified, preprints.

## Non-negotiable rule

A reserved ID is not a completed project. A manuscript is not preprint-ready unless the evidence gate passes. Negative, mixed, inconclusive, merged-duplicate, and terminated outcomes are valid terminal scientific states.

## State machine

`RESERVED -> IDENTIFIED -> SPECIFIED -> IMPLEMENTED -> PILOTED -> EXPERIMENTED -> RESULT_FROZEN -> REPRODUCED -> PAPER_DRAFTED -> PREPRINT_READY -> PREPRINTED`

Alternative terminal states: `NEGATIVE`, `MIXED`, `INCONCLUSIVE`, `MERGED_DUPLICATE`, `TERMINATED`.

## Required per-project files

- `PROJECT.yaml` — canonical identity and lineage
- `RESEARCH_SPEC.md` — question, novelty gap, hypothesis, falsifier
- `PROTOCOL.yaml` — data, baselines, metrics, seeds, thresholds, stop rule
- `src/` — implementation
- `tests/` — contract and scientific-invariant tests
- `EVIDENCE.json` — immutable result manifest
- `CLAIMS.md` — claim-to-evidence ledger
- `REPRODUCE.md` — exact reproduction command and environment
- `manuscript/paper.tex` — evidence-bounded manuscript
- `manuscript/references.bib` — references
- `STATE.md` — current state, blockers, next gate

## Preprint gate

A project may be marked `PREPRINT_READY` only if all of the following are true:

1. canonical identity is resolved;
2. one falsifiable research question is frozen;
3. novelty/duplication review is recorded;
4. protocol was frozen before confirmatory interpretation;
5. at least one credible baseline is present;
6. implementation runs from a documented clean command;
7. raw artifacts and exact commit/config identities are retained;
8. the headline result is reproduced independently;
9. claims are no broader than the evidence;
10. manuscript Results match frozen artifacts;
11. limitations and negative findings are preserved;
12. authorship/licensing/data statements are resolved.

The factory must fail closed when any required evidence is absent. It must never fill missing results with generated numbers.