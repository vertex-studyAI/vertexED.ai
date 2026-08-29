# NGMT v0.1 — Independent Reproduction Protocol

**Status:** frozen reproduction specification; no new scientific result is claimed by this document.  
**Scope:** reproduce the already-frozen NGMT v0.1 negative/inconclusive result without modifying the original hypothesis, gates, seeds, mechanism, or reported evidence.  
**Source branch:** `research/ngmt-v01-frozen-20260813`.

## 1. Purpose

The canonical NGMT v0.1 experiment executed successfully and an unchanged-protocol replay reproduced all scientific metrics, criteria, checkpoints, and the negative/inconclusive verdict. The remaining high-value reproducibility gap is an independently executed reproduction with a clean environment and explicit provenance.

This protocol exists to make that reproduction auditable. It must not be used to rescue, retune, reinterpret, or strengthen the failed mechanism-advantage claim.

## 2. Frozen scientific claim boundary

The only defensible current claim remains:

> Under the frozen NGMT v0.1 tiny-Transformer development protocol, the explicit Student-t online memory executed fairly and reproducibly but did not deliver the preregistered adverse-condition advantage over standard or Gaussian memory. The mechanism-advantage hypothesis is unsupported by this experiment.

The reproduction must preserve the verdict label `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01` unless the frozen implementation itself produces a materially different outcome under a valid clean execution. Any difference is a reproduction finding, not permission to alter the gate.

## 3. Canonical provenance anchors

A reproducer must record and verify all of the following before execution:

- protocol-freeze commits:
  - `60d03821177a179ba0aec4253e3f987103c45f87`;
  - `c077168986ebbf64a5e94eb12eff0afcf220ea56`;
  - `876e1ca64f1f756d1d426bceea42139b743872fc`;
  - `8234b335c046b893fe241d25859f84a475ab907f`;
- scientific implementation commit: `540c471c329244363e18193b4ae982ffafc00b44`;
- valid execution/fix head: `385ea6251561ed2a7b05b6a6f10307666b169b80`;
- first valid run: Actions `31661313386`;
- first valid artifact: `9166307730`;
- first valid artifact digest: `sha256:ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76`;
- first valid raw `results.json` SHA-256: `f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14`;
- unchanged-protocol replay head: `7e4547345052c3514219005fc00f396d4efa0838`;
- replay run: Actions `31661621771`;
- replay artifact: `9166406618`;
- replay artifact ZIP SHA-256: `5a34b13b54761e894b5cd3de2941c44121ea39705f8588e83aaf8a18dd2d7d06`;
- replay raw `results.json` SHA-256: `7f67822872960ed037cb4bbe66dbcd1faa99d86d7ea0b954636c5ccc37c7b684`.

If any identifier above cannot be verified, report `PROVENANCE_BLOCKED` and do not silently substitute a newer implementation.

## 4. Clean-room execution requirements

The independent reproducer must:

1. use a fresh checkout or disposable worktree/VM/container;
2. record repository remote URL and exact checked-out commit SHA;
3. record operating system, architecture, Python version, NumPy version, PyTorch version, device type, and available CPU/GPU information;
4. capture the complete command line used for invariant tests and the scientific run;
5. retain stdout/stderr and exit status;
6. retain the raw generated `results.json` before any post-processing;
7. compute SHA-256 for every retained result artifact;
8. make no edits to protocol, mechanism, seeds, data generator, training budget, metrics, thresholds, or verdict arithmetic before execution.

A dependency difference is permitted only as an observed reproduction condition. It must be recorded, not concealed, and must not be accompanied by scientific retuning.

## 5. Frozen experiment contract

The reproduction must preserve these core settings from the canonical v0.1 report:

- tiny causal Transformer, `d_model=24`;
- one Transformer encoder block;
- three attention heads;
- feed-forward width `48`;
- context length `16`;
- identical two-scalar memory projection in every arm;
- identical predictor head and training budget;
- four prediction anchors `[31,47,63,78]` over length-80 sequences;
- training seeds exactly `[11,23,37]`;
- evaluation-data seed rule exactly `10000 + training_seed`;
- 640 training sequences per seed;
- 160 validation sequences per seed;
- 120 held-out sequences per condition per seed;
- B0 no external memory;
- B1 standard similarity/kernel memory;
- B2 Gaussian-mixture probabilistic memory;
- B3 Student-t mixture memory with `nu=3` and the frozen bounded heavy-tail write influence.

The reproducer must not expand seed count, add datasets, change model scale, tune hyperparameters, or introduce post-hoc ablations inside this reproduction.

## 6. Frozen evaluation conditions

All six held-out conditions must be present:

1. `gaussian_clean`;
2. `student_t`;
3. `two_mode`;
4. `regime_switch`;
5. `outlier_bursts`;
6. `nonstationary_mixture`.

The adverse-condition aggregate must remain the unweighted mean across the five non-clean conditions, computed within each paired seed before cross-seed aggregation.

## 7. Frozen advancement gates

Do not redefine these thresholds:

- B3 mean paired adverse improvement over B2: required `>= 5%`;
- B3 mean paired adverse improvement over B1: required `>= 3%`;
- B3 mean clean-Gaussian regression versus B2: required `<= 2%`;
- no B3 divergence;
- identical trainable parameter count across B0/B1/B2/B3;
- equal B1/B2/B3 runtime-memory capacity.

