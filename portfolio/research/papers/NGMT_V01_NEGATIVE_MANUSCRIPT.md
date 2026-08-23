# NGMT v0.1: A Reproduced Negative Result Under Equal-Budget Learned Controls

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** v0.1 is frozen. No in-place retuning or rescue is permitted.

## Abstract

We evaluate NGMT v0.1 in an equal-budget learned comparison designed to test whether the B3 mechanism improves adverse-condition performance without materially degrading clean behavior. Four arms (B0–B3) were evaluated using 6,049 trainable parameters per arm, with equal 18-scalar runtime memory for B1–B3, across three paired seeds. The preregistered gates required at least 5% improvement for B3 over B2, at least 3% improvement over B1, and no more than 2% clean regression. B3 achieved only `+0.4946% ± 1.5472%` versus B2 and `+0.4393% ± 1.1529%` versus B1, failing both adverse-condition gates. Clean regression was `+0.9600% ± 2.7060%`, satisfying the clean constraint. The correct verdict is therefore negative or inconclusive for the proposed v0.1 advantage. Exact scientific replay reproduced the result. We retain this failure as the final disposition of v0.1 and require any successor to begin from a new frozen protocol.

## 1. Question

Does the B3 mechanism outperform simpler equal-budget alternatives under adverse conditions while preserving clean performance?

## 2. Frozen Hypothesis

The experiment specified three gates:

- B3 vs B2 adverse improvement `>=5%`;
- B3 vs B1 adverse improvement `>=3%`;
- B3 clean regression vs B2 `<=2%`.

Failure of either adverse gate falsifies the v0.1 superiority claim.

## 3. Experimental Design

The retained comparison uses four learned arms, B0 through B3. Each arm contains 6,049 trainable parameters. Runtime memory is matched at 18 scalars for B1, B2, and B3. Evaluation uses three paired seeds across frozen synthetic clean/adverse sequence tasks.

This design is intentionally small. Its purpose is to test the proposed mechanism under a controlled budget, not to claim broad sequence-model superiority.

## 4. Results

| Comparison | Result | Gate | Verdict |
|---|---:|---:|---|
| B3 vs B2 adverse | `+0.4946% ± 1.5472%` | `>=5%` | **FAIL** |
| B3 vs B1 adverse | `+0.4393% ± 1.1529%` | `>=3%` | **FAIL** |
| B3 clean regression vs B2 | `+0.9600% ± 2.7060%` | `<=2%` | **PASS** |

No B3 divergence was observed across the retained runs. Nevertheless, the core scientific claim fails because the proposed adverse-condition advantage is far smaller than required.

## 5. Reproducibility

Retained workflow runs include `31661313386` and `31661621771`, with artifacts `9166307730` and `9166406618`. The scientific replay reproduced the frozen outcome. This reproducibility strengthens the negative verdict rather than creating a reason to search for a favorable rerun.

## 6. Interpretation

The result distinguishes stability from usefulness. B3 can train and maintain acceptable clean behavior, but the proposed mechanism does not produce the preregistered adverse-condition improvement. Passing the clean gate cannot compensate for missing both primary benefit gates.

## 7. Limitations

The study uses only three paired seeds and synthetic tasks. The architectures are deliberately tiny. The result therefore applies to NGMT v0.1 under this protocol, not to every possible memory mechanism or larger successor.

## 8. Disposition

NGMT v0.1 is archived as a reproduced negative result. Thresholds, seeds, baselines, and the model definition must not be altered and then presented as the same experiment. A successor requires a new version, independent motivation, a fresh frozen protocol, and explicit baseline/ablation design before training.

## 9. Conclusion

NGMT v0.1 fails both preregistered adverse-condition advantage gates while satisfying its clean-regression constraint. The result is reproducible and final for this version. Its scientific value lies in a cleanly controlled negative outcome and a clear boundary for future successor work.
