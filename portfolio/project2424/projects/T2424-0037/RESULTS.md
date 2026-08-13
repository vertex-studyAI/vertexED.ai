# T2424-0037 NeuroCAD — reproducibility results

## Frozen controlled benchmark

The original benchmark remains a single rectangular-plate-family compiler test, not arbitrary NLP-to-CAD. Fresh exact-head reproduction at commit `f439498fa6aaf86bb9c0cb37002fcfaa2156c925` reproduced the frozen 20-case benchmark at `20/20` with all accepted geometry exact and all expected rejections preserved.

## Development OOD/safety benchmark

A separate 30-case development benchmark was frozen before execution to test paraphrase/order variation, basic `mm` wording, unsupported units/geometries, unsafe dimensions/hole layouts, and adversarial-looking text. It is explicitly **development QA, not preregistered science**.

Comparator: a transparent naive direct generator that scrapes the first two positive numbers and emits a cube. It is intentionally weak and is **not** an LLM baseline.

### Bug-before result

Pre-fix exact head: `8af9bf7183d38ccb2ae2821384a00ba4bdef2879`.

- typed-IR decision accuracy: `29/30 = 96.67%`;
- exact constraints on expected accepts: `15/15 = 100%`;
- unsafe acceptance on expected rejects: `1/15 = 6.67%`;
- generated-code safety among accepted cases: `100%`.

Failure: `plate -80 by 40 thickness 3` was accepted as width `80` because the parser regex ignored the minus sign.

### Fix

The observed failure was recorded before repair. The OOD cases and scoring were not changed. The repair added a fail-closed signed-negative numeric check and regressions for negative width, thickness, hole radius, and inset.

Implementation fix commit: `f1cb8f19db92939ca17d30e5b1f4ad2e961d0461`.  
Regression-test commit: `994255438e471124e69782355b1e0d1667c6d527`.

### Fixed rerun

Fresh exact-head workflow run `31659677450`:

| Metric | typed IR | naive direct baseline |
|---|---:|---:|
| decision accuracy | **100%** | 53.33% |
| exact constraints on expected accepts | **100%** | not defined |
| unsafe acceptance on expected rejects | **0%** | 93.33% |
| safe generated code among accepted typed cases | **100%** | n/a |

Original 20-case benchmark runtime: `0.02 s` real.  
OOD benchmark runtime: `0.02 s` real.  
Focused tests after fix: `7/7` passed.

Raw fixed OOD SHA-256: `47df9db7d5a423e340de68e3ac3929b46dab9a138e623f6252a00c8f85e5edd1`.  
Original benchmark SHA-256: `e3e15d79631d1fccd02bc2711f71e98acc1f7f686e390cd65d82fcb054e5c601`.

## Limitations

- one rectangular plate family only;
- no new CAD part families in the OOD benchmark;
- no frozen learned provider comparison;
- naive direct baseline is deliberately weak;
- no STEP/STL or CAD-kernel execution in this CI result;
- benchmark was designed after inspecting the parser and cannot be treated as confirmatory evidence.

**Conclusion:** strong controlled compiler/safety mechanics after a documented bug fix; no general NLP-to-CAD claim.