The canonical result failed the first two scientific-effect gates. Reproduction is not a second chance to optimize them.

## 8. Required pre-execution checks

Before the scientific run, record:

- [ ] exact Git commit verified;
- [ ] working tree clean;
- [ ] environment manifest captured;
- [ ] invariant tests executed without source modification;
- [ ] expected four arms discovered;
- [ ] expected seeds `[11,23,37]` discovered;
- [ ] expected six held-out conditions discovered;
- [ ] no prohibited threshold or verdict edits present;
- [ ] output directory is fresh and empty.

If invariant tests fail, classify the reproduction as `EXECUTION_BLOCKED` or `ENVIRONMENT_INCOMPATIBLE`; do not patch the scientific code during the same evidentiary run.

## 9. Required retained evidence

The reproducer must retain, at minimum:

- `environment.txt` or equivalent machine-readable environment manifest;
- exact checked-out commit SHA;
- exact commands executed;
- invariant-test output;
- scientific stdout/stderr;
- raw `results.json`;
- SHA-256 manifest for retained files;
- a structured comparison report against the canonical result;
- notes for any nondeterministic runtime-only differences.

The report must distinguish scientific fields from execution metadata. Wall-clock timing differences alone are not scientific divergence.

## 10. Comparison contract

Compare the reproduction against the canonical result in this order:

1. arm and seed completeness;
2. trainable parameter counts;
3. runtime-memory capacities;
4. six-condition aggregate metric tables;
5. three paired-seed effect rows;
6. aggregate paired-effect means and sample SDs;
7. frozen criteria booleans;
8. final verdict;
9. checkpoint hashes, when determinism and dependency stack permit;
10. runtime-only fields separately.

Never round values before deciding whether a difference exists. Report both absolute and relative differences for scientific metrics when they are nonzero.

## 11. Reproduction classifications

Use exactly one primary classification:

- `REPRODUCED_EXACT`: scientific metrics, criteria, verdict, and checkpoints match exactly; runtime-only metadata may differ.
- `REPRODUCED_WITH_NUMERICAL_TOLERANCE`: scientific conclusion and all gate outcomes match, but floating-point scientific fields differ slightly. Every differing field and tolerance must be reported; this label must never be used to hide a gate crossing.
- `SCIENTIFIC_DIVERGENCE`: one or more scientific metrics materially diverge, a frozen gate changes truth value, a checkpoint diverges unexpectedly, or the final verdict differs.
- `ENVIRONMENT_INCOMPATIBLE`: the frozen code cannot validly execute in the documented clean environment without modifying scientific code.
- `PROVENANCE_BLOCKED`: the canonical code/artifact identity cannot be verified.
- `EXECUTION_BLOCKED`: execution fails for an operational reason before a valid scientific run completes.

No classification above converts the original negative result into a positive claim.

## 12. Numerical-tolerance rule

Exact reproduction is preferred. If exact floating-point identity is impossible because the independent environment differs, tolerance must be declared only after preserving raw outputs and before interpreting the comparison.

For any non-exact reproduction:

- list every field that differs;
- report canonical value, reproduced value, absolute difference, and relative difference;
- state whether any frozen threshold would change truth value;
- classify any threshold crossing as `SCIENTIFIC_DIVERGENCE`, regardless of apparent closeness;
- do not retroactively widen tolerance to obtain a preferred label.

## 13. Integrity prohibitions

The independent reproduction must not:

- tune B3 after seeing the canonical failure;
- add seeds until the effect looks favorable;
- exclude an unfavorable seed or condition;
- change the B1/B2 comparator definitions;
- alter memory capacity or parameter matching;
- change prediction anchors, sequence counts, or data seed rules;
- run the required-after-positive B3 ablations as a rescue operation;
- relabel the negative result as evidence of superiority;
- claim statistical significance from the three-seed development experiment;
- substitute regenerated artifacts for canonical originals without marking them as regenerated.

## 14. Independent reproduction report template

```text
NGMT v0.1 independent reproduction

reproducer:
date:
repository:
checked_out_sha:
working_tree_clean: yes/no
os_arch:
python:
numpy:
torch:
device:

invariant_tests:
scientific_command:
exit_status:
raw_results_sha256:
artifact_manifest_sha256:

parameter_parity:
memory_capacity_parity:
arm_seed_completeness:
metric_comparison:
paired_effect_comparison:
gate_comparison:
checkpoint_comparison:
verdict_comparison:

primary_classification:
scientific_divergences:
runtime_only_differences:
provenance_notes:
```

## 15. Stop rule after reproduction

If the independent reproduction confirms the negative/inconclusive result, archive v0.1 as reproduced negative evidence and do not keep searching the same frozen configuration for a positive outcome.

A future NGMT hypothesis may be proposed only as a new, separately preregistered experiment with explicit motivation from the failure. It must not overwrite or silently replace v0.1.

If the reproduction scientifically diverges, investigate provenance/environment causes first. Do not retune either implementation while diagnosing the discrepancy.

## 16. Current handoff

This document closes the specification gap for independent NGMT v0.1 reproduction. It does **not** perform that reproduction.

Next valid scientific action: have a separate runtime or reviewer execute the frozen implementation under this protocol, retain raw evidence, and classify the result using Section 11.