# T2424-0037 NeuroCAD — Held-out Template Result v1

**Protocol frozen before execution:** `../OOD_PROTOCOL.md`  
**Frozen method:** existing `src/core.mjs`; no parser changes were made before or after the scientific benchmark result recorded here.  
**Workflow:** GitHub Actions `NeuroCAD held-out template benchmark`, run `31659488587`  
**Branch head evaluated:** `7ad4e748791d52edd8d3570f2fc0cc60a7ecec08`  
**Raw artifact:** `9165650301`  
**Artifact digest:** `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`

## Verdict

`PASS_HELD_OUT_TEMPLATE_GATE`

This is a claim-specific GREEN result for **held-out linguistic-template robustness within the existing rectangular-plate grammar**. It is not evidence of general NLP-to-CAD ability or OOD generalization to new geometry families.

## Frozen benchmark

- total: 20 cases;
- valid geometry targets: 12;
- invalid/fail-closed cases: 8;
- deterministic; no seeds;
- no post-result case, metric, or threshold changes.

## Result table

| System | Valid exact geometry | Invalid rejection | Overall success | Accepted invalid |
|---|---:|---:|---:|---:|
| Typed + validated compiler | **12/12 = 1.000** | **7/8 = 0.875** | **19/20 = 0.950** | 1 |
| Direct flat extraction | 12/12 = 1.000 | 0/8 = 0.000 | 12/20 = 0.600 | 8 |

Primary effect:

- method − direct baseline overall success: **+0.350**.

Frozen development criteria were:

- valid exact geometry ≥ 0.80;
- invalid rejection ≥ 0.80;
- overall success delta over direct baseline ≥ 0.15.

All three criteria are met.

## Preserved failure

Case `O018` remains a failure:

`plate -50 by 40 thickness 3`

The method unexpectedly accepts this input instead of rejecting the negative width. The existing dimension regex matches the positive substring rather than preserving the leading minus sign. This failure is **not repaired inside v1** because doing so after observing the frozen benchmark would contaminate the result.

Classification: `UNEXPECTED_ACCEPT / expected NON_POSITIVE_DIMENSION`.

A future parser-safety repair may fix this defect, but it must be versioned separately and the v1 result above must remain unchanged.

## Real CAD backend execution

The same 12 valid frozen cases were emitted as OpenSCAD and executed through a real CAD backend in the same evidence workflow.

- OpenSCAD: `2021.01`;
- valid cases executed: 12;
- successful non-empty STL outputs: **12/12**;
- backend verdict: `PASS_OPENSCAD_EXECUTION`.

This confirms executable CAD generation for the valid frozen cases. It does not establish manufacturing validity, topology correctness for arbitrary parts, STEP interoperability, or a production-grade CAD kernel pipeline.

## Environment

Retained workflow environment:

- Node `v22.23.1`;
- npm `10.9.8`;
- GitHub-hosted Ubuntu 24.04-class runner;
- Linux kernel `6.17.0-1020-azure`;
- OpenSCAD `2021.01`.

## Failure taxonomy observed

The method correctly rejected examples covering:

- unsupported object class;
- unsupported hole count;
- invalid hole inset/radius relation;
- dimension safety limit;
- missing hole size;
- zero thickness;
- oversized holes.

It failed the negative-width case above.

The direct baseline accepted all eight invalid cases, which is why its overall success remains 0.60 despite matching all 12 valid geometry targets.

## Claim boundary

Supported:

> The frozen deterministic typed/validated rectangular-plate compiler generalized to the fixed held-out linguistic-template set, achieved 95% task success versus 60% for a direct extraction baseline, and generated executable OpenSCAD/STL for all 12 valid target cases.

Not supported:

- arbitrary natural-language CAD;
- OOD generalization to new part families;
- superiority to LLM/code-generation CAD systems;
- same-provider model superiority (no provider model exists in this bounded package);
- manufacturing correctness;
- statistical significance from 20 deterministic cases;
- research-paper novelty.

## Next scientific gate

Do **not** retune v1. The next evidence family should be separately frozen and should add at least one of:

1. genuinely new part families with typed IR;
2. a model-based direct-generation baseline under the same target CAD representation;
3. geometric/topological validation beyond successful STL emission;
4. editability/reopen validation in a richer CAD representation;
5. ambiguity and compositional-complexity stratification.
