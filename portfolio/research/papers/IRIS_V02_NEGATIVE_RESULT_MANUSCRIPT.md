# IRIS v0.2: A Falsification-First Study of Robust Memory Under Regime Change

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** reports the frozen mixed/negative v0.2 development result. It does not claim adaptive superiority. The reserved confirmatory **experiment IDs** `1000–1029` remain unevaluated; historical development code did use some numerically overlapping derived RNG values internally, so this report does not make the broader claim that those integers never appeared in any RNG call.

## Abstract

We study whether a robust-memory estimator can separate transient outliers from persistent distributional change better than strong robust controls. The frozen IRIS v0.2 line tests a successor criterion requiring at least a 10% abrupt-regime improvement over a fixed HTAM comparator while remaining competitive with robust baselines such as Huber-family estimators. Across retained development and stress evaluations, the best supported abrupt-regime gain is approximately 5.33–5.36%, below the preregistered 10% promotion gate. The PCRW variant also fails to cleanly dominate Huber on the relevant abrupt comparison, and coherent burst outliers remain a documented adverse case. We therefore reject the broad successor-superiority claim for v0.2 and preserve the result as a bounded robustness–adaptation tradeoff. The planned confirmatory experiment family with outer IDs `1000–1029` remains quarantined and unevaluated because exact canonical development-trajectory identity/equivalence has not been recovered. This report emphasizes negative-result retention, explicit promotion gates, and provenance discipline rather than post-hoc rescue.

## 1. Introduction

Robust sequence estimators face a structural tension. An estimator that discounts sudden observations may resist isolated corruption, but the same mechanism may delay adaptation when a persistent regime shift is real. IRIS was developed to test whether memory and robust influence control can improve that tradeoff.

The central question is narrow: under a frozen synthetic development/stress protocol, does the candidate successor deliver a sufficiently large abrupt-regime advantage while remaining competitive with strong robust controls? The answer for v0.2 is no. The observed effect is localized and materially smaller than the frozen promotion threshold.

This paper contributes a reproducible mixed/negative result, a failure taxonomy, and a protocol boundary for any future successor. It does not claim that robust memory is generally ineffective.

## 2. Hypotheses and Falsifier

The frozen successor line required:

1. at least `10%` abrupt-regime improvement over fixed HTAM on the primary frozen effect statistic;
2. competitive behavior against Huber-family robust controls;
3. no hidden dependence on the reserved confirmatory experiment family;
4. no promotion if coherent burst outliers expose an unresolved failure mode.

The falsifier is therefore any development package in which the abrupt-regime improvement is below `10%`, a strong robust baseline dominates the candidate on the key abrupt comparison, or coherent burst behavior remains adverse.

## 3. Experimental Protocol

The retained protocol uses synthetic scalar/sequence settings containing heavy-tailed corruption, abrupt regime changes, and stress cases designed to distinguish one-off outliers from persistent change. Development experiment IDs are separated from the reserved confirmatory experiment family. The currently retained policy quarantines outer confirmatory IDs `1000–1029` until the complete frozen analysis plan and exact canonical trajectory identity/equivalence are established. Historical development code did use some numerically overlapping values as derived RNG seeds inside other experiment IDs; those internal RNG calls are not confirmatory evaluations and must not be conflated with the reserved confirmatory experiment family.

Primary comparators include fixed HTAM and robust Huber-family controls. Candidate memory behavior is evaluated on the frozen regime-adaptation effect statistic rather than by selecting whichever metric is most favorable after inspection.

## 4. Results

The retained development/stress evidence yields approximately `5.33–5.36%` abrupt-regime improvement over fixed HTAM. This misses the frozen `>=10%` promotion gate by a substantial margin.

The PCRW candidate does not cleanly beat Huber on the relevant abrupt comparison. Coherent burst outliers also remain adverse, demonstrating that the method's robustness behavior is sensitive to corruption structure rather than uniformly advantageous.

Accordingly:

| Claim | Verdict |
|---|---|
| `>=10%` abrupt-regime gain | **FAILED** |
| Clean dominance over robust Huber-family control | **UNSUPPORTED** |
| Broad adaptive-memory superiority | **UNSUPPORTED** |
| Localized robustness/adaptation tradeoff exists | **SUPPORTED** |
| Confirmatory experiment family evaluated | **FALSE** |

## 5. Failure Analysis

The negative result is informative for three reasons.

First, the candidate's effect is not zero: a localized improvement exists, but its magnitude is below the precommitted scientific gate. Second, strong robust baselines absorb part of the apparent benefit, which prevents attributing the effect automatically to the proposed memory mechanism. Third, coherent bursts remain difficult because observations that look like repeated corruption can be statistically confounded with genuine regime change.

These findings suggest that future work should treat robustness and adaptation as a Pareto frontier rather than as a single-axis improvement claim.

## 6. Provenance and Confirmatory Boundary

The current blocker is not a desire for more random seeds. It is exact provenance of the canonical development trajectories. Before any confirmatory evaluation, the project must recover either the exact retained observation/state trajectory corpus or an authoritative byte-identical deterministic generator/configuration record, then hash every input and freeze the analysis manifest.

Until that gate closes, the reserved outer confirmatory experiment IDs `1000–1029` remain unavailable for evaluation. This boundary is about the confirmatory experiment family, not a claim that the numeric integers `1000–1029` never appeared inside historical development RNG derivations. The current v0.2 conclusion must not be altered by tuning against the reserved confirmatory evaluation surface.

## 7. Limitations

The retained evidence is synthetic-heavy and does not establish external-data generalization. The candidate family has not been evaluated against every modern robust/changepoint method. The best observed effect is development evidence, not confirmatory evidence. Finally, the unresolved canonical-trajectory identity prevents a clean confirmatory run today.

## 8. Discussion

IRIS v0.2 is best understood as a failed successor-promotion experiment with a useful residual observation: robust memory can produce a localized tradeoff, but the current candidate does not cross the threshold needed for a broad superiority claim. Preserving that distinction is more scientifically useful than retuning the same version until it passes.

## 9. Conclusion

IRIS v0.2 does not satisfy its frozen successor gate. The retained abrupt-regime improvement is approximately 5.33–5.36%, below the required 10%, robust controls remain competitive, and coherent bursts expose a meaningful failure mode. The correct disposition is a bounded mixed/negative report, not promotion. Any future successor must be versioned separately, preregistered before confirmatory access, and evaluated only after trajectory provenance is closed.

## Reproducibility checklist

- Preserve current v0.2 results and thresholds.
- Do not evaluate the reserved confirmatory experiment family with outer IDs `1000–1029`.
- Keep internal derived RNG values distinct from confirmatory experiment IDs in all provenance claims.
- Recover and hash canonical trajectories or deterministic-equivalence evidence.
- Freeze baselines, metric, effect statistic, failure taxonomy, and analysis code.
- Run confirmatory evaluation only after those gates are independently verified.
