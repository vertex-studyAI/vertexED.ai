# T2424-0036 Status

**Project:** Rubik's A* Intelligence

## Current state

`TESTED_TOOL / EXACT_HEAD_CI_VERIFIED / MERGED / SCIENTIFIC_SCOPE_BOUNDED`

## Verified integration evidence

Canonical PR #169 passed exact-head GitHub Actions CI run `31409707818` on head `422807799833247d6ea7ab095b557d26d41e2b57` and merged as commit `1b143eb8904e5568f9ed8db537951a701e22f88f`.

## Substance present

- [x] orientation-free corner permutation model
- [x] U/R/F and inverse moves
- [x] admissible search heuristic
- [x] deterministic A* implementation
- [x] explicit depth/node resource bounds
- [x] fixed benchmark with returned-path verification
- [x] root-level regression suite
- [x] exact-head repository CI verified
- [x] canonical package merged
- [x] documented limitations and next gate

## Scientific / product boundary

This package is GREEN as a **tested search/tool prototype**.

It does **not** establish:

- a complete 2x2 Rubik's Cube solver, because corner orientation is not represented;
- a full 3x3 solver;
- learned search intelligence;
- general artificial intelligence;
- publication novelty or research completion.

## Open research extensions

- full 2x2 corner orientation;
- stronger deterministic baseline comparison such as IDA*/pattern databases;
- separately frozen learned-heuristic experiment if pursued.

These are successor research tasks, not blockers on the existing tested-tool verdict.
