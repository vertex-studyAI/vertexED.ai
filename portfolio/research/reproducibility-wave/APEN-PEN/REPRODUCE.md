# APEN / PEN — REPRODUCE

## Current reproducibility state

There is no executable reproduction command because no canonical APEN/PEN implementation is connected to this session. Do not reconstruct the method from the project names.

## Source-recovery gate

Before any experiment can count as an APEN/PEN reproduction, recover and record:

1. canonical repository and commit SHA;
2. canonical project identity and authorship/provenance;
3. whether PEN is distinct from APEN;
4. exact equations or algorithm;
5. dependency lock / environment;
6. dataset version and split manifest;
7. preprocessing/tokenization;
8. training command;
9. evaluation command;
10. baseline commands;
11. proposed method command;
12. ablation command;
13. seed list;
14. raw metric schema;
15. checkpoint/log locations.

## Minimum first experiment

Only after source recovery, freeze one bounded benchmark with:

- one simple baseline;
- one standard architecture baseline;
- the proposed APEN/PEN method;
- one mechanism-specific ablation;
- a predeclared primary metric;
- a fixed compute budget;
- at least five stochastic seeds when training variance is material and compute permits.

Report per-seed metrics, mean, sample SD and `n`. Use a suitable paired analysis only if the protocol supports paired comparisons.

## Bug policy

If recovered code does not run, retain the failure log before modifying it. Any repair must be classified as execution-only or scientific/protocol-changing. Scientific changes require a new protocol version and must not inherit earlier thresholds/results.

## Stop rule

If a distinct PEN mechanism cannot be established from source/provenance, consolidate it with APEN rather than maintaining two research names for one mechanism.