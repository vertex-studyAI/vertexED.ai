# NeuroCAD Component Ablation Diagnostic v2 — Result

**Protocol:** `T2424-0037-neurocad-component-ablation-v2-20260814`  
**Frozen protocol/code commit:** `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`  
**Workflow:** `NeuroCAD component ablation diagnostic`  
**Run:** `31777954088`  
**Job:** `94697272368`  
**Artifact:** `9210587354`  
**Artifact ZIP SHA-256:** `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`  
**Outcome:** `VALIDATION_DOMINANT`

## Frozen result

| System | Valid exact geometry | Invalid rejection | Overall success | Accepted invalid |
|---|---:|---:|---:|---:|
| Current typed + validated compiler (M2) | 12/12 = 1.000 | 8/8 = 1.000 | 20/20 = **1.000** | 0 |
| Original direct flat extraction (B0) | 12/12 = 1.000 | 0/8 = 0.000 | 12/20 = **0.600** | 8 |
| Direct extraction + matched fail-closed validation (B1) | 12/12 = 1.000 | 8/8 = 1.000 | 20/20 = **1.000** | 0 |

Derived diagnostics:

- `original_gap = 1.000 - 0.600 = 0.400`
- `remaining_gap = 1.000 - 1.000 = 0.000`
- `validation_recovery_fraction = (1.000 - 0.600) / 0.400 = 1.000`
- frozen interpretation: **`VALIDATION_DOMINANT`**

The frozen classification rule required `validation_recovery_fraction >= 0.80` and `remaining_gap <= 0.05` for `VALIDATION_DOMINANT`; both conditions are satisfied.

## Scientific interpretation

This result **falsifies the stronger v1 mechanism interpretation** that the observed 19/20 versus 12/20 held-out-template advantage demonstrates a specific typed-parser/typed-IR advantage on that benchmark. Once the simple direct extractor receives a matched fail-closed validation layer, it matches the current typed/validated compiler at 20/20 on the reused diagnostic cases.

The evidence therefore supports a narrower mechanism statement:

> On this bounded reused 20-case rectangular-plate diagnostic, the original performance gap over the flat extractor is fully explained by the absence of a matched validation/safety layer; the benchmark does not isolate an additional typed-parser advantage.

This is useful evidence. It removes an unsupported mechanism claim before the more expensive learned direct-vs-IR experiment.

## Important boundary: current implementation versus frozen v1

The original v1 evidence remains unchanged and must continue to be reported exactly as it occurred:

- v1 typed/validated compiler: 19/20;
- v1 direct flat extraction: 12/20;
- preserved v1 negative-width failure `O018`;
- v1 valid OpenSCAD/STL execution: 12/12.

The current implementation includes the separately versioned post-v1 negative-number repair, so the current M2 arm scores 20/20. This diagnostic does **not** rewrite v1 to 20/20 and does not erase its failure.

## Verification

GitHub Actions completed successfully on Ubuntu 24.04 with Node `v22.23.1` and npm `10.9.8`.

The independent frozen contract test passed:

- tests: 1
- passed: 1
- failed: 0

The retained artifact contains the environment capture, raw JSON result and test output.

## Consequences for claims

### Supported

- fail-closed validation is sufficient to recover the original B0 gap on this reused bounded diagnostic;
- the old flat-extractor comparison was confounded by unmatched validation;
- v1 remains a valid engineering robustness result, but not evidence for a typed-parser mechanism by itself.

### Not supported

- typed IR is useless in general;
- direct LLM code generation will match typed IR;
- arbitrary NLP-to-CAD is solved;
- validation is the only possible benefit of typed representations on broader tasks;
- the current 20-case reused diagnostic provides independent OOD evidence;
- research-paper novelty follows from this component result.

## Next gate

Proceed only with the separately preregistered **same-model learned direct-generation vs typed-IR** experiment. That study must use a new fixed benchmark and matched model/budget, because this diagnostic has now shown that the original deterministic flat baseline is not dangerous enough for a mechanism claim.

Do not retune this diagnostic. Do not strengthen its conclusion beyond the bounded benchmark.
