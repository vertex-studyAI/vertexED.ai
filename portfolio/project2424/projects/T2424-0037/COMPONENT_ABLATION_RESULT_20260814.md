# NeuroCAD Component Ablation Result — 2026-08-14

**Experiment:** `T2424-0037-neurocad-component-ablation-v2-20260814`  
**Protocol:** `NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md`  
**Source commit:** `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`  
**Workflow run:** `31777954088`  
**Artifact:** `9210587354`  
**Artifact SHA-256:** `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`  
**Environment:** Ubuntu 24.04.4 hosted runner; Node `v22.23.1`; npm `10.9.8`.  
**Contract test:** `1/1` passed.

## Frozen question

How much of the apparent advantage of the current NeuroCAD typed/validated compiler over the original direct flat-extraction baseline on the reused 20-case plate benchmark is explained by the validation/safety layer rather than by the typed/parser path itself?

This is a deterministic component diagnostic on a reused benchmark. It is not a new unseen-OOD benchmark and cannot establish general text-to-CAD ability.

## Systems

- **M2 — current typed + validated compiler.**
- **B0 — original direct flat extraction, without matched validation.**
- **B1 — direct extraction + separately implemented matched fail-closed validation.** B1 does not call `parsePlatePrompt`.

## Results

| System | Valid exact geometry | Invalid rejection | Overall success | Accepted invalid | Valid failures |
|---|---:|---:|---:|---:|---:|
| M2 typed + validated | **1.000** | **1.000** | **1.000** | 0 | 0 |
| B0 direct, no matched validation | 1.000 | 0.000 | 0.600 | 8 | 0 |
| B1 direct + matched validation | **1.000** | **1.000** | **1.000** | 0 | 0 |

Derived diagnostics:

- `original_gap = 1.000 - 0.600 = 0.400`
- `remaining_gap = 1.000 - 1.000 = 0.000`
- `validation_recovery_fraction = (1.000 - 0.600) / 0.400 = 1.000`
- frozen interpretation: **`VALIDATION_DOMINANT`**

The frozen `VALIDATION_DOMINANT` criterion required recovery fraction `>= 0.80` and remaining gap `<= 0.05`. Both conditions were satisfied decisively.

## Scientific interpretation

### Falsified on this benchmark

The old v1 gap **cannot be used as evidence that the typed/parser/IR path itself caused the observed advantage**. Once the direct extractor receives a separately implemented matched validation layer, it closes the entire 0.40 overall-success gap on this reused 20-case plate set.

This is a genuine mechanism falsification under the frozen diagnostic. Do not retune the benchmark or validation rules to recover a typed-IR advantage.

### Still supported

- the bounded NeuroCAD software pipeline remains useful as an executable, fail-closed rectangular-plate compiler;
- the frozen historical v1 result remains true as an experiment: typed/validated `19/20` versus the original weak direct baseline `12/20`, with `12/12` valid cases producing STL;
- the current implementation and matched direct+validation baseline both solve this reused diagnostic set perfectly.

### Not established

This result does **not** show that typed IR is useless in general. It does not test:

- learned direct code generation;
- constrained learned generation;
- new part-family OOD;
- compositional CAD programs;
- editability/B-rep fidelity;
- complex topology;
- independent human-authored prompts;
- matched model/provider cost and coverage.

A broader typed-IR mechanism claim therefore requires a separately frozen learned/new-family experiment. Until that experiment survives, NeuroCAD should be treated primarily as a **bounded software/product reliability contribution**, not as a demonstrated typed-IR research mechanism.

## Stop rule

This result is immutable for v2. Any new learned, OOD, parser, validator, benchmark, or representation experiment receives a new version and a pre-output freeze. The historical v1 result must not be rewritten, and the v2 component diagnostic must not be rerun with altered thresholds or cases to seek a different interpretation.
